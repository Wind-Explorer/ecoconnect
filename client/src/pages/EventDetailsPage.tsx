import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import { Card, CardHeader, CardBody, Button, CardFooter } from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons"; // Make sure this path is correct

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the event ID from the URL
  const [event, setEvent] = useState<any>(null); // State to store event details
  const [similarEvents, setSimilarEvents] = useState<any[]>([]); // State to store similar events
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log("Fetching event details for ID:", id); // Debug log
        const res = await instance.get(`${config.serverAddress}/events/${id}`);
        console.log("Fetched event details:", res.data); // Log the fetched data
        setEvent(res.data);

        // Fetch all events to find similar ones
        const allEventsRes = await instance.get(`${config.serverAddress}/events`);
        const allEvents = allEventsRes.data;

        // Find similar events based on location and category, excluding the current event
        const similar = allEvents.filter((e: any) =>
          e.id !== Number(id) && // Make sure to exclude the current event
          (e.location === res.data.location || e.category === res.data.category)
        );

        setSimilarEvents(similar);
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
        onClick={() => navigate('/events')} // Navigate directly to the events page
      >
        <ArrowUTurnLeftIcon />
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
          <Button
            className="mt-4 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
            onClick={() => navigate(`/register/${id}`)}
          >
            Register for Event
          </Button>
        </CardBody>
      </Card>

      {/* Similar Events Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Similar Events You Might Be Interested In</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarEvents.length === 0 ? (
            <p className="text-gray-600">No similar events available.</p>
          ) : (
            similarEvents.map((similarEvent: any) => (
              <Card key={similarEvent.id} className="bg-white rounded-lg overflow-hidden border">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                  <h4 className="font-bold text-large">{similarEvent.title}</h4>
                </CardHeader>
                <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
                  <img
                    alt={similarEvent.title}
                    className="object-cover rounded-xl"
                    src={similarEvent.imageUrl}
                    width="100%"
                    height={180}
                  />
                </CardBody>
                <CardFooter className="flex flex-col items-start p-4">
                  <Button
                    className="bg-primary-600 text-white rounded px-4 py-2 hover:bg-primary-700"
                    onClick={() => navigate(`/event/${similarEvent.id}`)}
                  >
                    View event details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
