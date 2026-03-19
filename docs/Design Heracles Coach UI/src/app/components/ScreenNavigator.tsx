import { Link, useLocation } from "react-router";
import { Home, Bell, LogIn } from "lucide-react";

export function ScreenNavigator() {
  const location = useLocation();

  const screens = [
    { path: "/", label: "Login", icon: LogIn },
    { path: "/main", label: "Main", icon: Home },
    { path: "/notification", label: "Notification", icon: Bell },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl">
        {screens.map((screen) => {
          const Icon = screen.icon;
          const isActive = location.pathname === screen.path;
          return (
            <Link
              key={screen.path}
              to={screen.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{screen.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
