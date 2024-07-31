import { Button, Checkbox, Link } from "@nextui-org/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import config from "../config";
import NextUIFormikInput from "./NextUIFormikInput";
import { useNavigate } from "react-router-dom";
import { popErrorToast } from "../utilities";
import { useEffect, useState } from "react";
import instance from "../security/http";
import axios from "axios";
import NextUIFormikSelect from "./NextUIFormikSelect";

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
  townCouncil: Yup.string().trim().max(30).required(),
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
  const [step, setStep] = useState(1);
  const [townCouncils, setTownCouncils] = useState<string[]>([]);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    townCouncil: "",
    password: "",
    terms: false,
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await instance.post(
        config.serverAddress + "/users/register",
        values
      );
      console.log("User created successfully:", response.data);
      navigate("/signin");
    } catch (error) {
      popErrorToast(error);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  useEffect(() => {
    axios
      .get(`${config.serverAddress}/users/town-councils-metadata`)
      .then((values) => {
        setTownCouncils(JSON.parse(values.data).townCouncils);
      });
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <p className="text-4xl font-bold pb-6">
                  First, let us know how to address you.
                </p>
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
                <Button onClick={nextStep} color="primary">
                  Next
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <p className="text-4xl font-bold pb-6">
                  Nice to meet you! Next, your contacts.
                </p>
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
                {townCouncils.length > 0 && (
                  <NextUIFormikSelect
                    label="Town council"
                    name="townCouncil"
                    placeholder="Choose the town council you belong to"
                    labelPlacement="outside"
                    options={townCouncils.map((townCouncil) => ({
                      key: townCouncil,
                      label: townCouncil,
                    }))}
                  />
                )}
                <div className="flex justify-between">
                  <Button onClick={prevStep} variant="light">
                    Back
                  </Button>
                  <Button onClick={nextStep} color="primary">
                    Next
                  </Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <p className="text-4xl font-bold pb-6">
                  Almost there! Now, a strong password please.
                </p>
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
                <div className="flex justify-between">
                  <Button onClick={prevStep} variant="light">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    isDisabled={!isValid || !dirty}
                  >
                    Sign up
                  </Button>
                </div>
              </>
            )}
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
