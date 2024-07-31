import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import instance from "../security/http";
import { PencilSquareIcon, PlusIcon, TrashDeleteIcon } from "../icons";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, SortDescriptor, Link as NextUILink } from "@nextui-org/react";

interface Schedule {
    id: number;
    dateTime: string;
    location: string;
    postalCode: string;
    status: string;
}

export default function ManageSchedulePage() {
    const navigate = useNavigate();
    const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
    const [scheduleIdToDelete, setScheduleIdToDelete] = useState<number | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'dateTime',
        direction: 'ascending',
    });

    useEffect(() => {
        instance.get('/schedule')
            .then((res) => {
                const schedules = res.data.map((schedule: Schedule) => ({
                    ...schedule,
                    dateTime: new Date(schedule.dateTime), // Convert to Date object
                }));
                setScheduleList(schedules);
            })
            .catch((err) => {
                console.error('Error fetching schedules:', err);
            });
    }, []);

    const handleEdit = (id: number) => {
        navigate(`edit-schedule/${id}`);
    };


    const deleteSchedule = () => {
        if (scheduleIdToDelete !== null) {
            instance.delete(`/schedule/${scheduleIdToDelete}`)
                .then((res) => {
                    console.log(res.data);
                    setScheduleList((prev) => prev.filter(schedule => schedule.id !== scheduleIdToDelete));
                    onOpenChange();
                    setScheduleIdToDelete(null);
                })
                .catch((err) => {
                    console.error('Error deleting schedule:', err);
                });
        }
    };

    const sortScheduleList = (list: Schedule[], descriptor: SortDescriptor) => {
        const { column, direction } = descriptor;

        const sortedList = [...list].sort((a, b) => {
            switch (column) {
                case 'dateTime':
                    const dateA = new Date(a.dateTime);
                    const dateB = new Date(b.dateTime);
                    return direction === 'ascending' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                case 'location':
                    return direction === 'ascending' ? a.location.localeCompare(b.location) : b.location.localeCompare(a.location);
                case 'postalCode':
                    return direction === 'ascending' ? a.postalCode.localeCompare(b.postalCode) : b.postalCode.localeCompare(a.postalCode);
                case 'status':
                    return direction === 'ascending' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
                default:
                    throw new Error(`Unsupported column: ${column}`);
            }
        });

        return sortedList;
    };

    const handleSort = () => {
        const { column, direction } = sortDescriptor;
        const newDirection = direction === 'ascending' ? 'descending' : 'ascending';

        setSortDescriptor({ column, direction: newDirection });
    };

    const renderSortIndicator = () => {
        if (sortDescriptor.direction === 'ascending') {
            return <span>&uarr;</span>;
        } else {
            return <span>&darr;</span>;
        }
    };

    const sortedScheduleList = sortScheduleList(scheduleList, sortDescriptor);

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="inline-block text-center justify-center flex flex-row gap-10">
                <p className="text-3xl font-bold">Admin Karang Guni Schedule</p>
                <Link to="/Addschedules">
                    <Button
                        isIconOnly
                        color="primary"
                        onPress={() => navigate("create-schedule")}
                    >
                        <PlusIcon />
                    </Button>
                </Link>
            </div>
            <div className="w-full overflow-auto max-w-screen-lg">
                <Table aria-label="Schedule Table">
                    <TableHeader>
                        <TableColumn>
                            <NextUILink className="font-normal text-[12px] opacity-70" color="foreground" onClick={handleSort}>Date{renderSortIndicator()}</NextUILink>
                        </TableColumn>
                        <TableColumn>Time</TableColumn>
                        <TableColumn>Location</TableColumn>
                        <TableColumn>Postal Code</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Action</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {sortedScheduleList.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell>{((schedule.dateTime as unknown) as Date).toLocaleDateString()}</TableCell>
                                <TableCell>{((schedule.dateTime as unknown) as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                <TableCell>{schedule.location}</TableCell>
                                <TableCell>{schedule.postalCode}</TableCell>
                                <TableCell>{schedule.status}</TableCell>
                                <TableCell>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        color="success"
                                        onPress={() => handleEdit(schedule.id)}
                                    >
                                        <PencilSquareIcon />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        color="danger"
                                        variant="light"
                                        onPress={() => { setScheduleIdToDelete(schedule.id); onOpen(); }}>
                                        <TrashDeleteIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Schedule</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this schedule?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="danger" onPress={() => { deleteSchedule(); onClose(); }}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    )
}

