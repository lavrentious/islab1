import React from "react";
import NotFoundPage from "src/modules/common/pages/NotFoundPage";
import SettingsPage from "src/modules/common/pages/SettingsPage";
import MainPage from "src/modules/lab/pages/MainPage";


export type Route = {
  path: string;
  element: React.ReactNode;
};
const routes: Route[] = [
  { element: <MainPage />, path: "/" },
  { element: <SettingsPage />, path: "/settings" },
  { element: <NotFoundPage />, path: "/*" },
];

export default routes;
