import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
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
  imageUrl: Yup.string()
    .url("Invalid URL format")
    .required("Image URL is required"),
});

const CreateEventsPage = () => {
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
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
    imageUrl: "",
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    console.log("Submitting form with values:", values); // Debug log
    try {
      const response = await axios.post(
        config.serverAddress + "/events",
        values
      );
      console.log("Server response:", response); // Debug log
      if (response.status === 200 || response.status === 201) {
        console.log("Event created successfully:", response.data);
        resetForm(); // Clear form after successful submit
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
                <label className="block text-gray-700">Location</label>
                <select
                  name="location"
                  className="form-select mt-1 block w-full"
                  onChange={(e) => setFieldValue("location", e.target.value)}
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
              <NextUIFormikInput
                label="Image URL"
                name="imageUrl"
                type="text"
                placeholder="Enter image URL"
                labelPlacement="inside"
              />
              <div className="flex flex-row-reverse border">
                <Button
                  type="submit"
                  className="bg-red-600 text-white text-xl w-1/6"
                  disabled={!isValid || !dirty || isSubmitting}
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
