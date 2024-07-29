// import { title } from "@/components/primitives";
import { SetStateAction, useEffect, useState } from "react";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import config from "../config";
import instance from "../security/http";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  HandThumbsUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "../icons";
import { useNavigate } from "react-router-dom";
// import { retrieveUserInformation } from "../security/users";
// import UserPostImage from "../components/UserPostImage";

interface Post {
  title: string;
  postImage: Blob;
  content: string;
  tags: string;
  id: number;
}

export default function CommunityPage() {
  const navigate = useNavigate();
  
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return (
      setTimeout(() => {
        navigate("/signin");
      }, 1000) 
      &&
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-bold text-primary-500">User is not verified</p>
          <p className="text-md">Redirecting to sign-in page...</p>
          <Spinner color="danger" />
        </div>
      </div>
    );
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // const [userInformation, setUserInformation] = useState(null);

  // communityList is a state variable
  // function setCommunityList is the setter function for the state variable
  // e initial value of the state variable is an empty array []
  // After getting the api response, call setCommunityList() to set the value of CommunityList
  const [communityList, setCommunityList] = useState<Post[]>([]);

  // Search Function
  const [search, setSearch] = useState("");
  const onSearchChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSearch(e.target.value);
  };

  const getPosts = () => {
    instance.get(config.serverAddress + "/post").then((res) => {
      setCommunityList(res.data);
    });
  };

  const searchPosts = () => {
    instance
      .get(config.serverAddress + `/post?search=${search}`)
      .then((res) => {
        setCommunityList(res.data);
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  const onSearchKeyDown = (e: { key: string }) => {
    if (e.key === "Enter") {
      searchPosts();
    }
  };

  const onClickSearch = () => {
    searchPosts();
  };
  const onClickClear = () => {
    setSearch("");
    getPosts();
  };

  useEffect(() => {
    instance.get(config.serverAddress + "/post").then((res) => {
      console.log(res.data);
      setCommunityList(res.data);
    });
  }, []);

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
        setCommunityList((prevList) =>
          prevList.filter((post) => post.id !== selectedPost.id)
        );
        onOpenChange();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handlePostClick = (id: number) => {
    navigate(`post/${id}`);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-4 m-10">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col">
            <p className="text-3xl font-bold">Community Forums</p>
            <p className="text-xl">
              Socialize, share your experience or ask a question!
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {communityList.map((post) => {
              return (
                <section
                  className="flex flex-row gap-4 bg-primary-50 dark:bg-primary-950 border border-none rounded-2xl p-4"
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Avatar
                      src="https://pbs.twimg.com/media/GOva9x5a0AAK8Bn?format=jpg&name=large"
                      size="lg"
                    />
                  </div>
                  <div className="flex flex-col gap-8 w-full">
                    <div className="h-full flex flex-col gap-4">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                          <p className="text-xl font-bold">{post.title}</p>
                          <p className="text-md text-neutral-500">Adam</p>
                        </div>
                        <div className="flex flex-row-reverse justify-center items-center">
                          <Dropdown>
                            <div>
                              <DropdownTrigger
                                className="justify-center items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button isIconOnly variant="light">
                                  <EllipsisHorizontalIcon />
                                </Button>
                              </DropdownTrigger>
                            </div>
                            <DropdownMenu aria-label="Static Actions">
                              <DropdownItem
                                key="edit"
                                onClick={() => {
                                  navigate(`edit/${post.id}`);
                                }}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
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
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2">
                        <Chip>Tag 1</Chip>
                        <Chip>Tag 2</Chip>
                      </div>
                      <div className="flex flex-row">
                        <Button
                          variant="light"
                          isIconOnly
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HandThumbsUpIcon />
                        </Button>
                        <Button
                          variant="light"
                          isIconOnly
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChatBubbleOvalLeftEllipsisIcon />
                        </Button>
                        <Button
                          variant="light"
                          isIconOnly
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisHorizontalIcon />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-primary-50 dark:bg-primary-950 p-4 rounded-xl w-[400px]">
          <Button
            startContent={<PlusIcon />}
            className="bg-primary-500 dark:bg-primary-700 text-white"
            size="lg"
            onPress={() => {
              navigate("create");
            }}
          >
            <p className="font-bold">Create a post!</p>
          </Button>
          <Input
            value={search}
            placeholder="Search Title/Content"
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
            endContent={
              <div className="flex flex-row -mr-3">
                <Button isIconOnly variant="light" onPress={onClickSearch}>
                  <MagnifyingGlassIcon />
                </Button>
                <Button isIconOnly variant="light" onPress={onClickClear}>
                  <XMarkIcon />
                </Button>
              </div>
            }
          />
        </div>
      </div>

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
}
