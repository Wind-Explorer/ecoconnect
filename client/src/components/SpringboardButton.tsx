import { Button } from "@nextui-org/react";

export default function SpringboardButton({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Button className="border-4 border-red-500 bg-neutral-700 hover:bg-red-500 text-white">
      <div className="flex flex-col justify-between w-full h-full py-4 px-2 text-left *:text-wrap mr-16">
        <p className="text-2xl font-semibold">{title}</p>
        <p>{subtitle}</p>
      </div>
    </Button>
  );
}
