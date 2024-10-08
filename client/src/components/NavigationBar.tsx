import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";

import {
  ArrowRightStartOnRectangleIcon,
  PencilSquareIcon,
  RocketLaunchIcon,
  VoucherIcon,
} from "../icons";

import config from "../config";
import { retrieveUserInformation } from "../security/users";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EcoconnectFullLogo from "./EcoconnectFullLogo";
import EcoconnectSearch from "./EcoconnectSearch";

export default function NavigationBar() {
  const [userProfileImageURL, setUserProfileImageURL] = useState("");
  const [userInformation, setUserInformation] = useState<any>();
  const [doneLoading, setDoneLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    retrieveUserInformation()
      .then((value) => {
        if (value.accountType == 2) navigate("/admin");
        setUserProfileImageURL(
          `${config.serverAddress}/users/profile-image/${value.id}`
        );
        setUserInformation(value);
      })
      .finally(() => {
        setDoneLoading(true);
      });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={
        isScrolled
          ? "transition-all fixed w-full p-2 z-50"
          : "transition-all fixed w-full p-2 z-50 mt-8"
      }
    >
      <div className="relative bg-primary-50 dark:bg-primary-800 border-2 border-primary-100 dark:border-primary-950 shadow-lg w-full h-full rounded-xl flex flex-col justify-center p-1">
        <div className="w-full flex flex-row justify-between gap-4">
          <div className="flex flex-row gap-0 my-auto *:my-auto">
            <Button
              variant="light"
              size="sm"
              onPress={() => {
                navigate("/");
              }}
            >
              <EcoconnectFullLogo />
            </Button>
            <div className="flex flex-row *:my-auto *:text-primary-800 dark:*:text-primary-100">
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  navigate("/events");
                }}
              >
                <p className="text-lg">Events</p>
              </Button>
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  navigate("/karang-guni-schedules");
                }}
              >
                <p className="text-lg">Schedules</p>
              </Button>
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  navigate("/home-bill-contest");
                }}
              >
                <p className="text-lg">HB Contest</p>
              </Button>
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  navigate("/community-posts");
                }}
              >
                <p className="text-lg">Community Forums</p>
              </Button>
            </div>
          </div>
          {userInformation && (
            <div className="my-auto pr-1 flex flex-row justify-end">
              <div className="flex flex-row gap-2 w-min">
                <EcoconnectSearch />
                <Dropdown placement="bottom" backdrop="blur">
                  <DropdownTrigger>
                    <Avatar src={userProfileImageURL} as="button" size="sm" />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions">
                    <DropdownSection showDivider>
                      <DropdownItem key="account-overview" isReadOnly>
                        <div className="flex flex-col gap-2 text-center *:mx-auto p-2 w-full">
                          <Avatar
                            src={userProfileImageURL}
                            as="button"
                            size="lg"
                            isBordered
                          />
                          <div className="flex flex-col">
                            <p>Signed in as</p>
                            <p className="text-lg font-bold">
                              <span>{userInformation.firstName}</span>{" "}
                              <span>{userInformation.lastName}</span>
                            </p>
                            <p className="opacity-50">
                              {userInformation.email}
                            </p>
                          </div>
                        </div>
                      </DropdownItem>
                      <DropdownItem
                        key="dashboard"
                        title="Dashboard"
                        startContent={<RocketLaunchIcon />}
                        onPress={() => {
                          navigate("/springboard");
                        }}
                      />
                      <DropdownItem
                        key="manage-account"
                        title="Manage your account"
                        startContent={<PencilSquareIcon />}
                        onPress={() => {
                          navigate("/manage-account");
                        }}
                      />
                      <DropdownItem
                        key="user-voucher"
                        title="Voucher"
                        startContent={<VoucherIcon />}
                        onPress={() => {
                          navigate("/user-voucher");
                        }}
                      />
                    </DropdownSection>
                    <DropdownItem
                      key="signout"
                      startContent={<ArrowRightStartOnRectangleIcon />}
                      color="danger"
                      title="Sign out"
                      onPress={() => {
                        localStorage.clear();
                        window.location.href = "/";
                      }}
                    />
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          )}
          {!userInformation && doneLoading && (
            <div className="flex flex-row gap-1 *:my-auto">
              <Button
                variant="light"
                color="primary"
                size="sm"
                onPress={() => {
                  navigate("/signin");
                }}
              >
                <p className="text-lg">Sign in</p>
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => {
                  navigate("/signup");
                }}
              >
                <p className="text-lg">Sign up</p>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
