import {
  Avatar,
  Button,
  Card,
  CircularProgress,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
} from "@nextui-org/react";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  TagIcon,
  GiftTopIcon,
  ChatBubbleOvalLeftIcon,
  ChevronLeftIcon,
  ArrowRightStartOnRectangleIcon,
  UsersIcon,
} from "../icons";
import EcoconnectFullLogo from "./EcoconnectFullLogo";
import { retrieveUserInformation } from "../security/users";
import { useEffect, useState } from "react";
import config from "../config";
import AdministratorNavigationPanelNavigationButton from "./AdministratorNavigationPanelNavigationButton";
import EcoconnectLogo from "./EcoconnectLogo";
import { useNavigate } from "react-router-dom";

export default function AdministratorNavigationPanel() {
  const [userInformation, setUserInformation] = useState<any>();
  const [userProfileImageURL, setUserProfileImageURL] = useState("");
  const [panelVisible, setPanelVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    retrieveUserInformation()
      .then((value) => {
        if (!value || value.accountType != 2) {
          navigate("/");
        }
        setUserInformation(value);
        setUserProfileImageURL(
          `${config.serverAddress}/users/profile-image/${value.id}`
        );
      })
      .catch(() => {
        navigate("/signin");
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
    <div className="h-full">
      <div
        className={`fixed transition-all ${isScrolled ? "top-2" : "top-10"
          } left-2`}
      >
        <div className="bg-white rounded-full z-40">
          <Button
            isIconOnly
            size="lg"
            color="primary"
            variant="flat"
            radius="full"
            className="shadow-lg"
            onPress={() => {
              setPanelVisible(!panelVisible);
            }}
          >
            <EcoconnectLogo />
          </Button>
        </div>
      </div>

      {/* Panel */}
      <div
        className={`h-full transition-all z-50 ${panelVisible
            ? "scale-100 opacity-100 w-[300px] px-2"
            : "w-0 scale-[98%] opacity-0 px-0"
          }`}
      ></div>
      <div
        className={`fixed h-full transition-all z-50 ${isScrolled ? "pb-2 -mt-8" : "pb-10"
          } ${panelVisible
            ? "scale-100 opacity-100 w-[300px] p-2"
            : "w-0 scale-[98%] opacity-0 p-0"
          }`}
      >
        <Card className="h-full w-full">
          <div className="flex flex-col h-full">
            <div className="flex flex-row justify-between bg-primary-50 dark:bg-primary-950">
              <Button
                className="w-min h-full"
                variant="light"
                onPress={() => {
                  navigate("/admin");
                }}
              >
                <div className="flex flex-col text-right py-4">
                  <EcoconnectFullLogo />
                  <p className="text-2xl text-primary-800 dark:text-primary-100 font-semibold">
                    administrators
                  </p>
                </div>
              </Button>
              <Button
                onPress={() => {
                  setPanelVisible(!panelVisible);
                }}
                isIconOnly
                variant="light"
                className="rounded-tl-none rounded-br-none"
              >
                <div className="rotate-180">
                  <ChevronLeftIcon />
                </div>
              </Button>
            </div>
            {userInformation && (
              <div className="flex flex-col h-full">
                <ScrollShadow className="h-full">
                  <div className="flex flex-col gap-4 p-4 *:flex *:flex-col">
                    <div>
                      <p className="text-sm font-bold opacity-50 pb-2">
                        Events
                      </p>
                      <AdministratorNavigationPanelNavigationButton
                        text="Events"
                        icon={<CalendarDaysIcon />}
                        onClickRef="events"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-50 pb-2">
                        Community Forums
                      </p>
                      <AdministratorNavigationPanelNavigationButton
                        text="Posts"
                        icon={<ClipboardDocumentListIcon />}
                        onClickRef="community-posts"
                      />
                      <AdministratorNavigationPanelNavigationButton
                        text="Tags"
                        icon={<TagIcon />}
                        onClickRef="community-posts/manage-tag"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-50 pb-2">
                        Bill Contest
                      </p>
                      <AdministratorNavigationPanelNavigationButton
                        text="Manage Forms"
                        icon={<ChartBarIcon />}
                        onClickRef="ranking"
                      />
                      <AdministratorNavigationPanelNavigationButton
                        text="Vouchers"
                        icon={<GiftTopIcon />}
                        onClickRef="voucher"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-50 pb-2">
                        Karang Guni
                      </p>
                      <AdministratorNavigationPanelNavigationButton
                        text="Schedules"
                        icon={<CalendarDaysIcon />}
                        onClickRef="schedules"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold opacity-50 pb-2">Users</p>
                      <AdministratorNavigationPanelNavigationButton
                        text="Manage Users"
                        icon={<UsersIcon />}
                        onClickRef="users-management"
                      />
                      <AdministratorNavigationPanelNavigationButton
                        text="Feedbacks"
                        icon={<ChatBubbleOvalLeftIcon />}
                        onClickRef="manage-feedbacks"
                      />
                    </div>
                  </div>
                </ScrollShadow>
                <div className="bg-primary-500 p-1">
                  <Dropdown placement="top-start">
                    <DropdownTrigger>
                      <Button variant="light" className="h-full w-full p-2">
                        <div className="flex flex-row w-full justify-start">
                          <div className="flex flex-row w-full gap-3 *:my-auto text-white">
                            <Avatar src={userProfileImageURL} />
                            <div className="flex flex-col h-full text-left">
                              <p className="font-semibold">
                                {userInformation.firstName +
                                  " " +
                                  userInformation.lastName}
                              </p>
                              <p className="text-sm opacity-70">
                                {userInformation.email}
                              </p>
                              <p className="text-sm opacity-70">
                                +65 {userInformation.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="signout"
                        startContent={<ArrowRightStartOnRectangleIcon />}
                        color="danger"
                        title="Sign out"
                        onPress={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                      />
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            )}
            {!userInformation && (
              <div className="w-full h-full flex flex-col justify-center">
                <div className="w-full h-full flex flex-row justify-center">
                  <CircularProgress />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
