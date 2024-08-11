import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import NextUIFormikSelect from "../components/NextUIFormikSelect";
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
  evtPicture: Yup.mixed().required("Event picture is required"),
});

const CreateEventsPage = () => {
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null); // State to handle image file
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTownCouncils = async () => {
      try {
        const res = await axios.get(`${config.serverAddress}/users/town-councils-metadata`);
        setTownCouncils(JSON.parse(res.data).townCouncils);
      } catch (error) {
        console.error("Failed to fetch town councils:", error);
      }
    };

    fetchTownCouncils();
  }, []);

  const initialValues = {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    slotsAvailable: "",
    evtPicture: null, // Initialize with null
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
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
      const response = await axios.post(
        config.serverAddress + "/events",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Server response:", response); // Debug log
      if (response.status === 200 || response.status === 201) {
        console.log("Event created successfully:", response.data);
        resetForm(); // Clear form after successful submit
        setImageFile(null); // Reset image file state
        navigate(-1);
      } else {
        console.error("Error creating event:", response.statusText);
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
                  label="Event image"
                  onImageSelected={(file) => {
                    setImageFile(file); // Set image file
                    setFieldValue("evtPicture", file); // Set form field value
                  }}
                />
              </div>
              <div className="flex flex-row-reverse border">
                <Button
                  type="submit"
                  className="bg-red-600 text-white text-xl w-1/6"
                  disabled={!isValid || !dirty || isSubmitting || !imageFile}
                >
                  <p>Create Event</p>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
};

export default CreateEventsPage;
