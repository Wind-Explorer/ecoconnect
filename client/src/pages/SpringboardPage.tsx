import { useNavigate, useParams } from "react-router-dom";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { Button, Link } from "@nextui-org/react";
import { PencilSquareIcon } from "../icons";
import SpringboardButton from "../components/SpringboardButton";
import { getTimeOfDay } from "../utilities";
import { retrieveUserInformation } from "../security/users";

export default function SpringboardPage() {
  let { accessToken } = useParams<string>(); // TODO: Replace AT from props with AT from localstorage
  let [userInformation, setUserInformation] = useState<any>();
  let timeOfDay = getTimeOfDay();

  const navigate = useNavigate();

  let greeting = "";
  if (timeOfDay === 0) {
    greeting = "Good morning";
  } else if (timeOfDay === 1) {
    greeting = "Good afternoon";
  } else if (timeOfDay === 2) {
    greeting = "Good evening";
  }

  useEffect(
    () => retrieveUserInformation(accessToken!, setUserInformation),
    []
  );

  return (
    <DefaultLayout>
      {userInformation && (
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between p-8 *:my-auto">
            <div className="flex flex-col gap-4">
              <p className="text-3xl font-bold">
                {greeting}, {userInformation.firstName}.
              </p>
              <p>
                Resident of <Link>Bishan-Toa Payoh Town Council</Link>
              </p>
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
                  navigate("/manage-account/" + accessToken);
                }}
              >
                Manage your account
              </Button>
            </div>
            <div className="bg-red-500 w-40 h-40 rounded-full"></div>
          </div>
          <div className="flex flex-row justify-stretch *:w-full *:h-56 w-full p-4 pt-0 gap-4">
            <SpringboardButton
              title="Community Forums"
              subtitle="Be involved in discussions among your neighbourhood"
            ></SpringboardButton>
            <SpringboardButton
              title="Events"
              subtitle="Participate in exciting upcoming events around Singapore"
            ></SpringboardButton>
            <SpringboardButton
              title="Home Bill Contest"
              subtitle="Save resources, win vouchers!"
            ></SpringboardButton>
            <SpringboardButton
              title="Karang Guni Scheduling"
              subtitle="Arrange doorstep sales for your old gears with Karang Guni"
            ></SpringboardButton>
          </div>
          <div className="w-full h-[600px] bg-red-500"></div>
        </div>
      )}
    </DefaultLayout>
  );
}
