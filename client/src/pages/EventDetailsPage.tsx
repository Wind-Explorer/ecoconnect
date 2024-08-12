import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../security/http";
import config from "../config";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons"; // Make sure this path is correct

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the event ID from the URL
  const [event, setEvent] = useState<any>(null); // State to store event details
  const [similarEvents, setSimilarEvents] = useState<any[]>([]); // State to store similar events
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAlreadyRegisteredModalOpen, setIsAlreadyRegisteredModalOpen] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const navigate = useNavigate();

  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/signin");
  }
  const fetchEventDetails = () => {
    try {
      console.log("Fetching event details for ID:", id); // Debug log
      instance.get(`${config.serverAddress}/events/${id}`).then((res) => {
        console.log("Fetched event details:", res.data); // Log the fetched data
        if (res.data.slotsAvailable === 0) {
          navigate("/events"); // Redirect if there are no slots available
          return;
        }
        setEvent(res.data);

        // Log the image data to debug
        console.log("Event image data:", res.data.evtPicture);

        // Fetch all events to find similar ones
        instance.get(
          `${config.serverAddress}/events`
        ).then((allEventsRes) => {
          const allEvents = allEventsRes.data;

          // Find similar events based on location and category, excluding the current event
          const similar = allEvents.filter(
            (e: any) =>
              e.id !== Number(id) && // Make sure to exclude the current event
              e.slotsAvailable > 0 && // Ensure similar events have available slots
              (e.location === res.data.location ||
                e.category === res.data.category)
          );

          console.log("Similar events found:", similar); 

          setSimilarEvents(similar);
        });

        // Check if the user has already registered
        const registeredStatus = localStorage.getItem(`hasRegistered_${id}`);
        if (registeredStatus === 'true') {
          setHasRegistered(true);
        } else {
          setHasRegistered(false);
        }
      });
    } catch (error) {
      console.error("Failed to fetch event details:", error);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    console.log("Attempting to register...");
    console.log("Current hasRegistered value:", hasRegistered);
  
    if (hasRegistered) {
      console.log("User has already registered, opening modal...");
      setIsAlreadyRegisteredModalOpen(true);
      return;
    }
  
    setIsRegistering(true);
  
    try {
      // Make a request to register for the event
      const response = await instance.post(`${config.serverAddress}/events/register/${id}`);
  
      // Check if registration was successful
      if (response.status === 200) {
        // Fetch updated event details to reflect the new number of available slots
        const updatedEventRes = await instance.get(`${config.serverAddress}/events/${id}`);
        setEvent(updatedEventRes.data);
  
        console.log("Registration successful");
        setHasRegistered(true);
        localStorage.setItem(`hasRegistered_${id}`, 'true'); // Save registration status in local storage
  
        setIsSuccessModalOpen(true);
      } else if (response.status === 400) {
        // Handle case where the user is already registered
        setIsAlreadyRegisteredModalOpen(true);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle different types of errors
      if (error) {
        console.error("Server response error:", error);
      } else {
        console.error("Network error:", error);
      }
    } finally {
      setIsRegistering(false);
    }
  
    console.log("Updated hasRegistered value:", hasRegistered);
  };  

  return (
    <>
      {event && <div className="w-full h-full p-8">
        <Button
          className="mb-4 bg-gray-200 text-black rounded px-4 py-2 hover:bg-gray-300"
          onClick={() => navigate("/events")} // Navigate directly to the events page
        >
          <ArrowUTurnLeftIcon />
          Back to Events
        </Button>
        <Card className="bg-white rounded-lg overflow-hidden border">
          <div className="flex">
            {/* Event Image Section */}
            {event.evtPicture && (
              <div className="w-1/3 p-4">
                <img
                  src={`${config.serverAddress}/events/evtPicture/${event.id}`}
                  alt="Event Picture"
                  className="w-full h-auto rounded-lg"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
            {/* Event Details Section */}
            <div className="w-2/3 p-4">
              <CardHeader className="pb-0 pt-2">
                <h4 className="font-bold text-large">{event.title}</h4>
              </CardHeader>
              <CardBody className="pb-0 pt-2">
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
                  onClick={() => handleRegister()}
                  disabled={isRegistering}
                >
                  Register for Event
                </Button>
              </CardBody>
            </div>
          </div>
        </Card>

        {/* Similar Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Similar Events You Might Be Interested In
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarEvents.length === 0 ? (
              <p className="text-gray-600">No similar events available.</p>
            ) : (
              similarEvents.map((similarEvent: any) => (
                <Card
                  key={similarEvent.id}
                  className="bg-white rounded-lg overflow-hidden border"
                >
                  <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                    <h4 className="font-bold text-large">{similarEvent.title}</h4>
                  </CardHeader>
                  <CardBody className="pb-0 pt-2 px-4 flex-col items-start">
                    {similarEvent.evtPicture && (
                      <div style={{
                        width: '450px',
                        height: '300px',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        position: 'relative'
                      }}>
                        <img
                          src={`${config.serverAddress}/events/evtPicture/${similarEvent.id}`}
                          alt="Event Picture"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/path/to/placeholder-image.png'; // Fallback image if loading fails
                          }}
                        />
                      </div>
                    )}
                  </CardBody>
                  <CardFooter className="flex flex-col items-start p-4">
                    <Button
                      className="bg-primary-600 text-white rounded px-4 py-2 hover:bg-primary-700"
                      onClick={() => {
                        console.log(`Navigating to event details for ID: ${similarEvent.id}`);
                        console.log("Access Token:", localStorage.getItem("accessToken"));
                        navigate(`/events/view/${similarEvent.id}`);
                      }}
                    >
                      View event details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
        {/* Success Confirmation Modal */}
        <Modal
          isOpen={isSuccessModalOpen}
          onOpenChange={setIsSuccessModalOpen}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Success Message
                </ModalHeader>
                <ModalBody>
                  <p>You have successfully registered for this event!!</p>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onClose}>Cancel</Button>
                  <Button
                    color="danger"
                    onPress={() => {
                      navigate(-1);
                    }}
                  >
                    Okay
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Already Registered Modal */}
        <Modal
          isOpen={isAlreadyRegisteredModalOpen}
          onOpenChange={setIsAlreadyRegisteredModalOpen}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Already Registered
                </ModalHeader>
                <ModalBody>
                  <p>You have already registered for this event.</p>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onClose}>Close</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>}
      {!event && <p>Loading...</p>}
    </>

  );
};

export default EventDetailsPage;
