import { Button, Checkbox, Link } from "@nextui-org/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios, { AxiosError } from "axios";
import config from "../config";
import NextUIFormikInput from "./NextUIFormikInput";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(1)
    .max(100)
    .required("First Name is required"),
  lastName: Yup.string()
    .trim()
    .min(1)
    .max(100)
    .required("Last Name is required"),
  email: Yup.string()
    .trim()
    .lowercase()
    .min(5)
    .max(69)
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .trim()
    .matches(/^[0-9]+$/, "Phone number must contain only numerical characters")
    .length(8, "Phone number must be 8 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(69, "Password must be at most 69 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
      "Password needs to contain both letters and numbers"
    )
    .required("Password is required"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

export default function SignUpModule() {
  const navigate = useNavigate();

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    terms: false,
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await axios.post(
        config.serverAddress + "/users/register",
        values
      );
      console.log("User created successfully:", response.data);
    } catch (error) {
      throw ((error as AxiosError).response?.data as any).message;
    }
  };

  return (
    <div className="flex flex-col gap-16">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <NextUIFormikInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="John"
              labelPlacement="outside"
            />
            <NextUIFormikInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Doe"
              labelPlacement="outside"
            />
            <NextUIFormikInput
              label="Email"
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              labelPlacement="outside"
            />
            <NextUIFormikInput
              label="Phone number"
              name="phoneNumber"
              type="text"
              placeholder="XXXXXXXX"
              labelPlacement="outside"
              startContent={
                <p className="text-sm pr-2 border-r-2 border-neutral-300 dark:border-neutral-700">
                  +65
                </p>
              }
            />
            <NextUIFormikInput
              label="New Password"
              name="password"
              type="password"
              placeholder=" "
              labelPlacement="outside"
            />
            <div>
              <Field
                name="terms"
                type="checkbox"
                as={Checkbox}
                aria-label="Terms and services agreement checkbox"
              >
                I have read and agreed to the{" "}
                <Link href="#">Terms and Services</Link>
              </Field>
              <ErrorMessage
                name="terms"
                component="div"
                className="text-red-500"
              />
            </div>
            <Button
              type="submit"
              color="primary"
              isDisabled={!isValid || !dirty}
            >
              Sign up
            </Button>
          </Form>
        )}
      </Formik>
      <div className="w-full flex flex-col gap-2 *:mx-auto">
        <p>Already here before?</p>
        <Link
          onPress={() => {
            navigate("/signin");
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
