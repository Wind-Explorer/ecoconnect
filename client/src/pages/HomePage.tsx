import { useNavigate } from "react-router-dom";
import { ChevronDoubleDownIcon } from "../icons";
import { Card, ScrollShadow } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
export default function HomePage() {
  const navigate = useNavigate();
  const [userInformation, setUserInformation] = useState<any>();

  useEffect(() => {
    retrieveUserInformation()
      .then((value) => {
        setUserInformation(value);
      })
      .catch();
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
              Trending events right now
            </p>
            <ScrollShadow className="flex flex-row gap-6 w-full p-8">
              {[...Array(8)].map((_, index) => (
                <Card
                  key={index}
                  className="p-4 min-w-80 h-64 flex flex-col gap-4"
                >
                  <div className="border-2 rounded-xl h-full"></div>
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">
                      Sample event {index + 1}
                    </p>
                    <p>Description of the sample event {index + 1}</p>
                  </div>
                </Card>
              ))}
            </ScrollShadow>
          </div>
        </div>
      </div>
    </div>
  );
}
