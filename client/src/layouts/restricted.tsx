import { Outlet, useNavigate } from "react-router-dom";
import EcoconnectFullLogo from "../components/EcoconnectFullLogo";
import { Button, Card } from "@nextui-org/react";

export default function RestrictedLayout() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 p-8 w-full h-full flex flex-col justify-center">
      <div className="flex flex-row justify-center">
        <div className="flex flex-col gap-8 *:mx-auto">
          <Card className="max-w-[800px] w-full mx-auto p-8">
            <Outlet />
          </Card>
          <div className="flex flex-row gap-2 *:my-auto">
            <Button
              variant="light"
              onPress={() => {
                navigate("/");
              }}
            >
              <EcoconnectFullLogo />
            </Button>
            <div className="flex flex-row gap-6">
              <p>·</p>
              <p className="opacity-50">
                © Copyright {new Date().getFullYear()}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
