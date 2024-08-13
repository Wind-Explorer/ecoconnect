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
  User,
} from "@nextui-org/react";
import config from "../config";
import instance from "../security/http";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "../icons";
import { useNavigate } from "react-router-dom";
import { retrieveUserInformationById } from "../security/usersbyid";
import { retrieveUserInformation } from "../security/users";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Post {
  title: string;
  postImage: Blob;
  content: string;
  Tags: Tag[];
  id: string;
  userId: string;
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
};

interface Tag {
  id: string;
  tag: string;
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [communityList, setCommunityList] = useState<Post[]>([]);
  const [search, setSearch] = useState(""); // Search Function
  const [userInformation, setUserInformation] = useState<Record<string, User>>(
    {}
  );
  const [imageErrorFlags, setImageErrorFlags] = useState<
    Record<string, boolean>
  >({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return (
      setTimeout(() => {
        navigate("/signin");
      }, 1000) && (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-xl font-bold text-primary-500">
              User is not verified
            </p>
            <p className="text-md">Redirecting to sign-in page...</p>
            <Spinner color="danger" />
          </div>
        </div>
      )
    );
  }

  const getPosts = async () => {
    let query = config.serverAddress + "/post";
    if (selectedTag) {
      query += `?tag=${selectedTag}`;
    } else if (search) {
      query += `?search=${search}`;
    }

    try {
      const res = await instance.get(query);
      setCommunityList(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  useEffect(() => {
    getPosts();
  }, [selectedTag, search]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await instance.get(config.serverAddress + "/post/tags/all");
        setTags(res.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleClearFilter = () => {
    setSelectedTag(null);
  };

  useEffect(() => {
    const fetchUserInformation = async (userId: string) => {
      try {
        const user = await retrieveUserInformationById(userId);

        setUserInformation((prevMap) => ({
          ...prevMap,
          [userId]: user,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    communityList.forEach((post) => {
      if (!userInformation[post.userId]) {
        fetchUserInformation(post.userId);
      }
    });
  }, [communityList]);

  useEffect(() => {
    const getCurrentUserInformation = async () => {
      try {
        const user = await retrieveUserInformation(); // Get the user information
        console.log(user);
        setCurrentUserId(user.id); // Store user ID
      } catch (error) {
        console.error(error);
      }
    };
    getCurrentUserInformation();
  }, []);

  const onSearchChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSearch(e.target.value);
  };

  const searchPosts = () => {
    setSelectedTag(null); // Clear tag filter on search
    instance
      .get(config.serverAddress + `/post?search=${search}`)
      .then((res) => {
        setCommunityList(res.data);
      });
  };

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

  const handlePostClick = (id: string) => {
    navigate(`post/${id}`);
  };

  // Get pfp from server directly(no need convert blob to url)
  const getProfilePicture = (userId: string): string => {
    return `${config.serverAddress}/users/profile-image/${userId}`;
  };

  const handleImageError = (postId: string) => {
    setImageErrorFlags((prevFlags) => ({
      ...prevFlags,
      [postId]: true,
    }));
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
              const profilePictureUrl = getProfilePicture(post.userId);
              const canEditOrDelete = currentUserId === post.userId;

              return (
                <section
                  className="flex flex-row gap-4 bg-primary-50 dark:bg-primary-950 border border-none rounded-2xl p-4"
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Avatar src={profilePictureUrl} size="lg" />
                  </div>
                  <div className="flex flex-col gap-8 w-full">
                    <div className="h-full flex flex-col gap-4">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col">
                          <p className="text-xl font-bold">{post.title}</p>
                          <p className="text-md text-neutral-500">
                            {userInformation[post.userId]?.firstName}{" "}
                            {userInformation[post.userId]?.lastName}
                          </p>
                        </div>
                        <div className="flex flex-row-reverse justify-center items-center">
                          {canEditOrDelete && (
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
                                  textValue="Edit"
                                  onClick={() => {
                                    navigate(`edit/${post.id}`);
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
                          )}
                        </div>
                      </div>
                      <div>
                        <Markdown
                          className="prose dark:*:text-white dark:text-white"
                          remarkPlugins={[remarkGfm]}
                        >
                          {post.content}
                        </Markdown>
                      </div>
                      {imageErrorFlags[post.id] ? null : (
                        <div>
                          <img
                            src={`${config.serverAddress}/post/post-image/${post.id}`}
                            className="w-[300px] h-auto rounded-lg object-cover"
                            onError={() => handleImageError(post.id)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row gap-2">
                        {post.Tags.length > 0 ? (
                          post.Tags.map((tag) => (
                            <Chip key={tag.id}>{tag.tag}</Chip>
                          ))
                        ) : (
                          <p></p>
                        )}
                      </div>
                      <div className="flex flex-row">
                        <Button
                          variant="light"
                          isIconOnly
                          onClick={() => handlePostClick(post.id)}
                        >
                          <ChatBubbleOvalLeftEllipsisIcon />
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
          <div>
            <p>Filter by Tags</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  onClick={() => handleTagClick(tag.tag)}
                  className={
                    selectedTag === tag.tag ? "bg-primary-500 text-white" : ""
                  }
                >
                  {tag.tag}
                </Chip>
              ))}
            </div>
            <div>
              {selectedTag && (
                <Button className="mt-2" onPress={handleClearFilter}>
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
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
