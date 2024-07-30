import { Button } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../config";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { popErrorToast, popToast } from "../utilities";
import { ArrowUTurnLeftIcon } from "../icons";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .min(5)
    .max(69)
    .email("Invalid email format")
    .required("Email is required"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const initialValues = {
    email: "",
  };

  const handleSubmit = (values: any): void => {
    instance
      .put(
        `${
          config.serverAddress
        }/users/request-reset-password/${encodeURIComponent(values.email)}`
      )
      .then(() => {
        console.log("Email sent successfully");
        popToast("Email sent to your mailbox!", 1);
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        popErrorToast("Failed to send email: " + error);
      });
  };

  return (
    <div className="w-full flex flex-row gap-10">
      <div className="flex flex-col justify-center relative">
        <Button
          variant="light"
          isIconOnly
          radius="full"
          className="-mt-2 -ml-2 mr-auto absolute top-0 left-0"
          onPress={() => {
            navigate(-1);
          }}
        >
          <ArrowUTurnLeftIcon />
        </Button>
        <div className="relative">
          <img
            src="../assets/google-passkey.svg"
            alt="Google Passkey SVG"
            className="saturate-0"
          />
          <div className="absolute inset-0 bg-primary-500 mix-blend-overlay w-full h-full"></div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-bold">Password Recovery</p>
            <p>
              Enter your email address below, and we will send you a recovery
              mail.
            </p>
          </div>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty }) => (
            <Form className="flex flex-col gap-8">
              <NextUIFormikInput
                label="Email"
                name="email"
                type="email"
                placeholder="johndoe@email.com"
                labelPlacement="outside"
              />
              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={!isValid || !dirty}
              >
                Send Recovery Email
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
