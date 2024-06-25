import axios from "axios";
import * as Yup from "yup";
import config from "../config";
import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import { Button } from "@nextui-org/react";
import { Form, Formik } from "formik";
import NextUIFormikInput from "./NextUIFormikInput";
import { PencilSquareIcon } from "../icons";
import { useNavigate } from "react-router-dom";

export default function UpdateAccountModule({
  accessToken,
}: {
  accessToken: string;
}) {
  const navigate = useNavigate();
  let [userInformation, setUserInformation] = useState<any>();

  useEffect(() => {
    retrieveUserInformation(accessToken!, setUserInformation);
  }, [accessToken]);

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
      .matches(
        /^[0-9]+$/,
        "Phone number must contain only numerical characters"
      )
      .length(8, "Phone number must be 8 digits")
      .required("Phone number is required"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const response = await axios.put(
        `${config.serverAddress}/users/individual/${userInformation.id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("User updated successfully:", response.data);
      navigate("/springboard/" + accessToken);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const initialValues = userInformation
    ? {
        id: userInformation.id || "",
        firstName: userInformation.firstName || "",
        lastName: userInformation.lastName || "",
        email: userInformation.email || "",
        phoneNumber: userInformation.phoneNumber || "",
      }
    : {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      };

  return (
    <div>
      {userInformation && (
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isValid, dirty }) => (
              <Form className="flex flex-col gap-16">
                <div className="flex flex-row justify-between">
                  <p className="text-4xl font-bold">Update your information</p>
                  <div className="flex flex-row gap-4">
                    <Button
                      variant="light"
                      onPress={() => {
                        navigate("/springboard/" + accessToken);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      isDisabled={!isValid || !dirty}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div className="flex flex-row gap-8">
                  <div className="flex-grow flex sm:flex-row flex-col gap-4 *:w-full *:flex *:flex-col *:gap-4">
                    <div>
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
                    </div>
                    <div>
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
                    </div>
                  </div>
                  <div className="w-40 h-40 bg-red-500 hover:bg-red-700 transition-colors rounded-full relative">
                    <div className="transition-opacity opacity-0 hover:opacity-100 absolute w-full h-full text-white flex flex-col justify-center rounded-full">
                      <div className=" w-min h-min mx-auto scale-150">
                        <PencilSquareIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
