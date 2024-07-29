import { Toaster } from "react-hot-toast";
import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";
import { Outlet } from "react-router-dom";

export default function GlobalLayout() {
  return (
    <div className="relative flex flex-col border-4 border-red-500">
      <SingaporeAgencyStrip />
      <main className="h-min">
        <Outlet />
      </main>

      {/*
      A div that becomes black in dark mode to cover white color parts
      of the website when scrolling past the window's original view.
      */}
      <div className="fixed -z-50 dark:bg-black inset-0 w-full h-full"></div>
      <Toaster />
    </div>
  );
}
