import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons"; // Make sure this path is correct

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the event ID from the URL
  const [event, setEvent] = useState<any>(null); // State to store event details
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log("Fetching event details for ID:", id); // Debug log
        const res = await instance.get(`${config.serverAddress}/events/${id}`);
        console.log("Fetched event details:", res.data); // Log the fetched data
        setEvent(res.data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className="w-full h-full p-8">
      <Button
        className="mb-4 bg-gray-200 text-black rounded px-4 py-2 hover:bg-gray-300"
        onClick={() => navigate(-1)}
      >
        <ArrowUTurnLeftIcon/>
        Back to Events
      </Button>
      <Card className="bg-white rounded-lg overflow-hidden border">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">{event.title}</h4>
        </CardHeader>
        <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
          <img
            alt={event.title}
            className="object-cover rounded-xl"
            src={event.imageUrl}
            width="100%"
            height={300}
          />
          <p className="text-gray-600 mt-4">{event.description}</p>
          <p className="text-gray-600 mt-2">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Category:</strong> {event.category}
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Slots Available:</strong> {event.slotsAvailable}
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default EventDetailsPage;
