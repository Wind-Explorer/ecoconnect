import { useNavigate } from "react-router-dom";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { Button, Card, Link } from "@nextui-org/react";
import { LockClosedIcon, PencilSquareIcon } from "../icons";
import SpringboardButton from "../components/SpringboardButton";
import { getTimeOfDay } from "../utilities";
import { retrieveUserInformation } from "../security/users";
import UserProfilePicture from "../components/UserProfilePicture";

export default function SpringboardPage() {
  const navigate = useNavigate();
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/signin");
  }
  let [userInformation, setUserInformation] = useState<any>();
  let [accountUnavailable, setAccountUnavaliable] = useState(false);
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
        setUserInformation(response);
      })
      .catch((_) => {
        setAccountUnavaliable(true);
      });
    return;
  }, []);

  return (
    <DefaultLayout>
      <div>
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
                    navigate("/manage-account/");
                  }}
                >
                  Manage your account
                </Button>
              </div>
              <UserProfilePicture
                userId={userInformation.id}
                editable={false}
              />
            </div>
            <div className="flex flex-row justify-stretch *:w-full *:h-56 w-full p-4 pt-0 gap-4">
              <SpringboardButton
                title="Community Forums"
                subtitle="Be involved in discussions among your neighbourhood"
                linkToPage=""
              ></SpringboardButton>
              <SpringboardButton
                title="Events"
                subtitle="Participate in exciting upcoming events around Singapore"
                linkToPage=""
              ></SpringboardButton>
              <SpringboardButton
                title="Home Bill Contest"
                subtitle="Save resources, win vouchers!"
                linkToPage=""
              ></SpringboardButton>
              <SpringboardButton
                title="Karang Guni Scheduling"
                subtitle="Arrange doorstep sales for your old gears with Karang Guni"
                linkToPage="/schedule"
              ></SpringboardButton>
            </div>
            <div className="w-full h-[600px] bg-red-500"></div>
          </div>
        )}
      </div>
      <div>
        {accountUnavailable && (
          <div className="m-8 flex flex-col gap-4">
            <Card>
              <div className="flex flex-col m-8 gap-8">
                <div className="rounded-xl flex flex-col gap-8 p-4 justify-center bg-red-500 text-center text-white">
                  <div className="pt-10 w-full flex flex-row justify-center scale-150">
                    <div className="scale-150 pb-2">
                      <LockClosedIcon />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col">
                      <p className="text-4xl font-bold">Account unavailable.</p>
                      <p className="text-xl opacity-70">
                        This account has been archived.
                      </p>
                    </div>
                    <p>
                      If you wish to recover the account, please{" "}
                      <Link className="text-white px-1 rounded-md bg-red-400">
                        contact us
                      </Link>
                    </p>
                    <div className="w-min mx-auto"></div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="w-min mx-auto">
                    <Button color="primary" onPress={() => navigate("/signin")}>
                      Sign in with a different account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-8 flex flex-col gap-4">
                <p className="text-2xl font-semibold">Why am I seeing this?</p>
                <div className="flex flex-col gap-2">
                  <p>
                    You have attempted to access an account that has been
                    archived.
                  </p>
                  <p>
                    This may due to, either manual operation by the owner of the
                    account, or administrative decision from the management
                    team.
                  </p>
                  <p>
                    The information related to this account remains, however the
                    access to the account will not be available.
                  </p>
                  <p>
                    If you believe that this is incorrect, or would like to
                    request an unarchive, please <Link>contact us</Link>.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
