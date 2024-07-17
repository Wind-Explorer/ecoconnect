import { Toaster } from "react-hot-toast";
import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";
import AdministratorNavigationPanel from "../components/AdministratorNavigationPanel";

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-full">
      <SingaporeAgencyStrip />
      <div className="flex flex-row h-full ">
        <div className="h-full z-50">
          <AdministratorNavigationPanel />
        </div>
        <main className="flex-grow">{children}</main>
      </div>
      <Toaster />

      {/*
      A div that becomes black in dark mode to cover white color parts
      of the website when scrolling past the window's original view.
      */}
      <div className="fixed -z-50 dark:bg-black inset-0 w-full h-full"></div>
    </div>
  );
}
