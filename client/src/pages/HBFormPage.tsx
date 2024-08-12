import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CircularProgress,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import config from "../config";
import NextUIFormikInput from "../components/NextUIFormikInput";
import instance from "../security/http";
import { retrieveUserInformation } from "../security/users";
import InsertBillImage from "../components/InsertBillImage";

const validationSchema = Yup.object({
  electricalBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required("Electrical bill is a required field"),
  waterBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required("Water bill is a required field"),
  totalBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required("Total bill is a required field"),
  noOfDependents: Yup.number()
    .typeError("Must be a number")
    .integer("Must be a whole number")
    .positive("Must be a positive value")
    .required("No. of dependents is a required field"),
  avgBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required("Average bill is a required field"),
  billPicture: Yup.mixed().required("Bill picture is required"),
});

export default function HBFormPage() {
  const [userId, setUserId] = useState(null);
  const [aiProcessing, isAiProcessing] = useState(false);
  const [initialValues, setInitialValues] = useState({
    id: "",
    electricalBill: "69",
    waterBill: "69",
    totalBill: "0.00",
    noOfDependents: 1,
    avgBill: "",
    billPicture: null,
    userId: "",
  });

  // Add state for image selection
  const [imagesSelected, setImagesSelected] = useState({
    billPicture: false,
  });

  useEffect(() => {
    const getUserInformation = async () => {
      try {
        const user = await retrieveUserInformation(); // Get the user ID
        setUserId(user.id); // Set the user ID in the state
      } catch (error) {
        console.error(error);
      }
    };
    getUserInformation();
  }, []);

  useEffect(() => {
    if (userId) {
      setInitialValues((prevInitialValues) => ({
        ...prevInitialValues,
        userId,
      }));
    }
  }, [userId]);

  const [hasHandedInForm, setHasHandedInForm] = useState(false);

  useEffect(() => {
    instance
      .get(`${config.serverAddress}/hbcform/has-handed-in-form/${userId}`)
      .then((response) => {
        const hasHandedInForm = response.data.hasHandedInForm;
        setHasHandedInForm(hasHandedInForm);
      })
      .catch((error) => {
        console.error("Error checking if user has handed in form:", error);
      });
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError, setFieldValue }: any
  ) => {
    if (hasHandedInForm) {
      setIsModalOpen(true);
    } else {
      const formData = new FormData();
      formData.append("electricalBill", values.electricalBill);
      formData.append("waterBill", values.waterBill);
      formData.append("totalBill", values.totalBill);
      formData.append("noOfDependents", values.noOfDependents);
      formData.append("avgBill", values.avgBill);

      if (values.billPicture) {
        formData.append("billPicture", values.billPicture);
      }

      if (userId != null) {
        formData.append("userId", userId);
      }

      try {
        const response = await instance.post(
          config.serverAddress + "/hbcform",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          console.log("Form created successfully:", response.data);
          resetForm(); // Clear form after successful submit
          setFieldValue("billPicture", null);
          navigate(-1);
        } else {
          console.error("Error creating form:", response.statusText);
        }
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            setFieldError(key, errors[key]);
          });
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handler for image selection
  const handleImageSelection = (name: string, file: File | null) => {
    setImagesSelected((prevState) => ({
      ...prevState,
      [name]: !!file,
    }));
  };

  const handleModalSubmit = async ({
    values,
    resetForm,
    setFieldError,
    setFieldValue,
  }: any) => {
    try {
      // Fetch the current form ID associated with the userId
      const responses = await instance.get(
        `${config.serverAddress}/hbcform/has-handed-in-form/${userId}`
      );
      const formId = responses.data.formId; // Make sure your API response includes the formId

      if (formId) {
        // Delete the form entry using the formId
        await instance.delete(`${config.serverAddress}/hbcform/${formId}`);
        console.log("Old form data deleted successfully");
      }
      // Prepare the new form data
      const formData = new FormData();
      formData.append("electricalBill", values.electricalBill);
      formData.append("waterBill", values.waterBill);
      formData.append("totalBill", values.totalBill);
      formData.append("noOfDependents", values.noOfDependents);
      formData.append("avgBill", values.avgBill);

      if (values.billPicture) {
        formData.append("billPicture", values.billPicture);
      }

      if (userId != null) {
        formData.append("userId", userId);
      }

      // Submit the new form data
      const response = await instance.post(
        `${config.serverAddress}/hbcform`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Form created successfully:", response.data);
        resetForm(); // Clear form after successful submit
        setFieldValue("billPicture", null);
        navigate(-1);
      } else {
        console.error("Error creating form:", response.statusText);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          setFieldError(key, errors[key]);
        });
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsModalOpen(false); // Close the modal after submission
    }
  };

  const handleModalCancel = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-full">
      <Card className="relative max-w-[800px] mx-auto *:mx-auto bg-primary-50 dark:bg-neutral-950">
        <div className="absolute top-2 left-2">
          <Button variant="light" isIconOnly onPress={() => navigate(-1)}>
            <ArrowUTurnLeftIcon />
          </Button>
        </div>
        <div className="flex-grow py-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, isSubmitting, setFieldValue, values }) => {
              // Calculate the total bill
              useEffect(() => {
                const avgBill =
                  Number(values.noOfDependents) > 0
                    ? Number(values.totalBill) / Number(values.noOfDependents)
                    : 0;
                setFieldValue("avgBill", avgBill.toFixed(2));
              }, [values.totalBill, values.noOfDependents, setFieldValue]);

              // Disabled the submit button because the images field are not selected
              const isSubmitDisabled = !imagesSelected.billPicture;

              return (
                <Form>
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-col gap-4 justify-between">
                        <div className="flex flex-col gap-4 min-w-[220px]">
                          <div className=" hidden">
                            <NextUIFormikInput
                              label="Number of dependents"
                              name="avgBill"
                              type="text"
                              placeholder=""
                              labelPlacement="inside"
                              setFieldValue={setFieldValue}
                            />
                            <NextUIFormikInput
                              label="Number of dependents"
                              name="totalBill"
                              type="text"
                              placeholder=""
                              labelPlacement="inside"
                              setFieldValue={setFieldValue}
                            />
                            <NextUIFormikInput
                              label="Number of dependents"
                              name="waterBill"
                              type="text"
                              placeholder=""
                              labelPlacement="inside"
                              setFieldValue={setFieldValue}
                            />
                            <NextUIFormikInput
                              label="Number of dependents"
                              name="electricalBill"
                              type="text"
                              placeholder=""
                              labelPlacement="inside"
                              setFieldValue={setFieldValue}
                            />
                          </div>
                          <Card className="flex flex-col gap-2 p-4">
                            <p className="text-md font-semibold">
                              How many people lives in your unit?
                            </p>
                            <NextUIFormikInput
                              label="Number of dependents"
                              name="noOfDependents"
                              type="text"
                              placeholder=""
                              labelPlacement="inside"
                              setFieldValue={setFieldValue}
                            />
                          </Card>
                          <Card className="p-4 flex flex-col gap-4">
                            <div>
                              <p className="opacity-70">
                                Total amount payable:
                              </p>
                              {aiProcessing && (
                                <div className="w-full *:mx-auto pt-4">
                                  <CircularProgress label="Analyzing..." />
                                </div>
                              )}
                              {!aiProcessing && (
                                <p className="text-2xl font-semibold">
                                  S${values.totalBill}
                                </p>
                              )}
                            </div>
                            <Divider />
                            <div>
                              <p className="opacity-70">Cost per dependent:</p>
                              <p className="text-3xl font-bold">
                                S${values.avgBill}
                              </p>
                            </div>
                          </Card>
                        </div>
                        <Button
                          type="submit"
                          className="bg-red-400 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-900 text-white"
                          size="lg"
                          isDisabled={
                            !isValid ||
                            !dirty ||
                            isSubmitting ||
                            isSubmitDisabled
                          }
                        >
                          <p>Submit</p>
                        </Button>
                      </div>
                      <div className="flex flex-row">
                        <InsertBillImage
                          label=""
                          onImageSelected={(file) => {
                            setFieldValue("billPicture", file);
                            handleImageSelection("billPicture", file);
                          }}
                          onAmountResolved={(totalAmount) => {
                            setFieldValue("totalBill", totalAmount);
                          }}
                          onAiProcessingChange={isAiProcessing}
                        />
                      </div>
                    </div>
                  </div>
                  <Modal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    isDismissable={true}
                    isKeyboardDismissDisabled={true}
                  >
                    <ModalContent className="w-full max-w-[400px]">
                      <ModalHeader>Confirmation</ModalHeader>
                      <ModalBody className="pb-8">
                        <div>
                          <p>
                            This form has been submitted before. If you submit
                            again, the previous entry will be deleted. Are you
                            sure you want to resubmit?
                          </p>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <div className="flex flex-row gap-4">
                          <Button
                            onPress={() =>
                              handleModalSubmit({
                                values,
                                setSubmitting: isSubmitting,
                                resetForm: () => {}, // Pass an empty function as a placeholder
                                setFieldError: () => {}, // Pass an empty function as a placeholder
                                setFieldValue,
                              })
                            }
                          >
                            Yes
                          </Button>
                          <Button color="primary" onPress={handleModalCancel}>
                            No
                          </Button>
                        </div>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Card>
    </div>
  );
}
