import { useState, useEffect } from 'react';
import DefaultLayout from "../layouts/default";
import { useNavigate } from 'react-router-dom';
import instance from "../security/http";
import config from "../config";

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    instance.get(config.serverAddress + "/events").then((res) => {
      setEvents(res.data);
    });
  }, []);

  return (
    <DefaultLayout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-red-600">Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={`${config.serverAddress}${event.imageUrl}`}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <button
                  className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  View event details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EventsPage;
