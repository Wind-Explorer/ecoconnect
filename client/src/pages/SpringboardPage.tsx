import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, Link } from "@nextui-org/react";
import { PencilSquareIcon } from "../icons";
import SpringboardButton from "../components/SpringboardButton";
import { getTimeOfDay } from "../utilities";
import { retrieveUserInformation } from "../security/users";
import UserProfilePicture from "../components/UserProfilePicture";
import instance from "../security/http";
import config from "../config";

export default function SpringboardPage() {
  const navigate = useNavigate();
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/signin");
  }
  const [userInformation, setUserInformation] = useState<any>();
  const [events, setEvents] = useState<any[]>([]);
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
        if (response.accountType == 2) {
          navigate("/admin");
        }
        setUserInformation(response);
      })
      .catch((_) => {
        navigate("/account-inaccessible");
      });

    instance.get("/events").then((response) => {
      setEvents(response.data);
    });
    return;
  }, []);

  return (
    <div className="w-full h-full">
      <div>
        {userInformation && (
          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between p-8 *:my-auto">
              <div className="flex flex-col gap-4">
                <p className="text-3xl font-bold">
                  {greeting}, {userInformation.firstName}.
                </p>
                <p>
                  Resident of{" "}
                  <Link>
                    {userInformation.townCouncil.length > 0
                      ? userInformation.townCouncil
                      : "Unknown"}{" "}
                    Town Council
                  </Link>
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
                imageSrc="../assets/community-forums.png"
                linkToPage="/community-posts"
              ></SpringboardButton>
              <SpringboardButton
                title="Events"
                subtitle="Participate in exciting upcoming events around Singapore"
                imageSrc="../assets/events.png"
                linkToPage="/events"
              ></SpringboardButton>
              <SpringboardButton
                title="Home Bill Contest"
                subtitle="Save resources, win vouchers!"
                imageSrc="../assets/home-bill-contest.png"
                linkToPage="/home-bill-contest"
              ></SpringboardButton>
              <SpringboardButton
                title="Karang Guni Scheduling"
                subtitle="Arrange doorstep sales for your old gears with Karang Guni"
                imageSrc="../assets/karang-guni.png"
                linkToPage="/karang-guni-schedules"
              ></SpringboardButton>
            </div>
            <div className="w-full  bg-primary-500 text-white">
              {events.length > 0 && (
                <div className="p-10 flex flex-col gap-10">
                  <p className="text-3xl font-bold">Registered events</p>
                  <div className="flex flex-col gap-4">
                    {events.map((event, index) => (
                      <Card
                        key={index}
                        className="bg-primary-700 border-2 border-primary-400"
                      >
                        <div className="flex flex-row justify-between *:my-auto p-2 pr-8">
                          <div className="flex flex-row gap-4 *:my-auto">
                            <img
                              className="w-20 h-20 object-cover rounded-xl"
                              src={`${config.serverAddress}/events/evtPicture/${event.id}`}
                              alt="event"
                            />
                            <div className="flex flex-col gap-2">
                              <p className="text-lg">{event.title}</p>
                              <p className="text-sm opacity-70">
                                Happening on{" "}
                                <span className="font-bold">
                                  {new Date(event.date).toDateString()}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="flat"
                            onPress={() => {
                              navigate(`/events/view/${event.id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="w-full *:mx-auto text-center flex flex-col gap-4">
                    <p>Need to get in touch regarding your attendance?</p>
                    <Button
                      className="bg-white text-primary-500"
                      onPress={() => {
                        navigate("/feedback");
                      }}
                    >
                      Contact the group
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
