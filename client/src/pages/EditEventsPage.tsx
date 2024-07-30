import React, { useState, useEffect } from 'react';
import DefaultLayout from "../layouts/default";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
import { ArrowUTurnLeftIcon } from "../icons";

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
  slotsAvailable: Yup.number().integer().required("Slots Available is required"),
  imageUrl: Yup.string().url("Invalid URL format").required("Image URL is required")
});

const EditEventsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    slotsAvailable: "",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${config.serverAddress}/events/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    console.log("Submitting form with values:", values); // Debug log
    try {
      const response = await axios.put(`${config.serverAddress}/events/${id}`, values);
      console.log("Server response:", response); // Debug log
      if (response.status === 200 || response.status === 201) {
        console.log("Event updated successfully:", response.data);
        resetForm(); // Clear form after successful submit
        navigate("/manageEvent");
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
    <DefaultLayout>
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
          enableReinitialize
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
              <NextUIFormikInput
                label="Location"
                name="location"
                type="text"
                placeholder="Enter event location"
                labelPlacement="inside"
              />
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
                  <p>Edit Events</p>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </DefaultLayout>
  );
};

export default EditEventsPage;