import {
  Button,
  Input,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "../icons";
import config from "../config";
import instance from "../security/http";
import EcoconnectFullLogo from "./EcoconnectFullLogo";

export default function EcoconnectSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const {
    isOpen: isAiDialogOpen,
    onOpen: onAiDialogOpen,
    onOpenChange: onAiDialogOpenChange,
  } = useDisclosure();

  const dialogOpenChange = () => {
    onAiDialogOpenChange();
    setSearchQuery("");
    setAiResponse("");
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      onAiDialogOpen();
    }
  };

  const executeSearch = async () => {
    if (searchQuery.length <= 0) return;
    setIsQueryLoading(true);
    instance
      .get(
        `${config.serverAddress}/connections/openai-chat-completion/${searchQuery}`
      )
      .then((response) => {
        console.log(response.data.response);
        setAiResponse(response.data.response);
      })
      .finally(() => {
        setIsQueryLoading(false);
      });
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
              <Kbd keys={["ctrl"]}>S</Kbd>
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
          {() => {
            return (
              <>
                <ModalBody>
                  <div className="py-4 flex flex-col gap-4">
                    <Input
                      placeholder="Search..."
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
                          className="-mr-2"
                        >
                          <MagnifyingGlassIcon />
                        </Button>
                      }
                    />
                    {aiResponse.length > 0 && (
                      <p className="bg-neutral-50 p-4 border-2 rounded-xl">
                        {aiResponse}
                      </p>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter className="bg-red-50 dark:bg-red-950 w-full h-full">
                  <div className="w-full h-full flex flex-row justify-between *:my-auto">
                    <EcoconnectFullLogo />
                    <p className="text-lg text-red-900 dark:text-red-100">
                      Natural Language Search
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
