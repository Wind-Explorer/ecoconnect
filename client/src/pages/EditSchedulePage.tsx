import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { Button, Radio } from "@nextui-org/react";
import { NextUIFormikRadioGroup } from "../components/NextUIFormikRadioButton";
import { NextUIFormikDatePicker } from "../components/NextUIFormikDatePicker";
import NextUIFormikInput from "../components/NextUIFormikInput";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../security/http";
import dayjs from "dayjs";
import { ArrowUTurnLeftIcon } from "../icons";


// Validation schema
const validationSchema = yup.object().shape({
    date: yup.date().required(),
    time: yup.string().trim().required(),
    location: yup.string().trim().min(15).max(50).required(),
    postalCode: yup.string().matches(/^\d{6}$/, "Postal code must be exactly 6 digits").required(),
    status: yup.string().trim().required()
});

export default function EditSchedulePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [schedule, setSchedule] = useState<any>({
        date: "",
        time: "",
        location: "",
        postalCode: "",
        status: ""
    });

    useEffect(() => {
        instance.get(`/schedule/${id}`).then((res) => {
            const scheduleData = res.data;

            scheduleData.date = dayjs(scheduleData.dateTime).format("YYYY-MM-DD");
            scheduleData.time = dayjs(scheduleData.dateTime).format("HH:mm");

            console.log("Fetched schedule data:", scheduleData);
            setSchedule(scheduleData);
        }).catch((err) => {
            console.error("Error fetching schedule:", err);
        });
    }, [id]);

    const handleSubmit = (values: any) => {
        let data = { ...values };

        // Ensure the date is in the correct format
        const formattedDate = dayjs(data.date).format("YYYY-MM-DD");
        console.log("Formatted Date:", formattedDate);

        // Ensure the time is in the correct format
        const formattedTime = data.time.length === 5 ? `${data.time}:00` : data.time;
        console.log("Formatted Time:", formattedTime);

        // Combine the formatted date and time
        const dateTimeString = `${formattedDate} ${formattedTime}`;
        console.log("Combined dateTime string:", dateTimeString);

        // Parse the combined string with dayjs
        const dateTime = dayjs(dateTimeString, "YYYY-MM-DD HH:mm:ss");
        console.log("Parsed dateTime:", dateTime);

        // Check if the parsed dateTime is valid
        if (!dateTime.isValid()) {
            console.error("Invalid dateTime format");
            return;
        }

        data.dateTime = dateTime.toISOString();
        data.location = data.location.trim();

        if (typeof data.postalCode === "string") {
            data.postalCode = data.postalCode.trim();
        }

        data.status = data.status.trim();

        console.log("Data to be sent:", data);

        instance.put(`/schedule/${id}`, data)
            .then((res) => {
                console.log(res.data);
                navigate(-1);
            })
            .catch((error) => {
                console.error("Error updating schedule:", error);
            });
    };

    return (
        <div className="w-full h-full pb-12 pt-10">
            <div className="w-[400px] mx-auto p-6 bg-red-50 dark:bg-primary-950 border border-primary-100 rounded-2xl">
                <div>
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => navigate(-1)}
                    >
                        <ArrowUTurnLeftIcon />
                    </Button>

                    <p className="text-3xl font-bold pt-2">Update Schedule</p>
                </div>

                <Formik
                    enableReinitialize
                    initialValues={schedule}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isValid, dirty }) => (
                        <Form className="flex flex-col gap-4 pt-5  items-center justify-center">
                            <div className="flex flex-col gap-5 w-[360px]">
                                <NextUIFormikDatePicker
                                    label="Date"
                                    name="date"
                                    className="max-w-[360px]"
                                />
                                <NextUIFormikInput
                                    type='time'
                                    label="Time"
                                    name="time"
                                    placeholder=""
                                />
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
                            <div>
                                <NextUIFormikRadioGroup
                                    label="Status"
                                    name="status"
                                    className="flex gap-2"
                                >
                                    <Radio value="Up coming">Up coming</Radio>
                                    <Radio value="On going">On going</Radio>
                                    <Radio value="Ended">Ended</Radio>
                                </NextUIFormikRadioGroup>
                            </div>
                            <Button
                                type="submit"
                                color="primary"
                                className="w-[100px]"
                                isDisabled={!isValid || !dirty}
                            >
                                Update
                            </Button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
