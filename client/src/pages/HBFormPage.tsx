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
import { useEffect, useState } from "react";

const validationSchema = Yup.object({
  electricalBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required(),
  waterBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required(),
  totalBill: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive value")
    .max(99999.99, "Value is too large")
    .required(),
  noOfDependents: Yup.number()
    .typeError("Must be a number")
    .integer("Must be a whole number")
    .positive("Must be a positive value")
    .required(),
});

export default function HBFormPage() {
  const [userId, setUserId] = useState(null);
  const [initialValues, setInitialValues] = useState({
    id: "",
    electricalBill: "",
    waterBill: "",
    totalBill: "",
    noOfDependents: "",
    ebPicture: null,
    wbPicture: null,
    userId: "",
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

  return (
    <div className="w-full h-full">
      <section className="w-7/12 mx-auto">
        <Button variant="light" onPress={() => navigate(-1)}>
          <ArrowUTurnLeftIcon />
        </Button>
      </section>
      <section className="w-7/12 mx-auto p-5 bg-red-100 border border-none rounded-2xl h-600px">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting, setFieldValue }) => (
            <Form>
              <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-10">
                  <div className="flex flex-col gap-5">
                    <NextUIFormikInput
                      label="Electrical Bill"
                      name="electricalBill"
                      type="text"
                      placeholder="$"
                      labelPlacement="inside"
                    />
                    <NextUIFormikInput
                      label="Water Bill"
                      name="waterBill"
                      type="text"
                      placeholder="$"
                      labelPlacement="inside"
                    />
                    <NextUIFormikInput
                      label="Total Bill"
                      name="totalBill"
                      type="text"
                      placeholder="$"
                      labelPlacement="inside"
                    />
                    <NextUIFormikInput
                      label="Number of dependents"
                      name="noOfDependents"
                      type="text"
                      placeholder="0"
                      labelPlacement="inside"
                    />
                  </div>
                  <div className="flex flex-row gap-8 max-w-xs h-[500px]">
                    <InsertImage
                      onImageSelected={(file) => {
                        setFieldValue("ebPicture", file);
                      }}
                    />
                    <InsertImage
                      onImageSelected={(file) => {
                        setFieldValue("wbPicture", file);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="bg-red-500 dark:bg-red-700 text-white"
                    isDisabled={!isValid || !dirty || isSubmitting}
                  >
                    <p>Submit</p>
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}
