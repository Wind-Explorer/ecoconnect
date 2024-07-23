import { Link } from "@nextui-org/react";

export default function SingaporeAgencyStrip() {
  return (
    <div className="bg-neutral-200 text-black relative p-1">
      <div className="mx-auto w-full flex flex-row gap-2 *:my-auto h-full text-sm max-w-7xl pl-4">
        <img src="../assets/Merlion.svg" alt="Merlion Icon" className="w-6" />
        <p>A Singapore Government Agency Website</p>
        <Link size="sm" className="text-blue-500">
          How to identify
        </Link>
      </div>
    </div>
  );
}
