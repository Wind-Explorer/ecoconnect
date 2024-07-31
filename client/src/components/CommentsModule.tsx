import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import config from '../config';
import * as Yup from "yup";
import NextUIFormikTextarea from "../components/NextUIFormikTextarea";
import instance from '../security/http';
import { useNavigate, useParams } from "react-router-dom";
import { retrieveUserInformation } from "../security/users";
import { Button } from "@nextui-org/react";
import { PaperAirplaneIcon } from "../icons";


const validationSchema = Yup.object({
    content: Yup.string()
        .trim()
        .min(3, "Content must be at least 3 characters")
        .max(500, "Content must be at most 500 characters")
});

export default function CommentsModule() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const { id } = useParams(); // Retrieve 'id' from the route
    
    const initialValues = {
        content: "",
    };

    const postId = id;

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

    const submitComment = async (values: any) => {
        const response = await instance.post(config.serverAddress + `/post/${postId}/comments`,
            { ...values, userId, postId }
        );
        console.log("Comment created succesfully", response.data);
    };

    return (
        <div className="flex w-full">
            <div className="w-2/12"></div>
            <div className="w-full mx-auto mt-5">
                <div>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={submitComment}
                    >
                        {({ isValid, dirty }) => (
                            <Form>
                                <div className="relative">
                                <NextUIFormikTextarea
                                    label="Comment"
                                    name="content"
                                    placeholder="Write your comment here"
                                />
                                <div className="flex justify-end my-2">
                                    <Button isIconOnly
                                        type="submit" 
                                        disabled={!isValid || !dirty}
                                        className="bg-primary-950 text-white">
                                        <PaperAirplaneIcon />
                                    </Button>
                                </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className="w-2/12"></div>
        </div>
    );
}