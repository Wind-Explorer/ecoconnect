// import { title } from "@/components/primitives";
import DefaultLayout from "../layouts/default";
import { SetStateAction, useEffect, useState } from 'react';
import { Button, Avatar, Link, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import config from "../config";
import instance from "../security/http";

interface Post {
  title: string;
  content: string;
  tags: string;
  id: number;
}

export default function CommunityPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // communityList is a state variable
  // function setCommunityList is the setter function for the state variable
  // e initial value of the state variable is an empty array []
  // After getting the api response, call setCommunityList() to set the value of CommunityList
  const [communityList, setCommunityList] = useState<Post[]>([]);

  // Search Function
  const [search, setSearch] = useState('');
  const onSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearch(e.target.value);
  };

  const getPosts = () => {
    instance
      .get(config.serverAddress + '/post').then((res) => {
        setCommunityList(res.data);
      });
  };

  const searchPosts = () => {
    instance
      .get(config.serverAddress + `/post?search=${search}`).then((res) => {
        setCommunityList(res.data);
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  const onSearchKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
      searchPosts();
    }
  };

  const onClickSearch = () => {
    searchPosts();
  }
  const onClickClear = () => {
    setSearch('');
    getPosts();
  };

  useEffect(() => {
    instance
      .get(config.serverAddress + '/post').then((res) => {
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
        await instance
          .delete(config.serverAddress + `/post/${selectedPost.id}`);
        setCommunityList((prevList) => prevList.filter(post => post.id !== selectedPost.id));
        onOpenChange();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };


  return (
    <DefaultLayout>
      <section className="flex flex-row m-10">
        <div className="flex flex-col w-4/5">
          {
            communityList.map((post) => {
              return (
                <section className="mb-7 flex flex-row bg-red-50 border border-none rounded-2xl" key={post.id}>
                  <div className="pl-7 pr-3 pt-5">
                    <Avatar src="https://pbs.twimg.com/media/GOva9x5a0AAK8Bn?format=jpg&name=large" size="lg" />
                  </div>
                  <div className="flex flex-col justify-center w-full">
                    <div className="h-full flex flex-col justify-center py-5">
                      <div className="flex flex-row items-center">
                        <div className="flex flex-col justify-center w-11/12">
                          <div className="h-full text-sm text-neutral-500">
                            <p>Adam</p>
                          </div>
                          <div className="h-full">
                            <p className="text-lg mb-2 font-bold">
                              {post.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row-reverse justify-center items-center h-full w-10">
                          <Dropdown>
                            <div>
                              <DropdownTrigger className="justify-center items-center">
                                <Button isIconOnly className="w-full h-3/5 justify-center items-center" variant="light">
                                  <svg xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6">

                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                  </svg>
                                </Button>
                              </DropdownTrigger>
                            </div>
                            <DropdownMenu aria-label="Static Actions">
                              <DropdownItem
                                key="edit"
                                onClick={() => {
                                  // Navigate to editPost page with post.id
                                  const editPostUrl = `/editPost/${post.id}`; // Replace with your actual edit post route
                                  window.location.href = editPostUrl;
                                }}>
                                Edit
                              </DropdownItem>
                              <DropdownItem key="delete" className="text-danger" color="danger" onClick={() => handleDeleteClick(post)}>
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                      <div>
                        <p>
                          {post.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div>
                        <p>tag1</p>
                      </div>
                      <div>
                        <p>tag2</p>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="p-5">
                        <p>Like</p>
                      </div>
                      <div className="p-5">
                        <p>Comment</p>
                      </div>
                      <div className="p-5">
                        <p>...</p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })
          }
        </div>
        <section className="flex flex-col w-1/5 mx-auto h-screen">
          <Link href="/createPost" className="w-11/12 h-1/5 mx-auto mb-2">
            <Button isIconOnly className="w-full h-full bg-red-color text-white">
              <div className="flex flex-col">
                <div className="flex flex-row justify-center items-center gap-2">
                  <div className="text-xl">
                    <p>Create a post!</p>
                  </div>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                      stroke="currentColor"
                      className="size-5">

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col text-xs justify-center items-center">
                  <p>Socialize, share your experience or <br></br>ask a question!</p>
                </div>
              </div>
            </Button>
          </Link>
          <div className="flex flex-row w-11/12 border border-none rounded-2xl mx-auto bg-gray-100">
            <Input
              value={search}
              placeholder="Search Title/Content"
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
            />
            <Button isIconOnly className="bg-red-color">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 bg-red-color text-white"
                onClick={onClickSearch}>

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </Button>
            <Button isIconOnly className="bg-red-color">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-white"
                onClick={onClickClear}>

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </section>
      </section>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirm Delete</ModalHeader>
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
