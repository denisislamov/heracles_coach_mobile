import { createBrowserRouter } from "react-router";
import { LoginScreen } from "./components/LoginScreen";
import { MainScreen } from "./components/MainScreen";
import { NotificationScreen } from "./components/NotificationScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginScreen,
  },
  {
    path: "/main",
    Component: MainScreen,
  },
  {
    path: "/notification",
    Component: NotificationScreen,
  },
]);
