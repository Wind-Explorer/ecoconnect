import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full">
      <p>Home</p>
      <Button
        onPress={() => {
          navigate("/signup");
        }}
      >
        Sign up!
      </Button>
    </div>
  );
}
