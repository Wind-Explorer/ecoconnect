import DefaultLayout from "../layouts/default";
import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import config from "../config";
import instance from "../security/http";
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

function editPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instance.get(config.serverAddress + `/post/${id}`).then((res) => {
      setPost(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    try {
      const response = await instance.put(
        config.serverAddress + `/post/${id}`,
        values
      );
      if (response.status === 200) {
        console.log("Post updated successfully:", response.data);
        resetForm();
        navigate("/community");
      } else {
        console.error("Error updating post:", response.statusText);
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
        {!loading && (
          <Formik
            initialValues={post}
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
                    className="bg-red-color text-white text-xl w-1/6"
                    disabled={!isValid || !dirty || isSubmitting}
                  >
                    <p>Update</p>
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </section>
    </DefaultLayout>
  );
}

export default editPost;
