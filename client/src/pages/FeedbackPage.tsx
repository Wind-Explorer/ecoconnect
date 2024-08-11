import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import { useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Formik, Form } from "formik";
import * as Yup from "yup";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { Button, Checkbox } from "@nextui-org/react";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import NextUIFormikSelect from "../components/NextUIFormikSelect";
import instance from "../security/http";
import config from "../config";
import { popErrorToast, popToast } from "../utilities";

export default function FeedbackPage() {
  const [userInformation, setUserInformation] = useState<any>();
  const navigate = useNavigate();
  useEffect(() => {
    retrieveUserInformation()
      .then((response) => {
        setUserInformation(response);
      })
      .catch(() => {
        navigate("/signin");
      });
  }, []);

  const validationSchema = Yup.object({
    feedbackCategory: Yup.string().trim().required("Select feedback type."),
    subject: Yup.string().trim().min(1).max(100).required("Enter a subject."),
    comment: Yup.string()
      .trim()
      .min(1)
      .max(1024)
      .required("Enter your comments."),
    allowContact: Yup.boolean().oneOf([true, false], "please decide"),
  });

  const initialValues = {
    feedbackCategory: "",
    subject: "",
    comment: "",
    allowContact: false,
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log(values.feedbackCategory);
      instance
        .post(config.serverAddress + "/feedback", {
          ...values,
          userId: userInformation.id,
          feedbackCategory: parseInt(values.feedbackCategory),
        })
        .then(() => {
          popToast("Your feedback has been submitted!", 1);
          navigate("/springboard");
        });
    } catch (error) {
      popErrorToast(error);
    }
  };
  return (
    <>
      {userInformation && (
        <div className="">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <p className="text-3xl font-bold">Feedback</p>
              <p>
                Use the form below to send us your comments. We read all
                feedback carefully, but we are unable to respond to each
                submission individually.
              </p>
            </div>
            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row gap-4">
                        <NextUIFormikInput
                          label="Subject"
                          name="subject"
                          type="text"
                          placeholder=""
                          labelPlacement="inside"
                        />
                        <div className="w-96">
                          <NextUIFormikSelect
                            label="Feedback category"
                            name="feedbackCategory"
                            placeholder=""
                            labelPlacement="inside"
                            options={[
                              { key: "0", label: "Feature request" },
                              { key: "1", label: "Bug report" },
                              { key: "2", label: "Get in contact" },
                            ]}
                          />
                        </div>
                      </div>
                      <NextUIFormikTextarea
                        label="Comments"
                        name="comment"
                        placeholder=""
                        labelPlacement="inside"
                      />
                      <div>
                        <Field
                          name="allowContact"
                          type="checkbox"
                          as={Checkbox}
                          aria-label="Allow the team to contact you"
                        >
                          <p>
                            I permit the ecoconnect administrators to contact me
                            via{" "}
                            <span className="font-bold underline">
                              {userInformation.email}
                            </span>{" "}
                            to better understand the comments I submitted.
                          </p>
                        </Field>
                        <ErrorMessage
                          name="allowContact"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        color="primary"
                        isDisabled={!isValid || !dirty}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
