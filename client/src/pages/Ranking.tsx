import { useEffect, useState } from "react";
import config from "../config";
import instance from "../security/http";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { EmailIcon, ImageIcon, TrashDeleteIcon } from "../icons";
import NextUIFormikSelect2 from "../components/NextUIFormikSelect2";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  townCouncil: string;
}

export interface FormData {
  id: string;
  electricalBill: number;
  waterBill: number;
  totalBill: number;
  noOfDependents: number;
  avgBill: number;
  billPicture: string;
  userId: string;
}

interface FormDataWithUser extends FormData {
  userName: string;
  userEmail: string;
  userTownCouncil: string;
}

interface Voucher {
  id: string;
  brandLogo: string | null;
  brand: string;
  description: string;
  expirationDate: Date;
  quantityAvailable: number;
  code: string;
}

interface UserVoucher {
  id: string; // UUID type
  userId: string;
  voucherId: string;
}

// Sort form data based on descriptor
export const sortFormData = (list: FormData[], descriptor: SortDescriptor) => {
  const { column } = descriptor;

  if (column === "avgBill") {
    return [...list].sort((a, b) => a.avgBill - b.avgBill);
  }

  return list;
};

export default function Ranking() {
  const [originalFormData, setOriginalFormData] = useState<FormData[]>([]);
  const [filteredFormData, setFilteredFormData] = useState<FormData[]>([]);
  const [userData, setUserData] = useState<User[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "avgBill",
    direction: "ascending",
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    name: string;
  }>({ email: "", name: "" });
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null); // Changed to string to match UUID type
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const [selectedTownCouncil, setSelectedTownCouncil] = useState<string>("");
  const [top3Users, setTop3Users] = useState<FormDataWithUser[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formResponse = await instance.get<FormData[]>(
          `${config.serverAddress}/hbcform`
        );
        const processedFormData = formResponse.data.map((data) => ({
          ...data,
          electricalBill: Number(data.electricalBill),
          waterBill: Number(data.waterBill),
          totalBill: Number(data.totalBill),
          avgBill: Number(data.avgBill),
        }));
        setOriginalFormData(processedFormData);
        setFilteredFormData(processedFormData);

        const userResponse = await instance.get<User[]>(
          `${config.serverAddress}/users/all`
        );
        setUserData(userResponse.data);

        const townCouncilsResponse = await instance.get(
          `${config.serverAddress}/users/town-councils-metadata`
        );
        setTownCouncils(JSON.parse(townCouncilsResponse.data).townCouncils);
      } catch (error) {
        console.log("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter form data based on selected town council
  useEffect(() => {
    const filtered = originalFormData.filter((data) => {
      const user = userData.find((user) => user.id === data.userId);
      return selectedTownCouncil
        ? user?.townCouncil === selectedTownCouncil
        : true;
    });
    setFilteredFormData(filtered);
  }, [selectedTownCouncil, originalFormData, userData]);

  // Compute top 3 users for each town council
  useEffect(() => {
    const townCouncilTopUsers: Record<string, FormDataWithUser[]> = {};

    filteredFormData.forEach((data) => {
      const user = userData.find((user) => user.id === data.userId);
      const formDataWithUser: FormDataWithUser = {
        ...data,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        userEmail: user ? user.email : "Unknown Email",
        userTownCouncil: user ? user.townCouncil : "Unknown Town Council",
      };

      if (!townCouncilTopUsers[formDataWithUser.userTownCouncil]) {
        townCouncilTopUsers[formDataWithUser.userTownCouncil] = [];
      }

      townCouncilTopUsers[formDataWithUser.userTownCouncil].push(
        formDataWithUser
      );
    });

    // Sort each town council's users by avgBill and pick the top 3
    const topUsersByTownCouncil: FormDataWithUser[] = [];

    Object.values(townCouncilTopUsers).forEach((users) => {
      const top3 = users.sort((a, b) => b.avgBill - a.avgBill).slice(0, 3);
      topUsersByTownCouncil.push(...top3);
    });

    setTop3Users(topUsersByTownCouncil);
  }, [filteredFormData, userData]);

  const sortedFormData = sortFormData(filteredFormData, sortDescriptor);

  const combinedData: FormDataWithUser[] = sortedFormData.map((data) => {
    const user = userData.find((user) => user.id === data.userId);
    return {
      ...data,
      userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
      userEmail: user ? user.email : "Unknown Email",
      userTownCouncil: user ? user.townCouncil : "Unknown Town Council",
    };
  });

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleEmailClick = (email: string, name: string) => {
    setSelectedUser({ email, name });
    setIsEmailModalOpen(true);
  };

  const sendEmail = async () => {
    try {
      const response = await instance.post(
        `${config.serverAddress}/hbcform/send-homebill-contest-email`,
        {
          email: selectedUser.email,
          name: selectedUser.name,
        }
      );
      console.log(response.data.message);
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedFormId(id);
    setIsDeleteModalOpen(true);
  };

  const deleteForm = async () => {
    if (selectedFormId === null) return;
    try {
      await instance.delete(
        `${config.serverAddress}/hbcform/${selectedFormId}`
      );
      setOriginalFormData(
        originalFormData.filter((data) => data.id !== selectedFormId)
      );
      setFilteredFormData(
        filteredFormData.filter((data) => data.id !== selectedFormId)
      );
      setSelectedFormId(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete form entry:", error);
    }
  };

  const fetchVouchers = async (): Promise<Voucher[]> => {
    try {
      const response = await instance.get(`${config.serverAddress}/vouchers`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      return [];
    }
  };

  const assignVouchersToUsers = async (topUsers: FormDataWithUser[]) => {
    try {
      const vouchers = await fetchVouchers();
      if (vouchers.length === 0) {
        console.warn("No vouchers available");
        return;
      }

      const getRandomVouchers = (count: number): Voucher[] => {
        const shuffled = vouchers.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      const townCouncilGroups: Record<string, FormDataWithUser[]> = {};
      topUsers.forEach((user) => {
        if (!townCouncilGroups[user.userTownCouncil]) {
          townCouncilGroups[user.userTownCouncil] = [];
        }
        townCouncilGroups[user.userTownCouncil].push(user);
      });

      for (const [townCouncil, users] of Object.entries(townCouncilGroups)) {
        const top3 = users.sort((a, b) => b.avgBill - a.avgBill).slice(0, 3);

        for (let i = 0; i < top3.length; i++) {
          const user = top3[i];
          let voucherCount = 0;

          if (i === 0) {
            voucherCount = 3;
          } else if (i === 1) {
            voucherCount = 2;
          } else if (i === 2) {
            voucherCount = 1;
          }

          const vouchersToAssign = getRandomVouchers(voucherCount);

          for (const voucher of vouchersToAssign) {
            await instance.post(`${config.serverAddress}/user-vouchers`, {
              userId: user.userId,
              voucherId: voucher.id,
            });

            try {
              const voucherId = voucher.id;
              const response = await instance.put(
                `${config.serverAddress}/vouchers/update-quantity/${voucherId}`,
                {
                  quantityToSubtract: 1,
                }
              );

              if (response.status !== 200) {
                console.error(
                  `Failed to update voucher quantity for voucherId: ${voucher.id}`
                );
              }
            } catch (error) {
              console.error(
                `Error updating voucher quantity for voucherId: ${voucher.id}`,
                error
              );
              throw new Error(
                `Failed to update voucher quantity for voucherId: ${voucher.id}`
              );
            }
          }
        }
      }
      console.log("Vouchers assigned successfully");
    } catch (error) {
      console.error("Failed to assign vouchers:", error);
    }
  };

  const handleGiveVouchers = async () => {
    try {
      await assignVouchersToUsers(top3Users);
      console.log("Vouchers assigned successfully");
    } catch (error) {
      console.error("Failed to give vouchers:", error);
    }
  };

  const handleTownCouncilChange = (value: string) => {
    setSelectedTownCouncil(value);
  };

  const options = townCouncils.map((townCouncil) => ({
    key: townCouncil, // Use key instead of value
    label: townCouncil,
  }));

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between items-center gap-5">
        <div className="flex w-[500px]">
          <p className="text-4xl font-bold">Home Bill Contest Form Data</p>
        </div>
        <div className="flex flex-row gap-4 ">
          <div className="w-[200px]">
            <NextUIFormikSelect2
              label="Town Council"
              placeholder="Select a Town Council"
              options={options}
              onChange={handleTownCouncilChange}
            />
          </div>
          <div className="w-[130px]">
            <Button
              color="primary"
              onPress={handleGiveVouchers}
              className="w-full"
              isDisabled={!!selectedTownCouncil}
            >
              Give Vouchers
            </Button>
          </div>
        </div>
      </div>

      <Table aria-label="Form Data Table">
        <TableHeader>
          <TableColumn>Rank</TableColumn>
          <TableColumn>User Name</TableColumn>
          <TableColumn>Total Bill</TableColumn>
          <TableColumn>Dependents</TableColumn>
          <TableColumn>Average Bill</TableColumn>
          <TableColumn>Bill Picture</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>

        <TableBody>
          {combinedData.map((data, index) => (
            <TableRow key={data.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{data.userName}</TableCell>
              <TableCell>${data.totalBill.toFixed(2)}</TableCell>
              <TableCell>{data.noOfDependents}</TableCell>
              <TableCell>${data.avgBill.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() =>
                    handleImageClick(
                      `${config.serverAddress}/hbcform/billPicture/${data.id}`
                    )
                  }
                >
                  <ImageIcon />
                </Button>
              </TableCell>
              <TableCell className="flex flex-row">
                <Button
                  isIconOnly
                  variant="light"
                  className="text-blue-500"
                  onClick={() =>
                    handleEmailClick(data.userEmail, data.userName)
                  }
                >
                  <EmailIcon />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  color="danger"
                  onClick={() => handleDeleteClick(data.id)}
                >
                  <TrashDeleteIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Send Email</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to send an email to {selectedUser.name} (
              {selectedUser.email})?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={sendEmail}>
              Send
            </Button>
            <Button
              color="secondary"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Delete Entry</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this entry?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={deleteForm}>
              Delete
            </Button>
            <Button
              color="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      >
        <ModalContent>
          <ModalBody>
            {modalImageUrl && <img src={modalImageUrl} alt="Bill Image" />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
