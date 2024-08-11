import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon, TrashIcon } from "../icons";
import axios from "axios";
import config from "../config";

const ManageEventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(config.serverAddress + "/events");
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`editEvent/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedEventId(id);
    setIsDeleteModalOpen(true);
  };

  const deleteEvent = async () => {
    if (selectedEventId === null) return;
    try {
      await axios.delete(`${config.serverAddress}/events/${selectedEventId}`);
      setEvents(events.filter((event) => event.id !== selectedEventId));
      setSelectedEventId(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-red-600">Manage Events</h2>
      </div>
      <Table aria-label="Manage Events Table">
        <TableHeader>
          <TableColumn>Event Name and Picture</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Time</TableColumn>
          <TableColumn>Location</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Event Category</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <span>{event.title}</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={`${config.serverAddress}/events/evtPicture/${event.id}`}
                      alt="Event Picture"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
              <TableCell>{event.time}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>{event.description}</TableCell>
              <TableCell>{event.category}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => handleEdit(event.id)}
                  >
                    <PencilSquareIcon />
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={() => handleDeleteClick(event.id)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        className="mt-6 bg-red-600 text-white"
        onPress={() => navigate("createEvent")}
      >
        Add events
      </Button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Event
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this event?</p>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Cancel</Button>
                <Button
                  color="danger"
                  onPress={() => {
                    deleteEvent();
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageEventsPage;
