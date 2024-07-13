import DefaultLayout from "../layouts/default";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  content: Yup.string()
    .trim()
    .min(3, "Content must be at least 3 characters")
    .max(500, "Content must be at most 500 characters")
    .matches(
      /^[a-zA-Z0-9,\s!"'-]*$/,
      "Only letters, numbers, commas, spaces, exclamation marks, quotations, and common symbols are allowed"
    )
    .required("Content is required"),
});

function CreatePostPage() {
  const navigate = useNavigate();

  const initialValues = {
    title: "",
    content: "",
    tags: "",
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    try {
      const response = await axios.post(config.serverAddress + "/post", values); // Assuming an API route
      if (response.status === 200) {
        console.log("Post created successfully:", response.data);
        resetForm(); // Clear form after successful submit
        navigate("/community");
      } else {
        console.error("Error creating post:", response.statusText);
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
      <section className="w-8/12 mx-auto p-5 bg-primary-100 border border-none rounded-2xl">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col gap-5">
              <div>
                <NextUIFormikInput
                  label="Title"
                  name="title"
                  type="text"
                  placeholder="Enter your post title"
                  labelPlacement="inside"
                />
              </div>
              <div className="text-sm">
                <p>Image</p>
              </div>
              <div>
                <NextUIFormikTextarea
                  label="Content"
                  name="content"
                  placeholder="Write your post content here"
                />
              </div>
              <div>
                <NextUIFormikInput
                  label="Tags (Optional)"
                  name="tags"
                  type="text"
                  placeholder="Enter tags"
                  labelPlacement="inside"
                />
              </div>
              <div className="flex flex-row-reverse border">
                <Button
                  type="submit"
                  className="bg-primary-color text-white text-xl w-1/6"
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  <p>Post</p>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </DefaultLayout>
  );
}

export default CreatePostPage;
