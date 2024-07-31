import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  HandThumbsUpIcon,
  ArrowUTurnLeftIcon,
} from "../icons";
import { retrieveUserInformationById } from "../security/usersbyid";
import CommentInputModule from "../components/CommentInputModule";
import CommentsModule from "../components/CommentsModule";

interface Post {
  title: string;
  postImage: Blob;
  content: string;
  tags: string;
  id: string;
  userId: string;
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
};

const PostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [userInformation, setUserInformation] = useState<Record<string, User>>({});

  useEffect(() => {
    if (id) {
      instance.get(`${config.serverAddress}/post/${id}`)
        .then((res) => setPost(res.data))
        .catch((error) => console.error("Error fetching post:", error));
    }
  }, [id]);

  useEffect(() => {
    if (post) {
      const fetchUserInformation = async () => {
        try {
          const user = await retrieveUserInformationById(post.userId);
          setUserInformation((prevMap) => ({
            ...prevMap,
            [post.userId]: user,
          }));
        } catch (error) {
          console.error(error);
        }
      };

      fetchUserInformation();
    }
  }, [post]);

  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return (
      <div className="flex justify-center min-h-screen">
        <Spinner label="Loading..." color="danger" />
      </div>
    );
  }

  const handleDeleteClick = (post: Post) => {
    setSelectedPost(post);
    onOpen();
  };
  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        await instance.delete(
          config.serverAddress + `/post/${selectedPost.id}`
        );
        onOpenChange();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const getProfilePicture = (userId: string): string => {
    return `${config.serverAddress}/users/profile-image/${userId}`;
  };
  const profilePictureUrl = post ? getProfilePicture(post.userId) : "";

  return (
    <div className="w-full h-full">
      <section className="flex">
        <div className="w-2/12 flex justify-end">
          <Button
            variant="light"
            onPress={() => {
              navigate(-1);
            }}
          >
            <ArrowUTurnLeftIcon />
          </Button>
        </div>
        <div className="flex flex-row w-8/12 gap-4 mx-auto">
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-4">
              <section
                className="flex flex-row gap-4 bg-primary-50 dark:bg-primary-950 border border-none rounded-2xl p-4"
                key={post.id}
              >
                <div>
                  <Avatar
                    src={profilePictureUrl}
                    size="lg"
                  />
                </div>
                <div className="flex flex-col gap-8 w-full">
                  <div className="h-full flex flex-col gap-4">
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col">
                        <p className="text-xl font-bold">{post.title}</p>
                        <p className="text-md text-neutral-500">{userInformation[post.userId]?.firstName} {userInformation[post.userId]?.lastName}</p>
                      </div>
                      <div className="flex flex-row-reverse justify-center items-center">
                        <Dropdown>
                          <DropdownTrigger 
                          className="justify-center items-center">
                            <Button isIconOnly variant="light">
                              <EllipsisHorizontalIcon />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Static Actions">
                            <DropdownItem
                              key="edit"
                              textValue="Edit"
                              onClick={() => {
                                navigate(`../edit/${post.id}`);
                              }}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              textValue="Delete"
                              className="text-danger"
                              color="danger"
                              onClick={() => handleDeleteClick(post)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    <div>
                      <p>{post.content}</p>
                    </div>
                    <div>
                      <p>Image</p>
                      {/* {userInformation && (
                                    <UserPostImage
                                        userId={userInformation}
                                        editable={true}
                                    />
                                    )} */}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <Chip>Tag 1</Chip>
                      <Chip>Tag 2</Chip>
                    </div>
                    <div className="flex flex-row">
                      <Button variant="light" isIconOnly>
                        <HandThumbsUpIcon />
                      </Button>
                      <Button variant="light" isIconOnly>
                        <ChatBubbleOvalLeftEllipsisIcon />
                      </Button>
                      <Button variant="light" isIconOnly>
                        <EllipsisHorizontalIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="w-2/12"></div>
      </section>
      <section>
        <CommentInputModule />
      </section>
      <section>
        <CommentsModule />
      </section>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Delete
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this post?</p>
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
    </div>
  );
};

export default PostPage;
