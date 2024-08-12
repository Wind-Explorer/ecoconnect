import { useState, useEffect } from "react";
import { Button, Input, Image } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
import { ArrowUTurnLeftIcon } from "../icons";
import EventsPicture from "../components/EventsPicture";
import NextUIFormikSelect from "../components/NextUIFormikSelect";
import instance from "../security/http"

// Validation schema
const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .matches(
      /^[a-zA-Z0-9\s]+$/,
      "Title can only contain letters, numbers, and spaces"
    )
    .required("Title is required"),
  description: Yup.string()
    .trim()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must be at most 500 characters")
    .matches(
      /^[a-zA-Z0-9,\s!"'-]*$/,
      "Only letters, numbers, commas, spaces, exclamation marks, quotations, and common symbols are allowed"
    )
    .required("Description is required"),
  date: Yup.date()
    .min(new Date(), "Date must be in the future")
    .required("Date is required"),
  time: Yup.string().required("Time is required"),
  location: Yup.string().required("Location is required"),
  category: Yup.string()
    .oneOf(["Events", "Workshops", "Educational Talks"], "Invalid category")
    .required("Category is required"),
  evtPicture: Yup.mixed(), // Make this optional if not required
});

const EditEventsPage = () => {
  const [eventData, setEventData] = useState<any>(null);
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const { id } = useParams(); // Get event ID from URL
  const navigate = useNavigate();

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${config.serverAddress}/events/${id}`);
      console.log("Fetched event data:", res.data); // Log the fetched data
      setEventData(res.data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    }
  };

  const fetchTownCouncils = async () => {
    try {
      const res = await axios.get(`${config.serverAddress}/users/town-councils-metadata`);
      setTownCouncils(JSON.parse(res.data).townCouncils);
    } catch (error) {
      console.error("Failed to fetch town councils:", error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchTownCouncils();
  }, []);

  const initialValues = {
    title: eventData?.title || "",
    description: eventData?.description || "",
    date: eventData?.date ? new Date(eventData.date).toLocaleDateString('en-CA') : "", // Convert date to YYYY-MM-DD format
    time: eventData?.time || "",
    location: eventData?.location || "",
    category: eventData?.category || "",
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    try {
      const response = await instance.put(
        `${config.serverAddress}/events/${id}`,
        values,
      );
      console.log("Server response:", response); // Debug log
      if (response.status === 200 || response.status === 201) {
        console.log("Event updated successfully:", response.data);
        resetForm(); // Clear form after successful submit
        window.location.href = "/admin/events";
      } else {
        console.error("Error updating event:", response.statusText);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.field) {
        setFieldError(error.response.data.field, error.response.data.error);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full">
      <section className="w-8/12 mx-auto">
        <Button
          variant="light"
          onPress={() => {
            window.location.href = "/admin/events";
          }}
        >
          <ArrowUTurnLeftIcon />
        </Button>
      </section>
      <section className="w-8/12 mx-auto p-5 bg-primary-100 border border-none rounded-2xl">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Ensure form updates with new data
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col gap-5">
              <NextUIFormikInput
                label="Title"
                name="title"
                type="text"
                placeholder="Enter your event title"
                labelPlacement="inside"
              />
              <NextUIFormikTextarea
                label="Description"
                name="description"
                placeholder="Enter event description"
              />
              <NextUIFormikInput
                label="Date"
                name="date"
                type="date"
                placeholder="Enter event date"
                labelPlacement="inside"
              />
              <NextUIFormikInput
                label="Time"
                name="time"
                type="time"
                placeholder="Enter event time"
                labelPlacement="inside"
              />
              <div>
                {townCouncils.length > 0 && (
                  <NextUIFormikSelect
                    label="Town council"
                    name="location"
                    placeholder="Choose the town council for the event"
                    labelPlacement="inside"
                    options={townCouncils.map((townCouncil) => ({
                      key: townCouncil,
                      label: townCouncil,
                    }))}
                  />
                )}
              </div>
              <NextUIFormikSelect
                label="Category"
                name="category"
                placeholder="Enter event category"
                labelPlacement="inside"
                options={[
                  { key: 'Events', label: 'Events' },
                  { key: 'Workshops', label: 'Workshops' },
                  { key: 'Educational Talks', label: 'Educational Talks' },
                ]}
              />
              <div className="mb-4 flex flex-col ">
                <p className="text-lg font-semibold mb-2 opacity-70">Click the image to change it</p>
                <EventsPicture eventId={id as string} editable/>
              </div>
              <div className="flex flex-row-reverse">
                <Button
                  type="submit"
                  className="bg-primary-600 text-white text-xl"
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  <p>Save</p>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
};

export default EditEventsPage;
