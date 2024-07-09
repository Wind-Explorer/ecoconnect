// import { title } from "@/components/primitives";
import DefaultLayout from "../layouts/default";
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
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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

interface Post {
  title: string;
  content: string;
  tags: string;
  id: number;
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  return (
    <DefaultLayout>
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
                  className="flex flex-row gap-4 bg-red-50 dark:bg-red-950 border border-none rounded-2xl p-4"
                  key={post.id}
                >
                  <div>
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
                              <DropdownTrigger className="justify-center items-center">
                                <Button isIconOnly variant="light">
                                  <EllipsisHorizontalIcon />
                                </Button>
                              </DropdownTrigger>
                            </div>
                            <DropdownMenu aria-label="Static Actions">
                              <DropdownItem
                                key="edit"
                                onClick={() => {
                                  navigate(`/editPost/${post.id}`);
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
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-red-50 dark:bg-red-950 p-4 rounded-xl w-[400px]">
          <Button
            startContent={<PlusIcon />}
            className=" bg-red-500 dark:bg-red-700 text-white"
            size="lg"
            onPress={() => {
              navigate("/createPost");
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
    </DefaultLayout>
  );
}
