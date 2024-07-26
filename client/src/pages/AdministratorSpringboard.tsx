import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTimeOfDay } from "../utilities";
import { retrieveUserInformation } from "../security/users";
import UserProfilePicture from "../components/UserProfilePicture";
import { Button, Card } from "@nextui-org/react";
import { PencilSquareIcon } from "../icons";
import EcoconnectFullLogo from "../components/EcoconnectFullLogo";

export default function AdministratorSpringboard() {
  const navigate = useNavigate();
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/signin");
  }
  const [userInformation, setUserInformation] = useState<any>();
  let timeOfDay = getTimeOfDay();

  let greeting = "";
  if (timeOfDay === 0) {
    greeting = "Good morning";
  } else if (timeOfDay === 1) {
    greeting = "Good afternoon";
  } else if (timeOfDay === 2) {
    greeting = "Good evening";
  }

  useEffect(() => {
    retrieveUserInformation()
      .then((response) => {
        if (response.accountType != 2) {
          navigate("/");
        }
        setUserInformation(response);
      })
      .catch(() => {
        navigate("/signin");
      });
    return;
  }, []);
  return (
    <div>
      {userInformation && (
        <div className="flex flex-col w-full pb-2">
          <div className="flex flex-row justify-between p-8 pt-14 *:my-auto">
            <div className="flex flex-col gap-3">
              <p className="text-3xl font-bold">
                {greeting}, {userInformation.firstName}.
              </p>
              <div className="flex flex-row gap-2 *:my-auto">
                <p className="text-xl">A staff member of</p>
                <EcoconnectFullLogo />
              </div>
              <p className="text-primary-500">{userInformation.email}</p>
              <Button
                className="w-max"
                size="sm"
                variant="flat"
                color="primary"
                startContent={
                  <div className="scale-80">
                    <PencilSquareIcon />
                  </div>
                }
                onPress={() => {
                  navigate("/manage-account");
                }}
              >
                Manage your account
              </Button>
            </div>
            <UserProfilePicture userId={userInformation.id} editable={false} />
          </div>
          <div className="flex flex-row justify-stretch *:w-full *:h-56 w-full p-4 pt-0 gap-4"></div>
          <Card className="w-full bg-primary-500 p-8 text-white rounded-r-none">
            <div className="flex flex-col gap-4">
              <p className="font-bold text-4xl">Statistics Overview</p>
              <div className="h-[500px] w-full bg-primary-600 rounded-2xl flex flex-row p-6">
                <div className="w-60 flex flex-col justify-between">
                  <div className="flex flex-col">
                    <p className="text-2xl">User Count</p>
                    <p className="opacity-70">(past 30 days)</p>
                  </div>
                  <p className="text-lg">
                    Total: <span className="font-bold">2139</span> users
                  </p>
                </div>
                <div className="w-full h-full bg-white rounded-xl">
                  {/* TODO: Graph */}
                  <p className="text-black">GRAPH HERE</p>
                </div>
              </div>
              <div className="h-[500px] w-full bg-primary-600 rounded-2xl flex flex-row p-6">
                <div className="w-60 flex flex-col justify-between">
                  <p className="text-2xl">Population Distribution</p>
                </div>
                <div className="w-full h-full bg-white rounded-xl">
                  {/* TODO: Graph */}
                  <p className="text-black">GRAPH HERE</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
