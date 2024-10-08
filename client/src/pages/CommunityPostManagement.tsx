import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button,
  Tooltip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import instance from "../security/http";
import config from "../config";
import { popErrorToast, popToast } from "../utilities";
import { ClipboardDocumentIcon, TrashDeleteIcon, EyeIcon } from "../icons";

export default function CommunityPostManagement() {
  const [userInformationList, setUserInformationList] = useState<any[]>([]);
  const [communityPostList, setCommunityPostList] = useState<any[]>([]);
  const [mergedList, setMergedList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPostTitle, setSelectedPostTitle] = useState<string | null>(null);
  const [commentsWithUserInfo, setCommentsWithUserInfo] = useState<any[]>([]);

  const columns = [
    { key: "profilePicture", label: "PROFILE PICTURE" },
    { key: "firstName", label: "FIRST NAME" },
    { key: "lastName", label: "LAST NAME" },
    { key: "title", label: "TITLE" },
    { key: "content", label: "CONTENT" },
    { key: "postImage", label: "IMAGE" },
    { key: "actions", label: "ACTIONS" },
  ];

  const populateUserInformationList = () => {
    instance
      .get(`${config.serverAddress}/users/all`)
      .then((response) => {
        const users = response.data;
        const usersWithProfilePictures = users.map((user: { id: string }) => ({
          ...user,
          profilePicture: `${config.serverAddress}/users/profile-image/${user.id}`,
        }));
        setUserInformationList(usersWithProfilePictures);
        console.log("userwithpfp:", usersWithProfilePictures); // Ensure URLs are correct
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  useEffect(() => {
    populateUserInformationList();
  }, []);

  const populateCommunityPostList = () => {
    instance
      .get(`${config.serverAddress}/post`)
      .then((response) => {
        setCommunityPostList(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        popErrorToast(error);
      });
  };

  useEffect(() => {
    populateCommunityPostList();
  }, []);

  useEffect(() => {
    if (userInformationList.length > 0 && communityPostList.length > 0) {
      const mergedData = communityPostList.map((post) => {
        const user = userInformationList.find(
          (user) => user.id === post.userId
        );
        return {
          postId: post.id,
          userId: user?.id,
          ...post,
          ...user,
          uniqueKey: `${post.id}-${user?.id}`,
        };
      });

      // Remove the duplicate 'id' field from merged data
      const removeDuplicateId = mergedData.map((item) => {
        const { id, ...rest } = item;
        return { ...rest };
      });

      setMergedList(removeDuplicateId);
      console.log("merged data: ", removeDuplicateId);
    }
  }, [userInformationList, communityPostList]);

  const handleCopyID = (postId: string, title: string) => {
    navigator.clipboard.writeText(postId);
    popToast(title + "'s Post ID has been copied!", 1);
  };

  const handleDeleteClick = (item: any) => {
    setPostToDelete(item);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (postToDelete) {
      try {
        await instance.delete(
          `${config.serverAddress}/post/${postToDelete.postId}`
        );
        populateCommunityPostList();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleCommentsClick = async (postId: string) => {
    try {
      const postResponse = await instance.get(`${config.serverAddress}/post/${postId}`);
      const post = postResponse.data;

      const commentsResponse = await instance.get(
        `${config.serverAddress}/post/${postId}/getComments`
      );

      const commentsWithInfo = commentsResponse.data.map((comment: any) => {
        const user = userInformationList.find((user) => user.id === comment.userId);
        return {
          ...comment,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      });

      setCommentsWithUserInfo(commentsWithInfo);
      setComments(commentsResponse.data);
      setSelectedPostId(postId);
      setSelectedPostTitle(post.title);
      setIsCommentsModalOpen(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentDelete = async (commentId: string, postId: string) => {
    console.log("Deleting comment with ID: ", commentId)
    try {
      await instance.delete(
        `${config.serverAddress}/post/comments/${commentId}`
      );
      handleCommentsClick(postId)
      popToast("Comment deleted successfully", 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Function to safely render item values
  const renderCellValue = (item: any, columnKey: any) => {
    const value = getKeyValue(item, columnKey);
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value); // Convert object to string
    }
    return value;
  };

  return (
    <div>
      {mergedList.length > 0 && (
        <div className="flex flex-col p-8">
          <p className="text-4xl font-bold">Community Post</p>
          <Table aria-label="User Information Table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={mergedList}>
              {(item) => (
                <TableRow key={item.postId}>
                  {(columnKey) => {
                    const value = renderCellValue(item, columnKey);

                    return (
                      <TableCell>
                        {columnKey === "profilePicture" ? (
                          item.profilePicture ? (
                            <Avatar
                              src={item.profilePicture}
                              alt="Profile"
                              size="lg"
                            />
                          ) : (
                            "No Image"
                          )
                        ) : columnKey === "postImage" ? (
                          <div className="relative w-48">
                            <Image
                              src={`${config.serverAddress}/post/post-image/${item.postId}`}
                              radius="sm"
                            />
                            <p className="absolute inset-0">No image</p>
                          </div>
                        ) : columnKey === "actions" ? (
                          <div className="flex gap-2">
                            <Tooltip content="View Comments">
                              <Button
                                variant="light"
                                isIconOnly
                                onClick={() => handleCommentsClick(item.postId)}
                                aria-label="View Comments"
                              >
                                <EyeIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Copy ID">
                              <Button
                                variant="light"
                                isIconOnly
                                onClick={() =>
                                  handleCopyID(item.postId, item.title)
                                }
                                aria-label="Copy postId"
                              >
                                <ClipboardDocumentIcon />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete">
                              <Button
                                variant="light"
                                isIconOnly
                                aria-label="Delete-Post"
                                className="text-red-500"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <TrashDeleteIcon />
                              </Button>
                            </Tooltip>
                          </div>
                        ) : (
                          <p>{value}</p>
                        )}
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Post Deletion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col text-danger gap-1">
              {postToDelete?.title
                ? `DELETING POST: ${postToDelete.title}`
                : "Delete Post"}
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this post?</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button color="danger" onPress={handleDeleteConfirm}>
                Delete
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        className="max-w-6xl max-h-[90vh]" // modal width and height
      >
        <ModalContent className="w-full h-full flex flex-col">
          <ModalHeader>Comments for Post: {selectedPostTitle}</ModalHeader>
          <ModalBody className="overflow-y-auto flex-1 p-4">
            {commentsWithUserInfo.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Table aria-label="Comments Table" className="w-full table-fixed">
                  <TableHeader>
                    <TableColumn>PROFILE PICTURE</TableColumn>
                    <TableColumn>FIRST NAME</TableColumn>
                    <TableColumn>LAST NAME</TableColumn>
                    <TableColumn>CONTENT</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody items={commentsWithUserInfo}>
                    {(comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <Avatar
                            src={`${config.serverAddress}/users/profile-image/${comment.userId}`}
                            alt="Profile"
                            size="lg"
                          />
                        </TableCell>
                        <TableCell>{comment.firstName}</TableCell>
                        <TableCell>{comment.lastName}</TableCell>
                        <TableCell className="max-w-sm break-words">{comment.content}</TableCell>
                        <TableCell>
                          <Button
                            variant="light"
                            isIconOnly
                            aria-label="Delete-Comment"
                            className="text-red-500"
                            onClick={() => handleCommentDelete(comment.id, comment.postId)}
                          >
                            <TrashDeleteIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex w-full justify-center m-auto p-20 text-gray-500">No comments... It's so lonely 🥹</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={() => setIsCommentsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div >
  );
}
