import { Toaster } from "react-hot-toast";
import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";
import NavigationBar from "../components/NavigationBar";
import { Outlet } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

export default function DefaultLayout() {
  return (
    <div className="relative flex flex-col justify-between h-screen">
      <div className="flex flex-col h-screen">
        <SingaporeAgencyStrip />
        <main className="pt-16 flex-grow">
          <Outlet />
        </main>
      </div>
      <SiteFooter />
      <Toaster />
      <NavigationBar />

      {/*
      A div that becomes black in dark mode to cover white color parts
      of the website when scrolling past the window's original view.
      */}
      <div className="fixed -z-50 dark:bg-black inset-0 w-full h-full"></div>
    </div>
  );
}
