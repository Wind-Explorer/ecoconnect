import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { NextUIFormikDatePicker } from "../components/NextUIFormikDatePicker";
import instance from "../security/http";
import { useEffect, useState } from "react";
import { ArrowUTurnLeftIcon } from "../icons";

// Validation schema
const validationSchema = Yup.object({
    brand: Yup.string().trim()
        .required("Brand name is required"),
    description: Yup.string().trim()
        .required("Description is required"),
    expirationDate: Yup.date()
        .required("Expiry date is required"),
    quantityAvailable: Yup.number()
        .typeError("Must be a number")
        .positive("Must be a positive value")
        .required("Quantity is required"),
    code: Yup.string().trim()
        .required("Code is required"),
});

export default function EditVoucherPage() {
    const { id } = useParams(); // Get voucher ID from URL
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({
        brand: "",
        description: "",
        expirationDate: "",
        quantityAvailable: "",
        code: "",
    });

    useEffect(() => {
        // Fetch voucher details by ID
        instance.get(`/vouchers/${id}`)
            .then((res) => {
                const { brand, description, expirationDate, quantityAvailable, code } = res.data;
                setInitialValues({
                    brand,
                    description,
                    expirationDate: new Date(expirationDate).toISOString().slice(0, 10), // Format for date input
                    quantityAvailable,
                    code,
                });
            })
            .catch((err) => {
                console.error("Error fetching voucher details:", err);
            });
    }, [id]);

    const handleSubmit = async (
        values: any,
        { setSubmitting, resetForm, setFieldError }: any
    ) => {
        try {
            const response = await instance.put(`/vouchers/${id}`, values);

            if (response.status === 200) {
                console.log("Voucher updated successfully:", response.data);
                resetForm(); // Clear form after successful update
                navigate(-1); // Navigate back after updating
            } else {
                console.error("Error updating voucher:", response.statusText);
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
        <div className="w-full h-full pb-12 pt-20">
            <div className="w-[350px] mx-auto p-6 bg-red-50 dark:bg-primary-950 border border-primary-100 rounded-2xl">
                <div className="py-2">
                    <Button variant="light" isIconOnly onPress={() => navigate(-1)}>
                        <ArrowUTurnLeftIcon />
                    </Button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isValid }) => (
                            <Form className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4 w-[280px]">
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
                                <Button type="submit" color="primary" className="w-[100px]"
                                    isDisabled={!isValid}>
                                    Update
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}
