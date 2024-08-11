import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Button,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { popErrorToast, popToast } from "../utilities";
import { ClipboardDocumentIcon, TrashDeleteIcon } from "../icons";

export default function TagManagement() {
    const [tagList, setTagList] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<any>(null);

    const columns = [
        { key: "tag", label: "TAG" },
        { key: "actions", label: "ACTIONS" },
    ];

    const populateTagList = () => {
        instance
            .get(`${config.serverAddress}/post/tags/all`)
            .then((response) => {
                setTagList(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                popErrorToast(error);
            });
    };
    useEffect(() => {
        populateTagList();
    }, []);

    const handleCopyID = (id: string, tag: string) => {
        navigator.clipboard.writeText(id);
        popToast(tag + "'s Tag ID has been copied!", 1);
    };

    const handleDeleteClick = (item: any) => {
        setTagToDelete(item);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (tagToDelete) {
            try {
                await instance.delete(
                    `${config.serverAddress}/post/tags/${tagToDelete.id}`
                );
                populateTagList();
                setIsModalOpen(false);
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    };

    return (
        <div>
            {!tagList && (<div className="flex w-full justify-center m-auto p-20 text-gray-500">There are currently no tags!</div>)}
            {tagList && (
                <div className="flex flex-col gap-8 p-8">
                    <p className="text-4xl font-bold">Tag Management</p>
                    <Table aria-label="Tag Management Table">
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn key={column.key} className={column.key === "actions" ? "text-right" : ""}>
                                    {column.label}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={tagList}>
                            {(tagEntry: any) => (
                                <TableRow key={tagEntry.id}>
                                    {(columnKey) => (
                                        <TableCell>
                                            {columnKey === "actions" ? (
                                                <div className="flex justify-end gap-2">
                                                    <Tooltip content="Copy ID">
                                                        <Button
                                                            variant="light"
                                                            isIconOnly
                                                            onClick={() => handleCopyID(tagEntry.id, tagEntry.tag)}
                                                            aria-label="Copy tagId">
                                                            <ClipboardDocumentIcon />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete Tag">
                                                        <Button
                                                            variant="light"
                                                            isIconOnly
                                                            onClick={() => handleDeleteClick(tagEntry)}
                                                            aria-label="Delete tag"
                                                            className="text-red-500">
                                                            <TrashDeleteIcon />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <p>{tagEntry.tag}</p>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        isDismissable={false}
                        isKeyboardDismissDisabled={true}
                    >
                        <ModalContent>
                            <>
                                <ModalHeader className="flex flex-col text-danger gap-1">
                                    {tagToDelete?.tag
                                        ? `DELETING TAG: ${tagToDelete.tag}`
                                        : "Delete tag"}
                                </ModalHeader>
                                <ModalBody>
                                    <p>Are you sure you want to delete this tag?</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button color="danger" onPress={handleDeleteConfirm}>
                                        Delete
                                    </Button>
                                </ModalFooter>
                            </>
                        </ModalContent>
                    </Modal>
                </div>
            )}
        </div>
    )
}
