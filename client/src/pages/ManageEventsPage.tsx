import React, { useEffect, useState } from 'react';
import DefaultLayout from "../layouts/default";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Avatar, Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon, TrashIcon } from "../icons";
import axios from "axios";
import config from "../config";

const ManageEventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get(config.serverAddress + "/events");
      console.log("Fetched events data:", res.data); // Debug log
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/editEvent/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${config.serverAddress}/events/${id}`);
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <DefaultLayout>
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
                <div className="flex items-center">
                  <Avatar src={`${config.serverAddress}${event.imageUrl}`} className="mr-4" />
                  {event.title}
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
                    onPress={() => handleDelete(event.id)}
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
        onPress={() => navigate("/CreateEvent")}
      >
        Add events
      </Button>
    </DefaultLayout>
  );
};

export default ManageEventsPage;

