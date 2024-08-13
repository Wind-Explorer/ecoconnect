import instance from "../security/http";
import config from "../config";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, User } from "@nextui-org/react";
import { ChatBubbleOvalLeftEllipsisIcon, EllipsisHorizontalIcon, HandThumbsUpIcon, PaperAirplaneIcon } from "../icons";
import * as Yup from "yup";
import NextUIFormikTextarea from "./NextUIFormikTextarea";
import { Form, Formik, FormikHelpers } from "formik";
import { retrieveUserInformation } from "../security/users";

interface Comment {
    id: string;
    content: string;
    user: User;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
}

const validationSchema = Yup.object({
    content: Yup.string()
        .trim()
        .min(3, "Content must be at least 3 characters")
        .max(500, "Content must be at most 500 characters")
        .required("Content is required"),
});

export default function CommentsModule() {
    const { id } = useParams();
    const [commentList, setCommentList] = useState<Comment[]>([]);
    // To track/manage comment being edited
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State for current user ID

    let postId = id

    // Function to get the profile picture URL
    const getProfilePicture = (userId: string): string => {
        return `${config.serverAddress}/users/profile-image/${userId}`;
    };

    // Fetch current user information to get user ID
    useEffect(() => {
        const getCurrentUserInformation = async () => {
            try {
                const user = await retrieveUserInformation(); // Get the user information
                setCurrentUserId(user.id); // Store user ID
            } catch (error) {
                console.error(error);
            }
        };
        getCurrentUserInformation();
    }, []);

    const getComments = async () => {
        instance
            .get(config.serverAddress + `/post/${postId}/getComments`).then((res) => {
                setCommentList(res.data);
                console.log(res.data);
            });
    };
    useEffect(() => {
        getComments();
    }, [id]);

    const handleEditClick = (comment: Comment) => {
        setEditingCommentId(comment.id);
    };

    const submitComment = async (values: { content: string }, { resetForm }: FormikHelpers<{ content: string }>) => {
        // Find the comment that matches the `editingCommentId` to get userId and postId
        const commentBeingEdited = commentList.find(comment => comment.id === editingCommentId);
        if (!commentBeingEdited) {
            console.error("Comment not found");
            return;
        }
        const data = {
            content: values.content,
            userId: commentBeingEdited.user.id,  // Include the userId
            postId: postId                       // Include the postId
        };

        const response = await instance.put(`${config.serverAddress}/post/comments/${editingCommentId}`, data);

        if (response.status === 200) {
            console.log("Comment updated successfully", response.data);
            resetForm();
            setEditingCommentId(null);
            getComments();
        } else {
            console.error("Failed to update the comment", response.data);
        }
    };

    const handleDeleteClick = (commentId: string) => {
        setCommentToDelete(commentId);
        onOpen();
    };
    const handleDeleteConfirm = async () => {
        if (!commentToDelete) return;

        const response = await instance.delete(`${config.serverAddress}/post/comments/${commentToDelete}`);
        if (response.status === 200) {
            console.log("Comment deleted successfully", response.data);
            onOpenChange();
            setCommentToDelete(null);
            getComments();
        } else {
            console.error("Failed to delete the comment", response.data);
        }
    };

    return (
        <>
            <div className="flex w-full">
                <div className="w-2/12"></div>
                <div className="w-8/12 ml-5 mb-2 text-md font-bold opacity-65">Comment Section</div>
                <div className="w-2/12"></div>
            </div>
            <div className="flex w-full h-full">
                <div className="w-2/12"></div>
                <div className="w-8/12 mx-auto">
                    {commentList.length > 0 ? (
                        commentList.map((comment) => {
                            const user = comment.user; // Get the user object from the comment
                            if (!user) {
                                console.error("User object is undefined for comment:", comment);
                                return null; // Skip rendering this comment if user is undefined
                            }

                            const profilePictureUrl = getProfilePicture(user.id); // Get the user's profile picture
                            const canEditOrDelete = currentUserId === user.id;

                            return (
                                <div className="flex flex-col w-full bg-primary-50 dark:bg-primary-950 rounded-xl mb-2 p-3 mx-auto"
                                    key={comment.id}>
                                    <div className="flex flex-row flex-shrink-0 w-full">
                                        <div>
                                            <Avatar
                                                src={profilePictureUrl}
                                                size="md"
                                            />
                                        </div>
                                        <div className="flex flex-col w-10/12 flex-grow text-sm ml-3">
                                            <div className="font-bold">{user.firstName} {user.lastName}</div>
                                            {editingCommentId === comment.id ? (
                                                <Formik
                                                    initialValues={{ content: comment.content }}
                                                    validationSchema={validationSchema}
                                                    onSubmit={submitComment}
                                                >
                                                    {({ isValid, dirty }) => (
                                                        <Form className="w-full">
                                                            <div className="flex items-center">
                                                                <NextUIFormikTextarea
                                                                    label="Edit Comment"
                                                                    name="content"
                                                                    placeholder="Edit your comment here"
                                                                />
                                                                <Button isIconOnly
                                                                    type="submit"
                                                                    disabled={!isValid || !dirty}
                                                                    className="ml-2 bg-primary-950 text-white">
                                                                    <PaperAirplaneIcon />
                                                                </Button>
                                                            </div>
                                                        </Form>
                                                    )}
                                                </Formik>
                                            ) : (
                                                <div>{comment.content}</div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 ml-10">
                                            {canEditOrDelete && (
                                                <div className="flex flex-row-reverse justify-center items-center size-7">
                                                    <Dropdown>
                                                        <div>
                                                            <DropdownTrigger
                                                                className="justify-center items-center"
                                                            >
                                                                <Button isIconOnly variant="light">
                                                                    <EllipsisHorizontalIcon />
                                                                </Button>
                                                            </DropdownTrigger>
                                                        </div>
                                                        <DropdownMenu aria-label="Static Actions">
                                                            <DropdownItem
                                                                key="edit"
                                                                textValue="Edit"
                                                                onClick={() => handleEditClick(comment)}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                textValue="Delete"
                                                                className="text-danger"
                                                                color="danger"
                                                                onClick={() => handleDeleteClick(comment.id)}
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row ml-14 mt-2 gap-3 w-11/12">
                                        <div className="h-2"></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex w-full justify-center m-auto p-20 text-gray-500">No comments... It's so lonely 🥹</div>
                    )}
                </div>
                <div className="w-2/12"></div>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Confirm Delete
                            </ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this comment?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={handleDeleteConfirm}>
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};