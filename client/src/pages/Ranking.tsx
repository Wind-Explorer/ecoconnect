import { useEffect, useState } from 'react';
import config from '../config';
import instance from '../security/http';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { EmailIcon, TrashDeleteIcon } from '../icons';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface FormData {
    id: number;
    electricalBill: number;
    waterBill: number;
    totalBill: number;
    noOfDependents: number;
    avgBill: number;
    billPicture: string;
    userId: string;
}

export default function Ranking() {
    const [formData, setFormData] = useState<FormData[]>([]);
    const [userData, setUserData] = useState<User[]>([]);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "avgBill",
        direction: "ascending",
    });
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ email: string, name: string }>({ email: "", name: "" });
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch form data
                const formResponse = await instance.get<FormData[]>(`${config.serverAddress}/hbcform`);
                const processedFormData = formResponse.data.map((data) => ({
                    ...data,
                    electricalBill: Number(data.electricalBill),
                    waterBill: Number(data.waterBill),
                    totalBill: Number(data.totalBill),
                    avgBill: Number(data.avgBill),
                }));
                setFormData(processedFormData);

                // Fetch user data
                const userResponse = await instance.get<User[]>(`${config.serverAddress}/users/all`);
                setUserData(userResponse.data);
            } catch (error) {
                console.log("Failed to fetch data");
            }
        };

        fetchData();
    }, []);

    const sortFormData = (list: FormData[], descriptor: SortDescriptor) => {
        const { column, direction } = descriptor;

        if (column === "avgBill") {
            return [...list].sort((a, b) =>
                direction === "ascending" ? a.avgBill - b.avgBill : b.avgBill - a.avgBill
            );
        }

        return list; // No sorting if the column is not 'avgBill'
    };

    const handleSort = () => {
        const { direction } = sortDescriptor;
        const newDirection = direction === "ascending" ? "descending" : "ascending";

        setSortDescriptor({ column: "avgBill", direction: newDirection });
    };

    const renderSortIndicator = () => {
        if (sortDescriptor.column === "avgBill") {
            return sortDescriptor.direction === "ascending" ? <span>&uarr;</span> : <span>&darr;</span>;
        }
        return null;
    };

    const sortedFormData = sortFormData(formData, sortDescriptor);

    // Combine form data with user information
    const combinedData = sortedFormData.map((data) => {
        const user = userData.find((user) => user.id === data.userId);
        return {
            ...data,
            userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
            userEmail: user ? user.email : "Unknown Email",
        };
    });

    const handleEmailClick = (email: string, name: string) => {
        setSelectedUser({ email, name });
        setIsEmailModalOpen(true);
    };

    const sendEmail = async () => {
        try {
            const response = await instance.post(`${config.serverAddress}/hbcform/send-homebill-contest-email`, {
                email: selectedUser.email,
                name: selectedUser.name,
            });
            console.log(response.data.message);
            setIsEmailModalOpen(false);
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    };


    const handleDeleteClick = (id: number) => {
        setSelectedFormId(id);
        setIsDeleteModalOpen(true);
    };

    const deleteForm = async () => {
        if (selectedFormId === null) return;
        try {
            await instance.delete(`${config.serverAddress}/hbcform/${selectedFormId}`);
            setFormData(formData.filter((data) => data.id !== selectedFormId));
            setSelectedFormId(null);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete form entry:", error);
        }
    };

    return (
        <section className="flex flex-col items-center justify-center py-5">
            <p className="text-xl font-bold">Form Data</p>
            <div className="gap-8 p-8">
                <Table aria-label="Form Data Table">
                    <TableHeader>
                        <TableColumn>User ID</TableColumn>
                        <TableColumn>User Name</TableColumn>
                        <TableColumn>User Email</TableColumn>
                        <TableColumn>Electrical Bill</TableColumn>
                        <TableColumn>Water Bill</TableColumn>
                        <TableColumn>Total Bill</TableColumn>
                        <TableColumn>Dependents</TableColumn>
                        <TableColumn onClick={handleSort}>
                            Average Bill {renderSortIndicator()}
                        </TableColumn>
                        <TableColumn>Bill Picture</TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {combinedData.map((data) => (
                            <TableRow key={data.id}>
                                <TableCell>{data.userId}</TableCell>
                                <TableCell>{data.userName}</TableCell>
                                <TableCell>{data.userEmail}</TableCell>
                                <TableCell>${data.electricalBill.toFixed(2)}</TableCell>
                                <TableCell>${data.waterBill.toFixed(2)}</TableCell>
                                <TableCell>${data.totalBill.toFixed(2)}</TableCell>
                                <TableCell>{data.noOfDependents}</TableCell>
                                <TableCell>${data.avgBill.toFixed(2)}</TableCell>
                                <TableCell>
                                    {data.billPicture && <img src={`${config.serverAddress}/hbcform/billPicture/${data.id}`} alt="bill picture" className="w-full" />}
                                </TableCell>
                                <TableCell className="flex flex-row">
                                    <Button isIconOnly variant="light" className="text-blue-500" onClick={() => handleEmailClick(data.userEmail, data.userName)}><EmailIcon /></Button>
                                    <Button isIconOnly variant="light" color="danger" onClick={() => handleDeleteClick(data.id)}><TrashDeleteIcon /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Email Confirmation Modal */}
            <Modal isOpen={isEmailModalOpen} onOpenChange={setIsEmailModalOpen} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Send Email</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to send this email to {selectedUser.email}?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="danger" onPress={() => { sendEmail(); onClose(); }}>
                                    Send
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Entry</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this entry?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={() => { deleteForm(); onClose(); }}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
}
