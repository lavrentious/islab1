import React from "react";
import CarPage from "src/modules/cars/pages/CarPage";
import CarsPage from "src/modules/cars/pages/CarsPage";
import NotFoundPage from "src/modules/common/pages/NotFoundPage";
import SettingsPage from "src/modules/common/pages/SettingsPage";
import HumanBeingPage from "src/modules/humanbeings/pages/HumanBeingPage";
import MainPage from "src/modules/humanbeings/pages/MainPage";

export type Route = {
  path: string;
  element: React.ReactNode;
};
const routes: Route[] = [
  { element: <MainPage />, path: "/" },
  { element: <HumanBeingPage />, path: "/humanbeings/:id" },
  { element: <CarPage />, path: "/cars/:id" },
  { element: <CarsPage />, path: "/cars" },
  { element: <SettingsPage />, path: "/settings" },
  { element: <NotFoundPage />, path: "/*" },
];

export default routes;
