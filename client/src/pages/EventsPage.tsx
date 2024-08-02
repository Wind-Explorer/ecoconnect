import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
} from "@nextui-org/react";

interface Event {
  id: number;
  title: string;
  category: string;
  location: string;
  time: string;
  description: string;
  evtPicture: string; // Changed to evtPicture
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTownCouncil, setSelectedTownCouncil] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await instance.get<Event[]>(
          `${config.serverAddress}/events`
        );
        console.log("Fetched events data:", res.data);
        setEvents(res.data);
        setFilteredEvents(res.data);

        // Extract unique categories and locations from events
        const uniqueCategories = Array.from(
          new Set(res.data.map((event) => event.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    const fetchTownCouncils = async () => {
      try {
        const res = await axios.get(
          `${config.serverAddress}/users/town-councils-metadata`
        );
        setTownCouncils(JSON.parse(res.data).townCouncils);
      } catch (error) {
        console.error("Failed to fetch town councils:", error);
      }
    };

    fetchEvents();
    fetchTownCouncils();
  }, []);

  useEffect(() => {
    // Filter events based on selected criteria
    const filtered = events.filter((event) => {
      const matchCategory = selectedCategory
        ? event.category === selectedCategory
        : true;
      const matchTownCouncil = selectedTownCouncil
        ? event.location === selectedTownCouncil
        : true;
      const matchTime = selectedTime 
      ? event.time.toLowerCase().trim() === selectedTime.toLowerCase().trim() 
      : true;

      console.log('Event Time:', event.time);
      console.log(`Filtering: ${event.title} | Category: ${matchCategory} | Town Council: ${matchTownCouncil} | Time: ${matchTime}`);

      return matchCategory && matchTownCouncil && matchTime;
    });

    setFilteredEvents(filtered);
  }, [selectedCategory, selectedTownCouncil, selectedTime, events]);

  return (
    <div className="w-full h-full">
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-primary-600">Events</h2>
        </div>
        {/* Filter Options */}
        <div className="mb-6 flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

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

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">All Times</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        {/* Event List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-600">No events available.</p>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id}
              style={{
                maxWidth: '600px',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                  <h4 className="font-bold text-large">{event.title}</h4>
                </CardHeader>
                <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
                  {event.evtPicture && (
                    <div className="relative w-full" style={{ paddingBottom: '0%', overflow: "hidden",marginBottom: '0px' /* 16:9 aspect ratio */ }}>
                      <Image
                        alt={event.title}
                        src={`${config.serverAddress}/events/evtPicture/${event.id}`}
                        style={{
                          height: '430px',
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '0.375rem',
                        }}
                      />
                    </div>
                  )}
                </CardBody>
                <CardFooter className="flex flex-col items-start p-4"style={{ paddingTop: '0px' }}>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <Button
                    className="bg-primary-600 text-white rounded px-4 py-2 hover:bg-primary-700"
                    onClick={() => navigate(`/events/view/${event.id}`)}
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

export default EventsPage;
