import { Toaster } from "react-hot-toast";
import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";
import NavigationBar from "../components/NavigationBar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <SingaporeAgencyStrip />
      <main className="pt-16 flex-grow">{children}</main>
      <Toaster />
      <NavigationBar />
    </div>
  );
}
