import { motion } from "motion/react";
import { Activity, X } from "lucide-react";
import { ScreenNavigator } from "./ScreenNavigator";

export function NotificationScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-start justify-center p-4 pt-20">
      {/* Blur background */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />

      {/* Notification Card - Version 1 */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">Heracles Coach</span>
                <span className="text-xs text-gray-400">now</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                Your workout this morning improved recovery by 6%. Consider a high-protein
                meal.
              </p>
            </div>

            {/* Close button */}
            <button className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notification Card - Version 2 (Alternative style) */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
        className="relative w-full max-w-md mt-4"
      >
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl shadow-purple-500/10">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">Heracles Coach</span>
                <span className="text-xs text-gray-400">2m ago</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                <span className="font-medium text-purple-300">Heracles Coach has said:</span>{" "}
                your workout this morning increased your strain by 8 points and boosted
                cardiovascular performance.
              </p>
            </div>

            {/* Close button */}
            <button className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 text-center"
      >
        <p className="text-sm text-gray-500">iOS-style push notifications</p>
      </motion.div>

      <ScreenNavigator />
    </div>
  );
}