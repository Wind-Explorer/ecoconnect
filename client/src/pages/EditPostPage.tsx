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
import InsertPostImage from "../components/InsertPostImage";
import TagInput from "../components/TagInput";

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .required("Title is required"),
  content: Yup.string()
    .trim()
    .min(3, "Content must be at least 3 characters")
    .max(3000, "Content must be at most 3000 characters")
    .required("Content is required"),
  postImage: Yup.mixed(),
});

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [post, setPost] = useState({
    title: "",
    content: "",
    postImage: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await instance.get(`${config.serverAddress}/post/${id}`);
        const postData = response.data;

        if (postData && postData.Tags) {
          const postTags = postData.Tags.map((tagObject: any) => tagObject.tag);
          setTags(postTags);
        }

        setPost({
          ...postData,
          postImage: postData.postImage ? `${config.serverAddress}/post/post-image/${id}` : "",
          tags: tags,
        });

      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError, setFieldValue }: any
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);

      if (values.postImage && values.postImage instanceof File) {
        formData.append("postImage", values.postImage);
      }
      formData.append("tags", JSON.stringify(tags));

      const response = await instance.put(
        config.serverAddress + `/post/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        resetForm();
        setTags([]);
        setFieldValue("postImage", null);
        navigate(-1);
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
      <section className="w-8/12 mx-auto p-5 bg-primary-100 dark:bg-primary-950 border border-none rounded-2xl">
        {!loading && (
          <Formik
            initialValues={{ ...post, tags: tags || [] }}
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
                  <TagInput
                    tags={tags}
                    setTags={(newTags) => {
                      setTags(newTags);
                      setFieldValue("tags", newTags); // Update Formik's state
                    }}
                  />
                </div>
                <div className="text-sm">
                  <div className="flex flex-row gap-10">
                    <InsertPostImage
                      onImageSelected={(file) => setFieldValue("postImage", file)}
                      initialImageUrl={post.postImage} // Pass the image URL here
                    />
                  </div>
                </div>
                <div className="flex flex-row-reverse">
                  <Button
                    type="submit"
                    className="bg-primary-950 dark:bg-primary-600 text-white text-xl w-1/6"
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
    </div>
  );
}

export default EditPostPage;
