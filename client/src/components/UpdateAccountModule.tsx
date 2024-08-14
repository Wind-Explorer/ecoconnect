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
import { checkTwoFactorStatus, popErrorToast, popToast } from "../utilities";
import instance from "../security/http";
import axios from "axios";
import NextUIFormikSelect from "./NextUIFormikSelect";
import TwoFactorsAuthenticationSetupModule from "./TwoFactorsAuthenticationSetupModule";

export default function UpdateAccountModule() {
  const navigate = useNavigate();
  const [userInformation, setUserInformation] = useState<any>();
  const [townCouncils, setTownCouncils] = useState<string[]>([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const {
    isOpen: isArchiveDialogOpen,
    onOpen: onArchiveDialogOpen,
    onOpenChange: onArchiveDialogOpenChange,
  } = useDisclosure();

  const {
    isOpen: isResetPasswordOpen,
    onOpen: onResetPasswordOpen,
    onOpenChange: onResetPasswordOpenChange,
  } = useDisclosure();

  const {
    isOpen: isTwoFactorsAuthenticationOpen,
    onOpen: onTwoFactorsAuthenticationOpen,
    onOpenChange: onTwoFactorsAuthenticationOpenChange,
  } = useDisclosure();

  useEffect(() => {
    retrieveUserInformation()
      .then((response) => {
        setUserInformation(response);
        axios
          .get(`${config.serverAddress}/users/town-councils-metadata`)
          .then((values) => {
            setTownCouncils(JSON.parse(values.data).townCouncils);
          });
        checkTwoFactorStatus(response.email).then((answer) => {
          setIs2FAEnabled(answer);
        });
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
    townCouncil: Yup.string().trim().max(30).required(),
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
        townCouncil: userInformation.townCouncil || "",
      }
    : {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        townCouncil: "",
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

  const sendResetPasswordEmail = () => {
    instance
      .put(
        `${
          config.serverAddress
        }/users/request-reset-password/${encodeURIComponent(
          userInformation.email
        )}`
      )
      .then(() => {
        console.log("Email sent successfully");
        popToast("Email sent to your mailbox!", 1);
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        popErrorToast("Failed to send email: " + error);
      });
  };

  return (
    <div>
      {userInformation && (
        <div className="max-w-[800px] mx-auto">
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
                    <div className="flex flex-row *:my-auto">
                      <div className="w-full *:w-full *:flex *:flex-col *:gap-4 *:my-auto">
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
                        </div>
                      </div>
                      <div className="w-full flex flex-row justify-center">
                        <div className="flex flex-col gap-8 text-center">
                          <UserProfilePicture
                            userId={userInformation.id}
                            editable={true}
                          />
                          <p className="font-bold opacity-50 text-sm">
                            Click to select a new
                            <br />
                            profile picture
                          </p>
                        </div>
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
                  <Card className="flex flex-col gap-4 justify-between *:my-auto bg-primary-50 dark:bg-primary-950 p-4 my-2">
                    <div className="flex flex-col">
                      <p className="text-lg">Danger zone</p>
                      <p className="opacity-50">
                        These actions may be destructive. Proceed with caution.
                      </p>
                    </div>
                    <div className="flex flex-row gap-4">
                      <Button
                        color={is2FAEnabled ? "danger" : "secondary"}
                        onPress={onTwoFactorsAuthenticationOpen}
                      >
                        {is2FAEnabled ? "Disable" : "Enable"} Two-Factors
                        Authentication
                      </Button>
                      <Button color="danger" onPress={onResetPasswordOpen}>
                        Reset your password
                      </Button>
                      <Button color="danger" onPress={onArchiveDialogOpen}>
                        Archive this account
                      </Button>
                    </div>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Archive Account Modal */}
          <Modal
            isOpen={isArchiveDialogOpen}
            onOpenChange={onArchiveDialogOpenChange}
          >
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

          {/* Reset Password Modal */}
          <Modal
            isOpen={isResetPasswordOpen}
            onOpenChange={onResetPasswordOpenChange}
          >
            <ModalContent>
              {(onClose) => {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Reset Password
                    </ModalHeader>
                    <ModalBody>
                      <p>
                        We will send you an email helping you to reset your
                        password.
                      </p>
                      <p>
                        Check in the junk mailbox if you do not receive it after
                        3 minutes.
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        color="danger"
                        onPress={() => {
                          sendResetPasswordEmail();
                          onClose();
                        }}
                      >
                        Send email
                      </Button>
                    </ModalFooter>
                  </>
                );
              }}
            </ModalContent>
          </Modal>

          {/* Two-Factors Authorization Modal */}
          <Modal
            isOpen={isTwoFactorsAuthenticationOpen}
            onOpenChange={onTwoFactorsAuthenticationOpenChange}
            size="xl"
          >
            <ModalContent>
              {(onClose) => {
                return (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Set up Two-Factors Authentication
                    </ModalHeader>
                    <ModalBody>
                      <div className="w-full h-full pb-4">
                        <TwoFactorsAuthenticationSetupModule
                          onClose={() => {
                            checkTwoFactorStatus(userInformation.email)
                              .then((answer) => {
                                setIs2FAEnabled(answer);
                              })
                              .finally(() => {
                                onClose();
                              });
                          }}
                        />
                      </div>
                    </ModalBody>
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
