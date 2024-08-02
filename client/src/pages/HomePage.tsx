import { useNavigate } from "react-router-dom";
import { ChevronDoubleDownIcon } from "../icons";
import { Button, button, Card, Chip, ScrollShadow } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import instance from "../security/http";
import config from "../config";
export default function HomePage() {
  // TODO: Move all interfaces into a single file
  interface Event {
    id: number;
    title: string;
    category: string;
    location: string;
    time: string;
    description: string;
    evtPicture: string; // Changed to evtPicture
  }

  const navigate = useNavigate();
  const [userInformation, setUserInformation] = useState<any>();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    retrieveUserInformation()
      .then((value) => {
        setUserInformation(value);
      })
      .catch();
    try {
      instance.get<Event[]>(`${config.serverAddress}/events`).then((res) => {
        setEvents(res.data);
      });
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  });
  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative w-full h-screen -mt-16 z-10 text-white flex flex-col">
        <video
          autoPlay
          loop
          muted
          className="absolute object-cover w-full h-screen -z-10 brightness-50"
          src="../assets/hdb-bg.mp4"
        ></video>
        <div className="p-10 w-full h-full flex flex-col justify-center">
          <div className="flex flex-col gap-8">
            <div className="w-60">
              <img
                src="../assets/ecoconnectFull.svg"
                alt="ecoconnect logo"
                className="invert hue-rotate-180"
              />
            </div>
            <p className="text-5xl font-bold max-w-[600px]">
              Connecting neighbourhoods together
            </p>
            <div className="flex flex-row gap-4">
              <button
                className="border-2 px-6 py-3 rounded-xl text-white border-primary-500 bg-primary-500 hover:bg-primary-400 active:bg-primary-700 transition-colors text-xl"
                onClick={() => {
                  navigate(userInformation ? "/springboard" : "/signup");
                }}
              >
                {userInformation && "Go to the Dashboard"}
                {!userInformation && "Get started"}
              </button>
              <button className="border-2 px-6 py-3 rounded-xl text-white border-neutral-500 backdrop-blur-lg hover:brightness-150 active:brightness-110 text-xl">
                Learn more
              </button>
            </div>
          </div>
        </div>
        <div className="z-10 pb-16 mx-auto *:mx-auto flex flex-col gap-4 opacity-50">
          <p>Scroll for more</p>
          <ChevronDoubleDownIcon />
        </div>
      </div>
      <div className=" flex flex-col">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-semibold px-8 pt-8">
              Events happening right now
            </p>
            <ScrollShadow className="flex flex-row gap-6 w-full p-8">
              {events.map((event, index) => (
                <Card
                  key={index}
                  className="p-4 min-w-80 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-4">
                    <img
                      alt={event.title}
                      src={`${config.serverAddress}/events/evtPicture/${event.id}`}
                      className="rounded-xl h-48 object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-bold text-wrap overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {event.title}
                      </p>
                      <p className="text-wrap overflow-hidden overflow-ellipsis line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-row gap-2">
                        <Chip>{event.category}</Chip>
                        <Chip>{event.time}</Chip>
                      </div>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={() => {
                      navigate(`/events/view/${event.id}`);
                    }}
                  >
                    Visit
                  </Button>
                </Card>
              ))}
              <Button
                size="lg"
                color="primary"
                className="my-auto"
                onPress={() => {
                  navigate("/events");
                }}
              >
                See all →
              </Button>
            </ScrollShadow>
          </div>
        </div>
      </div>
    </div>
  );
}
