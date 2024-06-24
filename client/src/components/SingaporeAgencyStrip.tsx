import { Link } from "@nextui-org/react";

export default function SingaporeAgencyStrip() {
  return (
    <div className="h-8 bg-neutral-200 text-black relative">
      <div className="flex flex-row gap-2 *:my-auto pl-16 h-full text-sm">
        <img src="../assets/Merlion.svg" alt="Merlion Icon" className="w-6" />
        <p>A Singapore Government Agency Website</p>
        <Link size="sm">How to identify</Link>
      </div>
    </div>
  );
}
