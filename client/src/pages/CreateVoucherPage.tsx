import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import InsertPostImage from "../components/InsertPostImage";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { NextUIFormikDatePicker } from "../components/NextUIFormikDatePicker";
import instance from "../security/http";
import { ArrowUTurnLeftIcon } from "../icons";

// Validation schema
const validationSchema = Yup.object({
    brandLogo: Yup.mixed().required("Brand logo is required"),
    brand: Yup.string().trim().required("Brand name is required"),
    description: Yup.string().trim().required("Brand name is required"),
    expirationDate: Yup.date().required("Expiry date is required"),
    quantityAvailable: Yup.number().typeError("Must be a number").positive("Must be a positive value").required("Quantity is required"),
    code: Yup.string().trim().required("Code is required"),
});

// Initial form values
const initialValues = {
    brandLogo: null,
    brand: "",
    description: "",
    expirationDate: "",
    quantityAvailable: "",
    code: "",
};

export default function CreateVoucherPage() {
    const navigate = useNavigate();

    const handleSubmit = async (
        values: any,
        { setSubmitting, resetForm, setFieldError, setFieldValue }: any
    ) => {
        const formData = new FormData();
        if (values.brandLogo) {
            formData.append("brandLogo", values.brandLogo);
        }

        formData.append("brand", values.brand);
        formData.append("description", values.description);
        formData.append("expirationDate", values.expirationDate);
        formData.append("quantityAvailable", values.quantityAvailable);
        formData.append("code", values.code);

        try {
            const response = await instance.post("/vouchers", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                console.log("Voucher created successfully:", response.data);
                resetForm(); // Clear form after successful submit
                setFieldValue("brandLogo", null);
                navigate(-1);
            } else {
                console.error("Error creating voucher:", response.statusText);
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
        <div className="w-full h-full pb-12 pt-10">
            <div className="w-[350px] mx-auto p-6 bg-red-50 dark:bg-primary-950 border border-primary-100 rounded-2xl ">
                <div className="py-2">
                    <Button variant="light" isIconOnly onPress={() => navigate(-1)}>
                        <ArrowUTurnLeftIcon />
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isValid, dirty, setFieldValue }) => (
                            <Form className="flex flex-col gap-4">
                                <div className="flex flex-col gap-5 w-[280px]">
                                    <InsertPostImage
                                        onImageSelected={(file) => {
                                            setFieldValue("brandLogo", file);
                                        }}
                                    />
                                    <NextUIFormikInput
                                        label="Brand name"
                                        name="brand"
                                        type="text"
                                        placeholder="Jollibean, KFC.."
                                        labelPlacement="inside"
                                    />
                                    <NextUIFormikInput
                                        label="Description"
                                        name="description"
                                        type="text"
                                        placeholder="10% off"
                                        labelPlacement="inside"
                                    />
                                    <NextUIFormikDatePicker
                                        label="Expiry date"
                                        name="expirationDate"
                                        className="max-w-[280px]"
                                    />
                                    <NextUIFormikInput
                                        label="Quantity"
                                        name="quantityAvailable"
                                        type="number"
                                        placeholder="000"
                                        labelPlacement="inside"
                                    />
                                    <NextUIFormikInput
                                        label="Code"
                                        name="code"
                                        type="text"
                                        placeholder="SD4FRC"
                                        labelPlacement="inside"
                                    />
                                </div>
                                <Button type="submit" color="primary" className="w-[90px]"
                                    isDisabled={!isValid || !dirty}>
                                    Create
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}
