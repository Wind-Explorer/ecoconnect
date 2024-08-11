import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import config from "../config";
import instance from "../security/http";
import { PencilSquareIcon, PlusIcon, TrashDeleteIcon } from "../icons";

interface Voucher {
    id: number;
    brand: string;
    description: string;
    expirationDate: Date;
    quantityAvailable: number;
    code: string;
}

export default function ManageVoucherPage() {
    const navigate = useNavigate();
    const [voucherList, setVoucherList] = useState<Voucher[]>([]);
    const [brandLogoUrls, setBrandLogoUrls] = useState<{ [key: number]: string }>({});
    const [voucherIdToDelete, setVoucherIdToDelete] = useState<number | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        getVouchers();
    }, []);

    const getVouchers = () => {
        instance
            .get(config.serverAddress + "/vouchers")
            .then((res) => {
                const vouchers = res.data.map((voucher: Voucher) => ({
                    ...voucher,
                    expirationDate: new Date(voucher.expirationDate),
                }));
                vouchers.sort(
                    (a: Voucher, b: Voucher) =>
                        b.expirationDate.getTime() - a.expirationDate.getTime()
                );
                setVoucherList(vouchers);

                // Fetch brand logos
                fetchBrandLogos(vouchers);
            })
            .catch((err) => {
                console.error("Error fetching vouchers:", err);
            });
    };

    const fetchBrandLogos = (vouchers: Voucher[]) => {
        const urls: { [key: number]: string } = {};
        vouchers.forEach((voucher) => {
            instance
                .get(`${config.serverAddress}/vouchers/brandLogo/${voucher.id}`, { responseType: "blob" })
                .then((res) => {
                    const url = URL.createObjectURL(res.data);
                    urls[voucher.id] = url;
                    setBrandLogoUrls((prev) => ({ ...prev, ...urls }));
                })
                .catch((err) => {
                    console.error(`Error fetching brand logo for voucher ${voucher.id}:`, err);
                });
        });
    };

    const handleEdit = (id: number) => {
        navigate(`edit-voucher/${id}`);
    };

    const handleDelete = (id: number) => {
        setVoucherIdToDelete(id);
        setShowConfirmDelete(true);
    };

    const deleteVoucher = () => {
        if (voucherIdToDelete !== null) {
            instance.delete(`/vouchers/${voucherIdToDelete}`)
                .then((res) => {
                    console.log(res.data);
                    setVoucherList((prev) => prev.filter(voucher => voucher.id !== voucherIdToDelete));
                    setShowConfirmDelete(false);
                    setVoucherIdToDelete(null);
                })
                .catch((err) => {
                    console.error("Error deleting voucher:", err);
                });
        }
    };

    return (
        <div className="w-full h-full">
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="flex flex-row gap-10">
                    <p className="text-2xl font-bold">Manage Vouchers</p>
                    <div>
                        <Button
                            isIconOnly
                            onPress={() => navigate("create-voucher")}
                        >
                            <PlusIcon />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <Table aria-label="Voucher Table">
                        <TableHeader>
                            <TableColumn>Brand Logo</TableColumn>
                            <TableColumn>Brand</TableColumn>
                            <TableColumn>Description</TableColumn>
                            <TableColumn>Expiration Date</TableColumn>
                            <TableColumn>Quantity Available</TableColumn>
                            <TableColumn>Code</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {voucherList.map((voucher) => (
                                <TableRow key={voucher.id}>
                                    <TableCell>
                                        {brandLogoUrls[voucher.id] && (
                                            <img
                                                src={brandLogoUrls[voucher.id]}
                                                alt={voucher.brand}
                                                style={{ width: "50px", height: "50px" }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{voucher.brand}</TableCell>
                                    <TableCell>{voucher.description}</TableCell>
                                    <TableCell>
                                        {voucher.expirationDate.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{voucher.quantityAvailable}</TableCell>
                                    <TableCell>{voucher.code}</TableCell>
                                    <TableCell>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            color="success"
                                            onPress={() => handleEdit(voucher.id)}>
                                            <PencilSquareIcon />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            color="danger"
                                            onPress={() => handleDelete(voucher.id)}>
                                            <TrashDeleteIcon />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Confirmation Modal for Deleting */}
                <Modal
                    isOpen={showConfirmDelete}
                    onOpenChange={setShowConfirmDelete}
                    isDismissable={false}
                    isKeyboardDismissDisabled={true}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Delete Voucher
                                </ModalHeader>
                                <ModalBody>
                                    <p>Are you sure you want to delete this voucher?</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        No
                                    </Button>
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            deleteVoucher();
                                            onClose();
                                        }}
                                    >
                                        Yes
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </section>
        </div>
    );
}
