import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import config from "../config";
import NextUIFormikInput from "../components/NextUIFormikInput";
import instance from "../security/http";
import InsertImage from "../components/InsertImage";
import { retrieveUserInformation } from "../security/users";

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
  const [initialValues, setInitialValues] = useState({
    id: "",
    electricalBill: "",
    waterBill: "",
    totalBill: "",
    noOfDependents: "",
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
    instance.get(`${config.serverAddress}/hbcform/has-handed-in-form/${userId}`)
      .then(response => {
        const hasHandedInForm = response.data.hasHandedInForm;
        setHasHandedInForm(hasHandedInForm);
      })
      .catch(error => {
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
        if (error.response && error.response.data && error.response.data.errors) {
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
    setImagesSelected(prevState => ({
      ...prevState,
      [name]: !!file,
    }));
  };

  const handleModalSubmit = async ({
    values,
    resetForm,
    setFieldError,
    setFieldValue
  }: any) => {
    try {
      // Fetch the current form ID associated with the userId
      const responses = await instance.get(`${config.serverAddress}/hbcform/has-handed-in-form/${userId}`);
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
    navigate(-1)
  };

  return (
    <div className="w-full h-full pb-12">
      <div className="w-[680px] mx-auto p-6 bg-red-100 dark:bg-red-950 border border-primary-100 rounded-2xl h-600px">
        <div className="py-2">
          <Button variant="light" onPress={() => navigate(-1)}>
            <ArrowUTurnLeftIcon />
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, isSubmitting, setFieldValue, values }) => {
              // Calculate the total bill
              useEffect(() => {
                const totalBill = Number(values.electricalBill) + Number(values.waterBill);
                setFieldValue("totalBill", totalBill.toFixed(2));

                const avgBill = Number(values.noOfDependents) > 0
                  ? totalBill / Number(values.noOfDependents)
                  : 0;
                setFieldValue("avgBill", avgBill.toFixed(2));

              }, [values.electricalBill, values.waterBill, values.noOfDependents, setFieldValue]);

              // Disabled the submit button because the images field are not selected
              const isSubmitDisabled = !imagesSelected.billPicture;

              return (
                <Form>
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-10">
                      <div className="flex flex-col gap-10 p-2 min-w-[220px]">
                        <NextUIFormikInput
                          label="Electrical Bill"
                          name="electricalBill"
                          type="text"
                          placeholder="0.00"
                          labelPlacement="inside"
                          setFieldValue={setFieldValue}
                        />
                        <NextUIFormikInput
                          label="Water Bill"
                          name="waterBill"
                          type="text"
                          placeholder="0.00"
                          labelPlacement="inside"
                          setFieldValue={setFieldValue}
                        />
                        <NextUIFormikInput
                          label="Total Bill"
                          name="totalBill"
                          type="text"
                          placeholder="0.00"
                          labelPlacement="inside"
                          readOnly={true}
                        />
                        <NextUIFormikInput
                          label="Number of dependents"
                          name="noOfDependents"
                          type="text"
                          placeholder="0"
                          labelPlacement="inside"
                          setFieldValue={setFieldValue}
                        />
                        <NextUIFormikInput
                          label="Average Bill"
                          name="avgBill"
                          type="text"
                          placeholder="0"
                          labelPlacement="inside"
                          readOnly={true}
                        />
                      </div>
                      <div className="flex flex-row gap-10">
                        <InsertImage
                          label=""
                          onImageSelected={(file) => {
                            setFieldValue("billPicture", file);
                            handleImageSelection("billPicture", file);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="bg-red-400 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-900 text-white"
                        size="lg"
                        isDisabled={!isValid || !dirty || isSubmitting || isSubmitDisabled}
                      >
                        <p>Submit</p>
                      </Button>
                    </div>
                  </div>
                  <Modal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    isDismissable={true}
                    isKeyboardDismissDisabled={true}
                  >
                    <ModalContent className="w-full max-w-[400px]">
                      <ModalHeader className="flex justify-between items-center font-bold text-2xl text-red-900">
                        Confirmation
                      </ModalHeader>
                      <ModalBody className="pb-8">
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                          <p className="font-semibold">This form has been submitted before. If you submit again, the previous entry will be deleted. Are you sure you want to resubmit?</p>
                        </div>
                        <div className="flex justify-between">
                          <Button
                            className="bg-red-400 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-900 text-white"
                            size="lg"
                            onPress={() => handleModalSubmit({
                              values,
                              setSubmitting: isSubmitting,
                              resetForm: () => { }, // Pass an empty function as a placeholder
                              setFieldError: () => { }, // Pass an empty function as a placeholder
                              setFieldValue
                            })}>
                            Yes
                          </Button>
                          <Button
                            className="bg-gray-400 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-900 text-white"
                            size="lg"
                            onPress={handleModalCancel}
                          >
                            No
                          </Button>
                        </div>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
