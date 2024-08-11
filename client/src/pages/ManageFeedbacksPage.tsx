import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { popErrorToast } from "../utilities";
import {
  Button,
  Chip,
  getKeyValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@nextui-org/react";
import { BookOpenIcon, CheckmarkIcon, EmailIcon } from "../icons";
import { retrieveUserInformationById } from "../security/usersbyid";

export default function ManageFeedbacksPage() {
  const [feedbacksList, setFeedbacksList] = useState<any>([]);
  const [viewFeedbackModalOpened, setViewFeedbackModalOpened] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<any>();
  const columns = [
    {
      key: "feedbackCategory",
      label: "CATEGORY",
    },
    {
      key: "subject",
      label: "SUBJECT",
    },
    {
      key: "comment",
      label: "COMMENT",
    },
    {
      key: "createdAt",
      label: "SUBMITTED",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  const populateFeedbacksList = () => {
    instance
      .get(`${config.serverAddress}/feedback/all`)
      .then((response) => {
        setFeedbacksList(response.data);
        console.log(feedbacksList);
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  useEffect(() => {
    populateFeedbacksList();
  }, []);

  const viewFeedback = (feedbackId: string) => {
    instance
      .get(`${config.serverAddress}/feedback/${feedbackId}`)
      .then((feedbackObject) => {
        setViewingFeedback(feedbackObject.data);
        setViewFeedbackModalOpened(true);
      });
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <p className="text-4xl font-bold">Manage Feedbacks</p>
      <Table aria-label="User Information Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={feedbacksList}>
          {(feedbackEntry: any) => (
            <TableRow key={feedbackEntry.id}>
              {(columnKey) => (
                <TableCell>
                  {(() => {
                    switch (columnKey) {
                      case "feedbackCategory":
                        let result = "";
                        switch (getKeyValue(feedbackEntry, columnKey)) {
                          case 0:
                            result = "Feature request";
                            break;
                          case 1:
                            result = "Bug report";
                            break;
                          case 2:
                            result = "Get in touch";
                            break;
                          default:
                            result = "Unknown";
                            break;
                        }
                        return <Chip>{result}</Chip>;
                      case "subject":
                        return (
                          <p className="w-max max-w-60 font-bold">
                            {getKeyValue(feedbackEntry, columnKey)}
                          </p>
                        );
                      case "comment":
                        return (
                          <div className="flex flex-row gap-4">
                            <p className="flex-grow line-clamp-1 max-h-4 overflow-hidden overflow-ellipsis">
                              {getKeyValue(feedbackEntry, columnKey)}
                            </p>
                          </div>
                        );
                      case "createdAt":
                        let creationDate = Date.parse(
                          getKeyValue(feedbackEntry, columnKey)
                        );
                        let timing = Math.floor(
                          (Date.now() - creationDate) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <p>
                            {timing <= 0
                              ? "Today"
                              : `${timing} day${timing == 1 ? "" : "s"} ago`}
                          </p>
                        );
                      case "actions":
                        return (
                          <div className="flex flex-row gap-2">
                            <Button
                              size="sm"
                              variant="bordered"
                              startContent={
                                <div className="scale-80">
                                  <BookOpenIcon />
                                </div>
                              }
                              onPress={() => {
                                viewFeedback(getKeyValue(feedbackEntry, "id"));
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              color="success"
                              variant="faded"
                              startContent={
                                <div className="scale-80">
                                  <CheckmarkIcon />
                                </div>
                              }
                              onPress={() => {
                                instance.delete(
                                  `${
                                    config.serverAddress
                                  }/feedback/${getKeyValue(
                                    feedbackEntry,
                                    "id"
                                  )}`
                                );
                                window.location.reload();
                              }}
                            >
                              Resolve
                            </Button>
                          </div>
                        );
                      default:
                        return <p>{getKeyValue(feedbackEntry, columnKey)}</p>;
                    }
                  })()}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={viewFeedbackModalOpened}
        onOpenChange={setViewFeedbackModalOpened}
        size="3xl"
      >
        <ModalContent>
          {(onClose) => {
            return (
              viewingFeedback && (
                <>
                  <ModalHeader>
                    <div className="flex flex-col gap-2">
                      <p>"{viewingFeedback.subject}"</p>
                      <p className="font-normal text-sm opacity-50">
                        Submitted on{" "}
                        {new Date(viewingFeedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <div>
                      <Textarea
                        label="Comment"
                        size="lg"
                        disabled
                        value={viewingFeedback.comment}
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <div className="flex flex-row gap-2">
                      {viewingFeedback.allowContact == 1 && (
                        <Button
                          startContent={<EmailIcon />}
                          onPress={() => {
                            retrieveUserInformationById(
                              viewingFeedback.userId
                            ).then((value) => {
                              window.location.href = `mailto:${value.email}`;
                            });
                          }}
                        >
                          Get in touch
                        </Button>
                      )}
                      <Button onPress={onClose}>Close</Button>
                    </div>
                  </ModalFooter>
                </>
              )
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}
