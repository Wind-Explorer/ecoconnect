import React, { useState, useEffect } from 'react';
import DefaultLayout from "../layouts/default";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { Card, CardHeader, CardBody, CardFooter, Image, Button } from "@nextui-org/react";

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await instance.get(config.serverAddress + "/events");
        console.log("Fetched events data:", res.data); // Log the fetched data
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <DefaultLayout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-primary-600">Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <p className="text-gray-600">No events available.</p>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                  <h4 className="font-bold text-large">{event.title}</h4>
                </CardHeader>
                <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
                  <Image
                    alt={event.title}
                    className="object-cover rounded-xl"
                    src={event.imageUrl}
                    width="100%"
                    height={180}
                    data-disableanimation={true} // Use custom data attribute
                  />
                </CardBody>
                <CardFooter className="flex flex-col items-start p-4">
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <Button 
                    className="bg-primary-600 text-white rounded px-4 py-2 hover:bg-primary-700"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    View event details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventsPage;
