import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button,
  Tooltip,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { popErrorToast, popToast } from "../utilities";
import { ArchiveBoxIcon, ClipboardDocumentIcon, LifebuoyIcon } from "../icons";

export default function UsersManagement() {
  const [userInformationlist, setUserInformationList] = useState<any>([]);
  const columns = [
    {
      key: "firstName",
      label: "FISRT NAME",
    },
    {
      key: "lastName",
      label: "LAST NAME",
    },
    {
      key: "email",
      label: "EMAIL ADDRESS",
    },
    {
      key: "phoneNumber",
      label: "TELEPHONE",
    },
    {
      key: "accountType",
      label: "ACCOUNT TYPE",
    },
    {
      key: "isArchived",
      label: "STATUS",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  const populateUserInformationList = () => {
    instance
      .get(`${config.serverAddress}/users/all`)
      .then((response) => {
        setUserInformationList(response.data);
        console.log(userInformationlist);
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  useEffect(() => {
    populateUserInformationList();
  }, []);

  const handleCopyID = (userId: string, firstName: string) => {
    navigator.clipboard.writeText(userId);
    popToast(firstName + "'s User ID has been copied!", 1);
  };

  const handleArchiveToggle = (userId: string, isArchived: boolean) => {
    instance
      .put(
        `${config.serverAddress}/users/${
          isArchived ? "unarchive" : "archive"
        }/${userId}`
      )
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  return (
    <div>
      {userInformationlist && (
        <div className="flex flex-col gap-8 p-8">
          <p className="text-4xl font-bold">Users Onboard</p>
          <Table aria-label="User Information Table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={userInformationlist}>
              {(userEntry: any) => (
                <TableRow key={userEntry.id}>
                  {(columnKey) => (
                    <TableCell
                      className={
                        columnKey == "accountType" &&
                        getKeyValue(userEntry, columnKey) == 2
                          ? "text-primary-500 font-semibold"
                          : ""
                      }
                    >
                      {columnKey === "accountType" ? (
                        (() => {
                          const accountType = getKeyValue(userEntry, columnKey);
                          switch (accountType) {
                            case 0:
                              return "User";
                            case 1:
                              return "Karang Guni";
                            case 2:
                              return "Admin";
                            default:
                              return "";
                          }
                        })()
                      ) : columnKey === "actions" ? (
                        <div className="flex gap-2">
                          <Tooltip content="Copy ID">
                            <Button
                              variant="light"
                              isIconOnly
                              onClick={() =>
                                handleCopyID(userEntry.id, userEntry.firstName)
                              }
                            >
                              <ClipboardDocumentIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content={
                              userEntry.isArchived ? "Unarchive" : "Archive"
                            }
                          >
                            <Button
                              variant="light"
                              isIconOnly
                              onClick={() =>
                                handleArchiveToggle(
                                  userEntry.id,
                                  userEntry.isArchived
                                )
                              }
                            >
                              {userEntry.isArchived ? (
                                <div className="text-green-600">
                                  <LifebuoyIcon />
                                </div>
                              ) : (
                                <div className="text-red-500">
                                  <ArchiveBoxIcon />
                                </div>
                              )}
                            </Button>
                          </Tooltip>
                        </div>
                      ) : columnKey == "isArchived" ? (
                        getKeyValue(userEntry, columnKey) ? (
                          "Archived"
                        ) : (
                          "Active"
                        )
                      ) : (
                        <p className={userEntry.isArchived ? "opacity-50" : ""}>
                          {getKeyValue(userEntry, columnKey)}
                        </p>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
