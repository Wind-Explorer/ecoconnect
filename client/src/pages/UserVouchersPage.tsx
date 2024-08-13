import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { retrieveUserInformation } from "../security/users";
import {
    Card,
    CardBody,
    Image,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
} from "@nextui-org/react";
import { VoucherIcon } from "../icons";

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
    id: string;
    userId: string;
    voucherId: string;
}

export default function UserVoucherPage() {
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
    const [vouchers, setVouchers] = useState<Map<string, Voucher>>(new Map());
    const [brandLogoUrls, setBrandLogoUrls] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [userInformation, setUserInformation] = useState<any>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [selectedUserVoucherId, setSelectedUserVoucherId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserInformation = async () => {
            try {
                const response = await retrieveUserInformation();
                setUserInformation(response);
            } catch (error) {
                navigate("/signin");
            }
        };

        fetchUserInformation();
    }, []);

    useEffect(() => {
        const fetchUserVouchers = async () => {
            try {
                if (userInformation && userInformation.id) {
                    const response = await instance.get(
                        `${config.serverAddress}/user-vouchers/user/${userInformation.id}`
                    );
                    const fetchedUserVouchers = response.data.userVouchers;
                    setUserVouchers(fetchedUserVouchers);

                    const voucherIds = response.data.voucherIds;
                    const voucherDetailsPromises = voucherIds.map((voucherId: string) =>
                        instance.get(`${config.serverAddress}/vouchers/${voucherId}`)
                    );

                    const voucherResponses = await Promise.all(voucherDetailsPromises);
                    const voucherMap = new Map<string, Voucher>();
                    voucherResponses.forEach((response) => {
                        const voucher = response.data;
                        voucherMap.set(voucher.id, voucher);

                        if (voucher.brandLogo) {
                            instance
                                .get(`${config.serverAddress}/vouchers/brandLogo/${voucher.id}`, {
                                    responseType: "blob",
                                })
                                .then((res) => {
                                    const url = URL.createObjectURL(res.data);
                                    setBrandLogoUrls((prev) => ({ ...prev, [voucher.id]: url }));
                                })
                                .catch((err) =>
                                    console.error(
                                        `Error fetching brand logo for voucher ${voucher.id}:`,
                                        err
                                    )
                                );
                        }
                    });

                    setVouchers(voucherMap);
                }
            } catch (error) {
                setError("Failed to fetch vouchers");
            } finally {
                setLoading(false);
            }
        };

        if (userInformation) {
            fetchUserVouchers();
        }
    }, [userInformation]);

    const handleVoucherButtonClick = (voucher: Voucher, userVoucherId: string) => {
        setSelectedVoucher(voucher);
        setSelectedUserVoucherId(userVoucherId);
        setIsModalOpen(true);
    };

    const handleConfirm = async () => {
        if (selectedUserVoucherId && selectedVoucher) {
            try {
                // Copy the voucher code to the clipboard
                await navigator.clipboard.writeText(selectedVoucher.code);

                // Show an alert to the user
                alert(`Voucher code "${selectedVoucher.code}" copied to clipboard!`);

                // DELETE request to remove the voucher from the user-vouchers
                await instance.delete(
                    `${config.serverAddress}/user-vouchers/${selectedUserVoucherId}`
                );

                // Update state to remove the deleted voucher
                setUserVouchers((prev) =>
                    prev.filter((userVoucher) => userVoucher.id !== selectedUserVoucherId)
                );
                setSelectedVoucher(null);
                setSelectedUserVoucherId(null);
                setIsModalOpen(false);
            } catch (error) {
                console.error("Failed to delete voucher or copy code", error);
                setError("Failed to delete voucher or copy code");
            }
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex justify-center mt-10">
            <div className="flex flex-col">
                <p className="text-4xl font-bold mb-4">Vouchers</p>
                <div className=" bg-red-50 dark:bg-primary-950 border border-primary-100 p-10 rounded-xl ">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : userVouchers.length === 0 ? (
                        <p>You have no vouchers currently.</p>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {userVouchers.map((userVoucher) => {
                                const voucher = vouchers.get(userVoucher.voucherId);
                                return (
                                    <Card key={userVoucher.id} className="max-w-[500px]">
                                        <CardBody className="flex flex-row items-center gap-5">
                                            <Image
                                                alt={voucher?.brand || "No image available"}
                                                height={90}
                                                width={90}
                                                src={
                                                    brandLogoUrls[voucher?.id || ""] || "/default-logo.png"
                                                }
                                                style={{ objectFit: "cover" }}
                                                className="flex-shrink-0 mr-4"
                                            />
                                            <div className="flex flex-col">
                                                {voucher ? (
                                                    <>
                                                        <p className="font-bold">{voucher.brand}</p>
                                                        <p>{voucher.description}</p>
                                                        <p>
                                                            Expires on:{" "}
                                                            {new Date(
                                                                voucher.expirationDate
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p>Voucher details are unavailable.</p>
                                                )}
                                            </div>
                                            <div>
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    onClick={() => voucher && handleVoucherButtonClick(voucher, userVoucher.id)}
                                                >
                                                    <VoucherIcon />
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for using voucher */}
            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable={true}>
                <ModalContent className="w-full max-w-[400px]">
                    <ModalHeader className="flex justify-between items-center font-bold text-2xl text-red-900">
                        <p className="text-3xl font-bold text-red-900">Use Voucher</p>
                    </ModalHeader>
                    <ModalBody className="pb-8">
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p className="font-semibold">Do you want to use this voucher?</p>
                            {selectedVoucher && (
                                <>
                                    <p className="font-semibold">Brand: {selectedVoucher.brand}</p>
                                </>
                            )}
                        </div>
                    </ModalBody>
                    <div className="flex justify-end p-4 gap-4">
                        <Button variant="light" onClick={handleCancel}>Cancel</Button>
                        <Button color="danger" onClick={handleConfirm}>Yes</Button>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}
