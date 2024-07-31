import { Formik, Form } from "formik";
import * as yup from "yup";
import { Button, Radio } from "@nextui-org/react";
import { NextUIFormikRadioGroup } from "../components/NextUIFormikRadioButton";
import { NextUIFormikDatePicker } from "../components/NextUIFormikDatePicker";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { useNavigate } from "react-router-dom";
import instance from "../security/http";
import dayjs from "dayjs";

// Validation schema
const validationSchema = yup.object().shape({
    date: yup.date().required(),
    time: yup.string().trim().required(),
    location: yup.string().trim().min(15).max(50).required(),
    postalCode: yup.string().matches(/^\d{6}$/, "Postal code must be exactly 6 digits").required(),
    status: yup.string().trim().required()
});

const initialValues: any = {
    date: "",
    time: "",
    location: "",
    postalCode: "",
    status: ""
};

export default function CreateSchedulePage() {
    const navigate = useNavigate();

    const handleSubmit = (values: any) => {
        let data = { ...values };

        // Ensure the date is in the correct format
        const formattedDate = dayjs(data.date).format('YYYY-MM-DD');
        console.log("Formatted Date:", formattedDate);

        // Ensure the time is in the correct format
        const formattedTime = data.time.length === 5 ? `${data.time}:00` : data.time;
        console.log("Formatted Time:", formattedTime);

        // Combine the formatted date and time
        const dateTimeString = `${formattedDate} ${formattedTime}`;
        console.log("Combined dateTime string:", dateTimeString);

        // Parse the combined string with dayjs
        const dateTime = dayjs(dateTimeString, 'YYYY-MM-DD HH:mm:ss');
        console.log("Parsed dateTime:", dateTime);

        // Check if the parsed dateTime is valid
        if (!dateTime.isValid()) {
            console.error("Invalid dateTime format");
            return;
        }

        data.dateTime = dateTime.toISOString();

        data.location = data.location.trim();

        if (typeof data.postalCode === 'string') {
            data.postalCode = data.postalCode.trim();
        }

        data.status = data.status.trim();

        console.log("Data to be sent:", data);

        instance.post("/schedule", data)
            .then((res) => {
                console.log(res.data);
                navigate(-1);
            })
    };

    return (
        <section className="flex flex-col items-center justify-center gap-20 py-8 md:py-10">
            <div className="w-full flex items-start">
                <Button
                    variant="light"
                    onPress={() => navigate(-1)}
                >
                    Back
                </Button>
                <div className="flex-grow text-center">
                    <p className="text-3xl font-bold">Add New Schedule</p>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isValid, dirty }) => (
                    <Form className="flex flex-col gap-4">
                        <div className="flex gap-8">
                            <NextUIFormikDatePicker
                                label="Date"
                                name="date"
                                className="max-w-[280px]"
                            />
                            <NextUIFormikInput
                                type='time'
                                label="Time"
                                name="time"
                                placeholder=""
                            />
                        </div>
                        <div className="flex gap-8">
                            <NextUIFormikInput
                                type="text"
                                label="Location"
                                name="location"
                                placeholder="Enter the location"
                            />
                            <NextUIFormikInput
                                type="text"
                                label="Postal Code"
                                name="postalCode"
                                placeholder="123456"
                            />
                        </div>
                        <NextUIFormikRadioGroup
                            label="Status"
                            name="status"
                            className="flex gap-2"
                        >
                            <Radio value="Up coming">Up coming</Radio>
                            <Radio value="On going">On going</Radio>
                            <Radio value="Ended">Ended</Radio>
                        </NextUIFormikRadioGroup>
                        <Button type="submit" color="primary" className="w-[100px]">Create</Button>
                        {/* Example of using isValid and dirty */}
                        <p>Form is {isValid ? 'valid' : 'invalid'}</p>
                        <p>Form has been {dirty ? 'touched' : 'not touched'}</p>
                    </Form>
                )}
            </Formik>
        </section >
    )
}