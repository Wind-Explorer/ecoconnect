import { Button } from "@nextui-org/react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdministratorNavigationPanelNavigationButton({
  text,
  icon,
  onClickRef,
}: {
  text: string;
  icon: React.JSX.Element;
  onClickRef: string;
}) {
  const navigate = useNavigate();
  return (
    <Button
      variant="light"
      onPress={() => {
        navigate(onClickRef);
      }}
    >
      <div className="flex flex-row gap-2 w-full *:my-auto">
        <div className="text-primary-500">{icon}</div>
        <p>{text}</p>
      </div>
    </Button>
  );
}
