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
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { exportData, popErrorToast, popToast } from "../utilities";
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "../icons";
import { ExportType } from "export-from-json";

export default function UsersManagement() {
  const [userInformationlist, setUserInformationList] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      key: "townCouncil",
      label: "TOWN COUNCIL",
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
      .get(
        `${config.serverAddress}/users/all${
          searchQuery.length > 0 ? `?search=${searchQuery}` : ""
        }`
      )
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

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      populateUserInformationList();
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

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
        populateUserInformationList();
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  const handleExport = (exportType: ExportType) => {
    exportData(
      userInformationlist,
      `ecoconnect-user-data-${new Date().toUTCString()}`,
      exportType
    );
  };

  return (
    <div>
      {userInformationlist && (
        <div className="flex flex-col gap-8 p-8">
          <div className="flex flex-row justify-between *:my-auto">
            <p className="text-4xl font-bold">Users Onboard</p>
            <div className="flex flex-row gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button>
                    <div className="flex flex-row gap-2 *:my-auto px-4">
                      <div className="scale-80 origin-center">
                        <ArrowDownTrayIcon />
                      </div>
                      <p>Export</p>
                    </div>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Export file type">
                  <DropdownSection title="SELECT A FILE TYPE">
                    <DropdownItem
                      key="json"
                      onPress={() => {
                        handleExport("json");
                      }}
                    >
                      JavaScript Object Notation (JSON)
                    </DropdownItem>
                    <DropdownItem
                      key="csv"
                      onPress={() => {
                        handleExport("csv");
                      }}
                    >
                      Comma-Separated Values (CSV)
                    </DropdownItem>
                    <DropdownItem
                      key="xls"
                      onPress={() => {
                        handleExport("xls");
                      }}
                    >
                      Excel Workbook (XLS)
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
              <Input
                className="max-w-96"
                placeholder="Search"
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<MagnifyingGlassIcon />}
                endContent={
                  searchQuery.length > 0 && (
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={() => {
                        setSearchQuery("");
                      }}
                    >
                      <XMarkIcon />
                    </Button>
                  )
                }
              />
            </div>
          </div>
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
                          "Inactive"
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
          {userInformationlist.length <= 0 && (
            <div className="flex-grow w-full h-full text-center">
              <p className="text-2xl opacity-70">No users to display.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
