import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../layouts/default";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <DefaultLayout>
      <p>Home</p>
      <Button
        onPress={() => {
          navigate("/signup");
        }}
      >
        Sign up!
      </Button>
    </DefaultLayout>
  );
}
