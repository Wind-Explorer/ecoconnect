import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function SpringboardButton({
  title,
  subtitle,
  imageSrc,
  linkToPage,
}: {
  title: string;
  subtitle: string;
  imageSrc: string;
  linkToPage: string;
}) {
  const navigate = useNavigate();
  return (
    <Button
      onPress={() => {
        navigate(linkToPage);
      }}
      className="relative border-4 border-primary-500 text-white p-0"
    >
      <img
        src={imageSrc}
        alt={title}
        className="absolute w-full h-full inset-0 object-cover brightness-50"
      />
      <div className="relative flex flex-col justify-between w-full h-full py-4 px-6 text-left *:text-wrap transition-colors hover:bg-primary-500">
        <p className="text-2xl font-semibold">{title}</p>
        <p>{subtitle}</p>
      </div>
    </Button>
  );
}
