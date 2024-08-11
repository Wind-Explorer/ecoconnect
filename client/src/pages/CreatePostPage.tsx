import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
import { ArrowUTurnLeftIcon } from "../icons";
import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import InsertPostImage from "../components/InsertPostImage";
import TagInput from "../components/TagInput";

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
  postImage: Yup.mixed(),
});

function CreatePostPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  // Add state for image selection
  const [tags, setTags] = useState<string[]>([]);

  const initialValues = {
    title: "",
    content: "",
    postImage: null,
    tags: "",
    userId: "",
  };

  useEffect(() => {
    const getUserInformation = async () => {
      try {
        const user = await retrieveUserInformation(); // Get the user ID
        setUserId(user.id); // Set the user ID in the state
      } catch (error) {
        console.error(error);
      }
    };
    getUserInformation();
  }, []);

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError, setFieldValue }: any
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      if (values.postImage) {
        formData.append("postImage", values.postImage);
      }
      formData.append("tags", JSON.stringify(tags));
      formData.append("userId", userId || ""); // Ensure userId is appended to formData

      console.log("Submitting formData:", formData);

      const response = await axios.post(config.serverAddress + "/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("Post created successfully:", response.data);
        resetForm(); // Clear form after successful submit
        setTags([]);
        setFieldValue("postImage", null);
        navigate(-1);
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
      <section className="w-8/12 mx-auto p-5 bg-primary-100 border border-none rounded-2xl">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting, setFieldValue }) => (
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
              <div>
                <NextUIFormikTextarea
                  label="Content"
                  name="content"
                  placeholder="Write your post content here"
                />
              </div>
              <div>
                <TagInput tags={tags} setTags={setTags} />
              </div>
              <div className="text-sm">
                <div className="flex flex-row gap-10">
                  <InsertPostImage
                    onImageSelected={(file) => {
                      setFieldValue("postImage", file);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row-reverse">
                <Button
                  type="submit"
                  className="bg-primary-950 text-white text-xl w-1/12"
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  <p>Post</p>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}

export default CreatePostPage;
