import { Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { InfoIcon, TrophyIcon } from "../icons";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface CombinedData {
  userId: string;
  formId: string;
  name: string;
  avgBill: number;
}

export default function HBContestPage() {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } else {
      navigate("new-submission");
    }
  };

  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleOpenInfoModal = () => setIsInfoModalOpen(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form data
        const formDataResponse = await instance.get<CombinedData[]>(`${config.serverAddress}/hbcform`);
        const processedFormData = formDataResponse.data;

        // Fetch user information
        const userInfoResponse = await instance.get<User[]>(`${config.serverAddress}/users/all`);

        // Combine form data with user information
        const combined = processedFormData.map((form) => {
          const user = userInfoResponse.data.find((user) => user.id === form.userId);
          return {
            userId: user ? user.id : "Unknown User",
            formId: form.userId,
            name: user ? `${user.firstName} ${user.lastName}` : "Unknown Name",
            avgBill: form.avgBill,
          };
        });

        // Sort combined data by avgBill in ascending order
        combined.sort((a, b) => a.avgBill - b.avgBill);

        setCombinedData(combined);
      } catch (error) {
        console.log("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const topUser = combinedData.length > 0 ? combinedData[0] : null;
  const top5Users = combinedData.slice(1, 10);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-[700px] flex flex-col items-center justify-center overflow-y-auto p-4">
        <section className="bg-red-50 dark:bg-primary-950 border border-primary-100 p-10 rounded-xl w-full max-w-2xl flex flex-col items-center">
          <div className="w-full flex justify-end">
            <Tooltip content="Information">
              <Button isIconOnly variant="light" onPress={handleOpenInfoModal}>
                <InfoIcon />
              </Button>
            </Tooltip>
            <Tooltip content="Leaderboard">
              <Button isIconOnly variant="light" onPress={handleOpenModal}>
                <TrophyIcon />
              </Button>
            </Tooltip>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-red-900 dark:text-white">
                Home Bill Contest
              </p>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                This contest is to encourage residents to reduce the use of
                electricity and water usage. This contest would be won by the
                person with the lowest overall bill average. Join us in this
                important effort to create a more sustainable future for everyone.{" "}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-900 dark:text-white">
                Winners
              </p>
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                There will be 3 winners for each month. Each winner will receive
                random vouchers.
              </p>
              <br></br>
              <p className="text-gray-700 dark:text-gray-300 font-bold">1st Place &rarr; 3 vouchers</p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">2nd Place &rarr; 2 vouchers</p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">3rd Place &rarr; 1 voucher</p>
            </div>
            <div className="flex justify-end">
              <Button
                className="bg-red-500 text-white hover:bg-red-900 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-900 dark:focus:ring-red-700 w-100"
                size="lg"
                onPress={handleJoinClick}
              >
                <p>Join</p>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent className="w-full max-w-[400px] relative">
          <ModalHeader className="flex justify-center items-center font-bold text-2xl text-red-900">
            <span>Leaderboard</span>
          </ModalHeader>
          <ModalBody className="pb-8"> {/* Add padding-bottom for white space */}
            <div className="flex flex-col gap-4">
              {topUser && (
                <div className="p-4 border rounded-md bg-red-100 flex items-center">
                  <TrophyIcon />
                  <p className="text-lg flex-1 text-center font-bold">{topUser.name}</p> {/* Center text */}
                </div>
              )}
            </div>
            <div className="grid grid-rows-1 md:grid-rows-2 gap-4">
              {top5Users.map((user, index) => (
                <div key={user.userId} className="p-4 border rounded-md bg-red-100 flex items-center">
                  <span className="text-xl font-bold w-8">{index + 2}</span>
                  <span className="flex-1 text-center">{user.name}</span>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Info Modal */}
      <Modal
        isOpen={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        isDismissable={true}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent className="w-full max-w-[400px]">
          <ModalHeader className="flex justify-between items-center font-bold text-2xl text-red-900">
            Information
          </ModalHeader>
          <ModalBody className="pb-8">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">Form Completion:</p>
              <ul className="list-disc list-inside pl-4">
                Participants must complete the online form, providing the following details
                <li>Water bill amount</li>
                <li>Electricity bill amount</li>
                <li>Number of dependents</li>
              </ul>

              <p className="font-semibold">Document Upload</p>
              <ul className="list-disc list-inside pl-4">
                <li>Participants must upload clear, legible images of their water and electricity bills.</li>
                <li>Both documents should clearly show the bill amount and date.</li>
              </ul>

              <p className="font-semibold">Data Accuracy</p>
              <ul className="list-disc list-inside pl-4">
                <li>All provided information must be accurate and truthful. Inaccurate or misleading information will result in disqualification.</li>
                <li>All submitted bills and details will be subject to verification.</li>
              </ul>

              <p className="font-semibold">Privacy and Data Handling</p>
              <ul className="list-disc list-inside pl-4">
                <li>All personal data and bill images submitted will be handled in accordance with privacy regulations and will not be shared with third parties without consent.</li>
                <li>Data will be used solely for contest purposes and to verify the validity of entries.</li>
              </ul>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>


    </div >
  );
}
