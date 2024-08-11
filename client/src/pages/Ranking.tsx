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
    townCouncil: string;
}

interface FormData {
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
    const [selectedUser, setSelectedUser] = useState<{ email: string, name: string }>({ email: "", name: "" });
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null); // Changed to string to match UUID type
    const [townCouncils, setTownCouncils] = useState<string[]>([]);
    const [selectedTownCouncil, setSelectedTownCouncil] = useState<string>("");
    const [top3Users, setTop3Users] = useState<FormDataWithUser[]>([]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const formResponse = await instance.get<FormData[]>(`${config.serverAddress}/hbcform`);
                const processedFormData = formResponse.data.map((data) => ({
                    ...data,
                    electricalBill: Number(data.electricalBill),
                    waterBill: Number(data.waterBill),
                    totalBill: Number(data.totalBill),
                    avgBill: Number(data.avgBill),
                }));
                setOriginalFormData(processedFormData);
                setFilteredFormData(processedFormData);

                const userResponse = await instance.get<User[]>(`${config.serverAddress}/users/all`);
                setUserData(userResponse.data);

                const townCouncilsResponse = await instance.get(`${config.serverAddress}/users/town-councils-metadata`);
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
            return selectedTownCouncil ? user?.townCouncil === selectedTownCouncil : true;
        });
        setFilteredFormData(filtered);
    }, [selectedTownCouncil, originalFormData, userData]);

    // Compute top 3 users based on average bill
    useEffect(() => {
        const combinedData: FormDataWithUser[] = filteredFormData.map((data) => {
            const user = userData.find((user) => user.id === data.userId);
            return {
                ...data,
                userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
                userEmail: user ? user.email : "Unknown Email",
                userTownCouncil: user ? user.townCouncil : "Unknown Town Council",
            };
        });

        const townCouncilTopUsers: Record<string, FormDataWithUser> = {};
        combinedData.forEach((data) => {
            if (!townCouncilTopUsers[data.userTownCouncil] || data.avgBill > townCouncilTopUsers[data.userTownCouncil].avgBill) {
                townCouncilTopUsers[data.userTownCouncil] = data;
            }
        });

        const topUsers = Object.values(townCouncilTopUsers);
        const sortedTopUsers = topUsers.sort((a, b) => b.avgBill - a.avgBill).slice(0, 3);

        setTop3Users(sortedTopUsers);
    }, [filteredFormData, userData]);

    // Sort form data based on descriptor
    const sortFormData = (list: FormData[], descriptor: SortDescriptor) => {
        const { column, direction } = descriptor;

        if (column === "avgBill") {
            return [...list].sort((a, b) =>
                direction === "ascending" ? a.avgBill - b.avgBill : b.avgBill - a.avgBill
            );
        }

        return list;
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

    const handleDeleteClick = (id: string) => {
        setSelectedFormId(id);
        setIsDeleteModalOpen(true);
    };

    const deleteForm = async () => {
        if (selectedFormId === null) return;
        try {
            await instance.delete(`${config.serverAddress}/hbcform/${selectedFormId}`);
            setOriginalFormData(originalFormData.filter((data) => data.id !== selectedFormId));
            setFilteredFormData(filteredFormData.filter((data) => data.id !== selectedFormId));
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

            const randomVoucher = (vouchers: Voucher[]) => vouchers[Math.floor(Math.random() * vouchers.length)];

            for (const user of topUsers) {
                const voucher = randomVoucher(vouchers);
                if (voucher) {
                    await instance.post(`${config.serverAddress}/user-vouchers`, {
                        userId: user.userId,
                        voucherId: voucher.id,
                    });
                }
            }
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


    return (
        <section className="flex flex-col items-center justify-center py-5">
            <div className="flex justify-between w-full">
                <p className="text-xl font-bold">Form Data</p>
                {top3Users.length > 0 && (
                    <Button color="primary" onPress={handleGiveVouchers}>
                        Give Vouchers
                    </Button>
                )}
            </div>
            <div className="gap-8 p-8">
                {townCouncils.length > 0 && (
                    <select
                        value={selectedTownCouncil}
                        onChange={(e) => setSelectedTownCouncil(e.target.value)}
                    >
                        <option value="">All locations</option>
                        {townCouncils.map((townCouncil) => (
                            <option key={townCouncil} value={townCouncil}>
                                {townCouncil}
                            </option>
                        ))}
                    </select>
                )}
                <Table aria-label="Form Data Table">
                    <TableHeader>
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
                                <p>Are you sure you want to send an email to {selectedUser.name} ({selectedUser.email})?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => { sendEmail(); onClose(); }}>
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
                                <p>Are you sure you want to delete this form entry?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
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
