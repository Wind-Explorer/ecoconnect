import DefaultLayout from '../layouts/default';
import { Button } from '@nextui-org/react';
import { ArrowUTurnLeftIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import config from '../config';
import NextUIFormikInput from '../components/NextUIFormikInput';
import axios from "axios";
import InsertImage from '../components/InsertImage';

const validationSchema = Yup.object({
    electricalBill: Yup.number().positive().required(),
    waterBill: Yup.number().positive().required(),
    totalBill: Yup.number().positive().required(),
    noOfDependents: Yup.number().integer().positive().required(),
});

export default function HBFormPage() {
    let navigate = useNavigate();

    const initialValues: {
        id: string;
        electricalBill: string;
        waterBill: string;
        totalBill: string;
        noOfDependents: string;
        ebPicture: File | null;
        wbPicture: File | null;
    } = {
        id: '',
        electricalBill: '',
        waterBill: '',
        totalBill: '',
        noOfDependents: '',
        ebPicture: null,
        wbPicture: null,
    };


    const handleSubmit = async (
        values: any,
        { setSubmitting, resetForm, setFieldError }: any
    ) => {
        const formData = new FormData();
        formData.append('electricalBill', values.electricalBill);
        formData.append('waterBill', values.waterBill);
        formData.append('totalBill', values.totalBill);
        formData.append('noOfDependents', values.noOfDependents);

        // Convert image files to blobs
        const ebPictureFile = values.ebPicture;
        const wbPictureFile = values.wbPicture;

        if (ebPictureFile) {
            const ebPictureBlob = ebPictureFile.slice(0, ebPictureFile.size, ebPictureFile.type);
            formData.append('ebPicture', ebPictureBlob);
        }

        if (wbPictureFile) {
            const wbPictureBlob = wbPictureFile.slice(0, wbPictureFile.size, wbPictureFile.type);
            formData.append('wbPicture', wbPictureBlob);
        }

        try {
            const response = await axios.post(config.serverAddress + "/hbcform", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                console.log("Form created successfully:", response.data);
                resetForm(); // Clear form after successful submit
                navigate("/contest");
            } else {
                console.error("Error creating form:", response.statusText);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.field) {
                setFieldError(error.response.data.field, error.response.data.error);
            } else {
                console.error("Unexpected error:", error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DefaultLayout>
            <section className="w-8/12 mx-auto">
                <Button
                    variant="light"
                    onPress={() => navigate(-1)}
                >
                    <ArrowUTurnLeftIcon />
                </Button>
            </section>
            <section className="w-7/12 mx-auto p-5 bg-red-100 border border-none rounded-2xl max-h-m">
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
                                    <div className="flex flex-row gap-10 max-w-xs max-h-xs">
                                        <InsertImage
                                            onImageSelected={(file) => {
                                                setFieldValue('ebPicture', file);
                                            }}
                                        />
                                        <InsertImage
                                            onImageSelected={(file) => {
                                                setFieldValue('wbPicture', file);
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
        </DefaultLayout>
    );
}
