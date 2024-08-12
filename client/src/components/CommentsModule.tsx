import instance from "../security/http";
import config from "../config";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from "@nextui-org/react";
import { ChatBubbleOvalLeftEllipsisIcon, EllipsisHorizontalIcon, HandThumbsUpIcon } from "../icons";

interface Comment {
    id: string;
    content: string;
    user: User; // Make user optional
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
}

export default function CommentsModule() {
    const { id } = useParams();
    const [commentList, setCommentList] = useState<Comment[]>([]);

    let postId = id

    // Function to get the profile picture URL
    const getProfilePicture = (userId: string): string => {
        return `${config.serverAddress}/users/profile-image/${userId}`;
    };

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
                                            <div className="break-words whitespace-pre-wrap">{comment.content}</div>
                                        </div>
                                        <div className="flex-shrink-0 ml-10">
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
                                                        >
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="delete"
                                                            textValue="Delete"
                                                            className="text-danger"
                                                            color="danger"
                                                        >
                                                            Delete
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row ml-14 mt-2 gap-3 w-11/12">
                                        <Button variant="light" isIconOnly>
                                            <HandThumbsUpIcon />
                                        </Button>
                                        <Button variant="light" isIconOnly className="w-20">
                                            <div>
                                                <ChatBubbleOvalLeftEllipsisIcon />
                                            </div>
                                            <div>
                                                Reply
                                            </div>
                                        </Button>
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
        </>
    );
};