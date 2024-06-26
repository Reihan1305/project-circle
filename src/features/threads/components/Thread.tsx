import { Fragment } from "react";
import { Alert, AlertDescription, AlertIcon, Box, Button, Flex, Spinner, Text, Image } from "@chakra-ui/react";
import moment from "moment";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useAppSelectore } from "@/redux/store"; 
import { useDeleteThread, useInfinityThreads, usePostLike } from "../hooks/useThreadData";
import ThreadForm from "./ThreadForm";
//icons
import { BiCommentDetail } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";


export default function Thread() {
  const { isLoading, data: threads, isError, error, hasNextPage, fetchNextPage, isFetching, isFetchingNextPage } = useInfinityThreads();
  const { mutate } = usePostLike();
  const { mutate: mutateDelete } = useDeleteThread();
  const { data: profileData } = useAppSelectore((state) => state.profile);
  

  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Text fontSize={"2xl"} mb={"10px"}>
          Home
        </Text>
        <ThreadForm /> <br />
        {isLoading ? (
          <Box textAlign={"center"}>
            <Spinner size={"xl"} />
          </Box>
        ) : (
          <>
            {isError ? (
              <Alert status="error" bg={"#FF6969"} mb={3} borderRadius={5}>
                <AlertIcon color={"white"} />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : (
              <>
            {threads?.pages.map((group, i) => (
            <Fragment key={i}>
                {group.data.data.map((thread:any) => (
                    <Fragment key={thread.id}>
                    {thread && (
                        <Flex gap={"15px"} border={"2px solid #3a3a3a"} p={"20px"} mb={"10px"}>
                          <Image borderRadius="full" boxSize="40px" objectFit="cover" src={thread.createdBy?.photoprofil==="" ? "../../public/user-solid.svg": thread.createdBy.photoprofil} /> {/* menambahkan pengecekan nullish */}
                          <Box>
                            <Box display={{ base: "block", md: "flex" }} mb={"5px"}>
                              <Link to={`/profile/${thread.userId}`}>
                                <Text fontWeight={"bold"} me={"10px"}>
                                  {thread.createdBy.fullname}
                                </Text>
                              </Link>
                              <Box mt={"2px"} fontSize={"sm"} color={"gray.400"}>
                                <Link to={`/profile/${thread.userId}`}>@{thread.createdBy.username}</Link> -{""}
                                <Text display={"inline-block"} title={thread.createdAt}>
                                  {moment(new Date(thread.createdAt)).calendar()}
                                </Text>
                              </Box>
                            </Box>
                            <Text fontSize={"sm"} mb={"10px"} wordBreak={"break-word"}>
                              {thread.content}
                            </Text>
                            {thread.image && <Image width={"100%"} objectFit="cover" src={thread.image} alt={`${thread.image} Image Thread`} />}
                            {/* Button Like */}
                            <Flex gap={"15px"}>
                              <Flex alignItems={"center"} onClick={() => mutate(thread.id.toString())} cursor={"pointer"}>
                                {thread.isliked ? (
                                  <AiFillHeart style={{ fontSize: "20px", marginRight: "5px", marginTop: "1px" }} />
                                ) : (
                                  <AiOutlineHeart style={{ fontSize: "20px", marginRight: "5px", marginTop: "1px" }} />
                                )}
                                <Text cursor={"pointer"} fontSize={"sm"} color={"gray.400"}>
                                    {thread.like && thread.like.length > 0 ? thread.like.length : 0}
                                </Text>
                              </Flex>

                              {/* Button Reply */}
                              <Link to={`/reply/${thread.id}`}>
                                <Flex alignItems={"center"}>
                                <BiCommentDetail style={{ fontSize: "20px", marginRight: "5px", marginTop: "1px" }} />
                                    <Text fontSize={"sm"} color={"gray.400"}>
                                        {thread.replies && thread.replies.length > 0 ? thread.replies.length : 0} Replies
                                    </Text>
                                </Flex>
                              </Link>

                              {/* Delete Thread */}
                              {thread.userId === profileData?.id && ( 
                                <Flex
                                  alignItems={"center"}
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Are you sure?",
                                      text: "This Thread Will Be Deleted Permanently!",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#3085d6",
                                      cancelButtonColor: "#d33",
                                      confirmButtonText: "Yes, Delete This Thread!",
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        mutateDelete(thread.id);
                                      }
                                    });
                                  }}
                                  cursor={"pointer"}
                                >
                                  <RiDeleteBin5Line style={{ fontSize: "20px", marginRight: "5px", marginTop: "1px" }} />
                                </Flex>
                              )}
                            </Flex>
                          </Box>
                    </Flex>
                    )}
                    </Fragment>
                ))}
            </Fragment>
            ))}
                <Flex justifyContent={"center"}>
                  {isFetching && isFetchingNextPage ? (
                    <Box textAlign={"center"}>
                      <p>No More threads</p>
                    </Box>
                  ) : (
                    <>
                      {hasNextPage && (
                        <Button
                          colorScheme="green"
                          size="md"
                          onClick={() => {
                            fetchNextPage();
                          }}
                        >
                          Load More
                        </Button>
                      )}
                    </>
                  )}
                </Flex>
              </>
            )}
          </>
        )}
      </Box>
    </Fragment>
  );
}
