import {
  Button,
  Card,
  Input,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { ArrowTopRightOnSquare, MagnifyingGlassIcon } from "../icons";
import config from "../config";
import instance from "../security/http";
import EcoconnectFullLogo from "./EcoconnectFullLogo";
import { useNavigate } from "react-router-dom";

export default function EcoconnectSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponseRoute, setAiResponseRoute] = useState("");
  const [aiResponseRouteDescription, setAiResponseRouteDescription] =
    useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const navigate = useNavigate();

  const {
    isOpen: isAiDialogOpen,
    onOpen: onAiDialogOpen,
    onOpenChange: onAiDialogOpenChange,
  } = useDisclosure();

  const dialogOpenChange = () => {
    onAiDialogOpenChange();
    setSearchQuery("");
    setAiResponseRoute("");
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      onAiDialogOpen();
    }
  };

  const executeSearch = async () => {
    if (searchQuery.length <= 0) return;
    setIsQueryLoading(true);
    instance
      .get(`${config.serverAddress}/connections/nls/${searchQuery}`)
      .then((response) => {
        const rawResponse = response.data.response;
        const parsedResponse = JSON.parse(rawResponse);
        const resolvedRoute = parsedResponse.route;
        setAiResponseRoute(resolvedRoute);
        setAiResponseRouteDescription(getRouteDescription(resolvedRoute));
      })
      .finally(() => {
        setIsQueryLoading(false);
      });
  };

  const routeDescriptions: { [key: string]: string } = {
    "/": "Go home",
    "/springboard": "Go to the Dashboard",
    "/manage-account": "Manage your account",
    "/forgot-password": "Reset your password",
    "/events": "Browse events",
    "/karang-guni-schedules": "Browse available Karang Guni",
    "/home-bill-contest": "Take part in the home bill contest",
    "/home-bill-contest/new-submission": "Submit your bill",
    "/community-posts": "Browse community posts",
    "/community-posts/create": "Create a post",
    "/feedback": "Send feedbacks",
    "/user-vouchers": "View your vouchers",
  };

  const getRouteDescription = (route: string) => {
    return routeDescriptions[route] || "Unknown";
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="-mb-1">
      <Button
        size="sm"
        className="p-0"
        variant="light"
        isDisabled={isAiDialogOpen}
        onPress={() => {
          onAiDialogOpen();
        }}
      >
        <Input
          size="sm"
          disabled
          className="w-44 h-min"
          startContent={<MagnifyingGlassIcon />}
          endContent={
            <div className="-mr-1">
              <Kbd keys={["command"]}>S</Kbd>
            </div>
          }
          placeholder="Search..."
        />
      </Button>
      <Modal
        isOpen={isAiDialogOpen}
        onOpenChange={dialogOpenChange}
        closeButton={<></>}
        placement="top"
      >
        <ModalContent>
          {(onClose) => {
            return (
              <>
                <ModalBody>
                  <div className="py-4 flex flex-col gap-4">
                    <Input
                      placeholder="What would you like to do?"
                      size="lg"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      isDisabled={isQueryLoading}
                      onKeyDown={(keyEvent) => {
                        if (keyEvent.key == "Enter") {
                          executeSearch();
                        }
                      }}
                      endContent={
                        <Button
                          isIconOnly
                          variant="flat"
                          onPress={executeSearch}
                          isLoading={isQueryLoading}
                          isDisabled={searchQuery.length <= 0}
                          className="-mr-2"
                        >
                          <MagnifyingGlassIcon />
                        </Button>
                      }
                    />
                    {aiResponseRoute.length > 0 && (
                      <Card className="p-4">
                        <div className="flex flex-row justify-between *:my-auto">
                          <div className="flex flex-col">
                            <p className="text-xl font-bold">
                              {aiResponseRouteDescription}
                            </p>
                            <p className="text-sm opacity-50">
                              https://ecoconnect.gov.sg{aiResponseRoute}
                            </p>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-red-500"
                            onPress={() => {
                              onClose();
                              navigate(aiResponseRoute);
                            }}
                          >
                            <ArrowTopRightOnSquare />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter className="bg-red-50 dark:bg-red-950 w-full h-full">
                  <div className="w-full h-full flex flex-row justify-between *:my-auto">
                    <EcoconnectFullLogo />
                    <p className="text-lg text-red-900 dark:text-red-100">
                      Natural Language Search™
                    </p>
                  </div>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}
