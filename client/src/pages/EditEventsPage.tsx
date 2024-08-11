import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
import InsertImage from "../components/InsertImage";
import { ArrowUTurnLeftIcon } from "../icons";

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
  date: Yup.date().required("Date is required"),
  time: Yup.string().required("Time is required"),
  location: Yup.string().required("Location is required"),
  category: Yup.string().required("Category is required"),
  slotsAvailable: Yup.number()
    .integer()
    .required("Slots Available is required"),
  evtPicture: Yup.mixed(), // Make this optional if not required
});

const EditEventsPage = () => {
  const [eventData, setEventData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // State to handle image file
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const { id } = useParams(); // Get event ID from URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${config.serverAddress}/events/${id}`);
        console.log("Fetched event data:", res.data); // Log the fetched data
        setEventData(res.data);
        
        if (res.data.evtPicture) {
          // Optionally handle existing image
          setImageFile(null); // You might want to set this to the existing image URL if applicable
        }
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

    fetchEvent();
    fetchTownCouncils();
  }, [id]);

  const initialValues = {
    title: eventData?.title || "",
    description: eventData?.description || "",
    date: eventData?.date ? new Date(eventData.date).toLocaleDateString('en-CA') : "", // Convert date to YYYY-MM-DD format
    time: eventData?.time || "",
    location: eventData?.location || "",
    category: eventData?.category || "",
    slotsAvailable: eventData?.slotsAvailable || "",
    evtPicture: null, // Initialize with null or handle separately
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {

    console.log("From data:", values)
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("date", values.date);
    formData.append("time", values.time);
    formData.append("location", values.location);
    formData.append("category", values.category);
    formData.append("slotsAvailable", values.slotsAvailable);

    if (imageFile) {
      formData.append("evtPicture", imageFile); // Append image file to form data
    }

    try {
      const response = await axios.put(
        `${config.serverAddress}/events/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Server response:", response); // Debug log
      if (response.status === 200 || response.status === 201) {
        console.log("Event updated successfully:", response.data);
        resetForm(); // Clear form after successful submit
        setImageFile(null); // Reset image file state
        navigate("/admin/events");
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
            navigate(-1);
          }}
        >
          <ArrowUTurnLeftIcon />
        </Button>
      </section>
      <section className="w-8/12 mx-auto p-5 bg-red-100 border border-none rounded-2xl">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Ensure form updates with new data
        >
          {({ isValid, dirty, isSubmitting, setFieldValue }) => (
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
                <label className="block text-gray-700">Location</label>
                <select
                  name="location"
                  className="form-select mt-1 block w-full"
                  onChange={(e) => setFieldValue("location", e.target.value)}
                  value={eventData?.location || ""}
                >
                  <option value="">Select a town council</option>
                  {townCouncils.map((townCouncil, index) => (
                    <option key={index} value={townCouncil}>
                      {townCouncil}
                    </option>
                  ))}
                </select>
              </div>
              <NextUIFormikInput
                label="Category"
                name="category"
                type="text"
                placeholder="Enter event category"
                labelPlacement="inside"
              />
              <NextUIFormikInput
                label="Slots Available"
                name="slotsAvailable"
                type="number"
                placeholder="Enter slots available"
                labelPlacement="inside"
              />
              <div className="mb-4">
                <InsertImage
                  onImageSelected={(file) => {
                    setImageFile(file); // Set image file
                    setFieldValue("evtPicture", file); // Set form field value
                  }}
                  // Optionally handle displaying current image
                />
              </div>
              <div className="flex flex-row-reverse border">
                <Button
                  type="submit"
                  className="bg-red-600 text-white text-xl w-1/6"
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  <p>Edit Event</p>
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
