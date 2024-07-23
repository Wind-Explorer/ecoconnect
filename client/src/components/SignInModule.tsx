import { Button, Link } from "@nextui-org/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../config";
import NextUIFormikInput from "./NextUIFormikInput";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "../icons";
import { popErrorToast } from "../utilities";
import { retrieveUserInformation } from "../security/users";

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .min(5)
    .max(69)
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .trim()
    .max(69, "Password must be at most 69 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{1,}$/,
      "Password contains only letters and numbers"
    )
    .required("Password is required"),
});

export default function SignInModule() {
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = (values: any): void => {
    axios
      .post(config.serverAddress + "/users/login", values)
      .then((response) => {
        localStorage.setItem("accessToken", response.data.accessToken);
        retrieveUserInformation().then((value) => {
          if (value.accountType == 2) {
            navigate("/admin");
          } else {
            navigate("/springboard/");
          }
        });
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-1">
        <p className="text-4xl font-bold">Sign In</p>
        <p className="text-2xl">to ecoconnect</p>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <NextUIFormikInput
              label="Email"
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              labelPlacement="outside"
            />
            <NextUIFormikInput
              label="Password"
              name="password"
              type="password"
              placeholder=" "
              labelPlacement="outside"
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="mx-auto"
              isIconOnly
              isDisabled={!isValid || !dirty}
            >
              <ChevronLeftIcon />
            </Button>
          </Form>
        )}
      </Formik>
      <div className="w-full flex flex-col gap-2 *:mx-auto">
        <p>New here?</p>
        <Link
          onPress={() => {
            navigate("/signup");
          }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
