import { useEffect, useState } from 'react';
import { Button } from "@nextui-org/react";
import { ArrowUTurnLeftIcon } from "../icons";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import config from "../config";
import NextUIFormikInput from "../components/NextUIFormikInput";
import axios from "axios";
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
  ebPicture: Yup.mixed().required("Electrical bill picture is required"),
  wbPicture: Yup.mixed().required("Water bill picture is required"),
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
    ebPicture: null,
    wbPicture: null,
    userId: "",
  });

  // Add state for image selection
  const [imagesSelected, setImagesSelected] = useState({
    ebPicture: false,
    wbPicture: false,
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

  const navigate = useNavigate();

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm, setFieldError, setFieldValue }: any
  ) => {
    const formData = new FormData();
    formData.append("electricalBill", values.electricalBill);
    formData.append("waterBill", values.waterBill);
    formData.append("totalBill", values.totalBill);
    formData.append("noOfDependents", values.noOfDependents);
    formData.append("avgBill", values.avgBill);

    if (values.ebPicture) {
      formData.append("ebPicture", values.ebPicture);
    }

    if (values.wbPicture) {
      formData.append("wbPicture", values.wbPicture);
    }

    if (userId != null) {
      formData.append("userId", userId);
    }

    try {
      const response = await axios.post(
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
        setFieldValue("ebPicture", null);
        setFieldValue("wbPicture", null);
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
  };

  // Handler for image selection
  const handleImageSelection = (name: string, file: File | null) => {
    setImagesSelected(prevState => ({
      ...prevState,
      [name]: !!file,
    }));
  };

  return (
    <div className="w-full h-full pb-12">
      <div className="w-8/12 mx-auto p-6 bg-red-100 dark:bg-red-950 border border-primary-100 rounded-2xl h-600px">
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
              const isSubmitDisabled = !imagesSelected.ebPicture || !imagesSelected.wbPicture;

              return (
                <Form>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-row gap-5">
                      <div className="flex flex-col gap-5 p-2 min-w-[180px] ">
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
                          label="Electrical Bill Image"
                          onImageSelected={(file) => {
                            setFieldValue("ebPicture", file);
                            handleImageSelection("ebPicture", file);
                          }}
                        />
                        <InsertImage
                          label="Water Bill Image"
                          onImageSelected={(file) => {
                            setFieldValue("wbPicture", file);
                            handleImageSelection("wbPicture", file);
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
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
