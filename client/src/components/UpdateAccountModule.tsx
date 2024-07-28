import * as Yup from "yup";
import config from "../config";
import { useEffect, useState } from "react";
import { retrieveUserInformation } from "../security/users";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Form, Formik } from "formik";
import NextUIFormikInput from "./NextUIFormikInput";
import { useNavigate } from "react-router-dom";
import UserProfilePicture from "./UserProfilePicture";
import { popErrorToast } from "../utilities";
import instance from "../security/http";

export default function UpdateAccountModule() {
  const navigate = useNavigate();
  const [userInformation, setUserInformation] = useState<any>();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      const response = await instance.put(
        `${config.serverAddress}/users/individual/${userInformation.id}`,
        values
      );
      console.log("User updated successfully:", response.data);
      navigate(-1);
    } catch (error) {
      popErrorToast(error);
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

  const archiveAccount = () => {
    instance
      .put(config.serverAddress + "/users/archive/" + userInformation.id)
      .then(() => {
        navigate("/signin");
      })
      .catch((err) => {
        console.log("Archive failed: " + err);
      });
  };

  return (
    <div>
      {userInformation && (
        <div>
          <div className="flex flex-col gap-16">
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
                      <p className="text-4xl font-bold">
                        Update your information
                      </p>
                      <div className="flex flex-row gap-4">
                        <Button
                          variant="light"
                          onPress={() => {
                            navigate(-1);
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
                      <div className="flex-grow flex sm:flex-row flex-col gap-4 *:w-full *:flex *:flex-col *:gap-4 *:my-auto">
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
                      <div>
                        <UserProfilePicture
                          userId={userInformation.id}
                          editable={true}
                        />
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            <div>
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="Account danger zone"
                  as={Card}
                  title={
                    <div className="flex flex-col">
                      <p className="text-lg">More actions</p>
                      <p className="opacity-50">
                        Click to show more options collapsed for security
                        purposes.
                      </p>
                    </div>
                  }
                  className="rounded-xl -m-2 *:px-4"
                >
                  <Card className="flex flex-row justify-between *:my-auto bg-primary-50 dark:bg-primary-950 p-4 my-2">
                    <div className="flex flex-col">
                      <p className="text-lg">Danger zone</p>
                      <p className="opacity-50">
                        These actions may be destructive. Proceed with caution.
                      </p>
                    </div>
                    <div className="flex flex-row gap-4">
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          instance
                            .put(
                              `${config.serverAddress}/connections/send-reset-password-email/${userInformation.id}`
                            )
                            .then(() => {
                              console.log("Email sent successfully");
                            })
                            .catch((error) => {
                              console.error("Failed to send email:", error);
                            });
                        }}
                      >
                        Reset your password
                      </Button>
                      <Button color="danger" variant="flat" onPress={onOpen}>
                        Archive this account
                      </Button>
                    </div>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Are you sure?
                    </ModalHeader>
                    <ModalBody>
                      <p>
                        By archiving, the account will be immediately locked to
                        prevent further matters related to this account.
                      </p>
                      <p>
                        Only archive the account if you do not intend for this
                        account to be active again in the future.
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          archiveAccount();
                          onClose();
                        }}
                      >
                        Archive
                      </Button>
                      <Button color="primary" onPress={onClose}>
                        Cancel
                      </Button>
                    </ModalFooter>
                  </>
                );
              }}
            </ModalContent>
          </Modal>
        </div>
      )}
    </div>
  );
}
