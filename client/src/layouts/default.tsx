import SingaporeAgencyStrip from "../components/SingaporeAgencyStrip";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <SingaporeAgencyStrip />
      <main className=" flex-grow">{children}</main>
    </div>
  );
}
