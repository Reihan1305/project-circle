import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelectore } from "@/redux/store";
import { getDetailUser } from "@/redux/user/DetailUserSlice";
import { getProfile } from "@/redux/user/ProfileSlice";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Image,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { FiEdit3 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function Profile() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [followerArray, setFollowerArray] = useState<any[]>([]);
  const [followingArray, setFollowingArray] = useState<any[]>([]);

  const {
    data: detailUser,
    isLoading,
    isError,
    error
  } = useAppSelectore((state) => state.detailUser);
  const { data: profile } = useAppSelectore((state) => state.profile);
  const jwtToken = localStorage.getItem("jwtToken");

  useEffect(() => {
    dispatch(getDetailUser(params.userId || ""));
  }, [params]);

  useEffect(() => {
    const fetchFollowerData = async () => {
      const fetchedFollowerArray = await Promise.all(
        detailUser?.following.map(async (follower:any) => {
          try {
            const response = await API.get(
              "findbyUserid/" + follower.followerid,
              {
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );
            return response.data.data;
          } catch (error) {
            console.error("Error fetching follower data:", getError(error));
            return null;
          }
        })
      );
      setFollowerArray(fetchedFollowerArray.filter(Boolean));
    };

    const fetchFollowingData = async () => {
      const fetchedFollowingArray = await Promise.all(
        detailUser?.follower.map(async (following) => {
          try {
            const response = await API.get(
              "findbyUserid/" + following.followingid,
              {
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );
            return response.data.data;
          } catch (error) {
            console.error(
              "Error fetching following data:",
              getError(error)
            );
            return null;
          }
        })
      );
      setFollowingArray(fetchedFollowingArray.filter(Boolean));
    };

    if (detailUser) {
      fetchFollowerData();
      fetchFollowingData();
    }
  }, [detailUser, jwtToken]);

  const followAndUnfollow = async () => {
    try {
      await API.post("follow/" + params.userId, "", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      dispatch(getDetailUser(params.userId || ""));
      dispatch(getProfile());
    } catch (error) {
      toast.error(getError(error), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  console.log(detailUser.following);
  
  return (
    <Fragment>
      <Box flex={1} px={5} py={10} overflow={"auto"} className="hide-scroll">
        <Card bg={"#3a3a3a"} color={"white"} mb={"15px"}>
          <CardBody py={4} px={5}>
            <Text fontSize={"2xl"} mb={"10px"}>
              Profile
            </Text>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {isError ? (
                  <Alert
                    status="error"
                    bg={"#FF6969"}
                    mb={3}
                    borderRadius={5}
                  >
                    <AlertIcon color={"white"} />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Box position={"relative"}>
                      <Image
                        src="https://assets-global.website-files.com/5a9ee6416e90d20001b20038/635ab99b5920d1d2c6e04397_horizontal%20(66).svg"
                        alt="Green Gradient"
                        borderRadius={"10px"}
                        width={"100%"}
                        height={"80px"}
                        objectFit={"cover"}
                      />
                      <Image
                        borderRadius="full"
                        bgColor={"#3a3a3a"}
                        border={"5px solid #3a3a3a"}
                        boxSize="75px"
                        objectFit="cover"
                        src={detailUser?.photoprofil === "" ? "../../public/user-solid.svg" :detailUser.photoprofil}
                        alt={detailUser?.fullname}
                        position={"absolute"}
                        top={"40px"}
                        left={"20px"}
                      />
                      {profile?.id === detailUser?.id && (
                        <Link to={`/edit-profile`}>
                          <Button
                            color={"white"}
                            _hover={{ bg: "#38a169", borderColor: "#38a169" }}
                            size="sm"
                            borderRadius={"full"}
                            variant="outline"
                            position={"absolute"}
                            bottom={"-50px"}
                            right={"0px"}>
                            <Text fontSize={"lg"}>
                              <FiEdit3 />
                            </Text>
                          </Button>
                        </Link>
                      )}

                      {profile?.id !== detailUser?.id && (
                        <>
                          <Button
                            color={"white"}
                            bg={detailUser?.following
                              .map((follower:any) => follower.followerid)
                              .includes(profile?.id || "")
                              ? "#38a169"
                              : "#3a3a3a"}
                            _hover={{ bg: "#38a169", borderColor: "#38a169" }}
                            size="sm"
                            borderRadius={"full"}
                            variant="outline"
                            position={"absolute"}
                            bottom={"-50px"}
                            right={"0px"}
                            onClick={followAndUnfollow}>
                            {detailUser?.following
                              .map((follower:any) => follower.followerid)
                              .includes(profile?.id || "")
                              ? "Unfollow"
                              : "Follow"}
                          </Button>
                        </>
                      )}
                    </Box>
                    <Text fontSize={"2xl"} mt={"40px"} fontWeight={"bold"}>
                      {detailUser?.fullname}
                    </Text>
                    <Text fontSize={"sm"} color={"gray.400"}>
                      @{detailUser?.username}
                    </Text>
                    <Text fontSize={"md"} mt={1}>
                      {detailUser?.bio}
                    </Text>
                    <Flex mt={"10px"} gap={3} mb={5}>
                      <Box fontSize={"md"}>
                        {followerArray.length}{" "}
                        <Text display={"inline"} color={"gray.400"}>
                          Followers
                        </Text>
                      </Box>
                      <Box fontSize={"md"}>
                        {followingArray.length}{" "}
                        <Text display={"inline"} color={"gray.400"}>
                          Following
                        </Text>
                      </Box>
                    </Flex>

                    <Tabs variant="solid-rounded" colorScheme="green">
                      <TabList>
                        <Tab color={"white"}>Follower</Tab>
                        <Tab color={"white"}>Following</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <Box bg={"#2b2b2b"} px={5} py={3}>
                            {!followerArray.length ? (
                              <Text fontSize={"md"}>No Follower Found</Text>
                            ) : (
                              <>
                                {followerArray.map(
                                  (follower, index) => (
                                    <Flex
                                      key={index}
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                      my={4}
                                      display={{ base: "block", sm: "flex" }}>
                                      <Flex
                                        gap={2}
                                        alignItems={"center"}
                                        mb={{ base: 3, sm: 0 }}>
                                        <Text>
                                          <Image
                                            borderRadius="full"
                                            boxSize="45px"
                                            objectFit="cover"
                                            src={follower?.photoprofil === "" ? "../../public/user-solid.svg" :follower.photoprofil}
                                            alt={follower.fullname}
                                          />
                                        </Text>
                                        <Box>
                                          <Text fontSize={"sm"}>
                                            {follower.fullname}
                                          </Text>
                                          <Text
                                            fontSize={"sm"}
                                            color={"gray.400"}>
                                            @{follower.username}
                                          </Text>
                                        </Box>
                                      </Flex>
                                      <Text>
                                        <Link to={`/profile/${follower.id}`}>
                                          <Button
                                            color={"white"}
                                            _hover={{
                                              bg: "#38a169",
                                              borderColor: "#38a169",
                                            }}
                                            size="sm"
                                            borderRadius={"full"}
                                            variant="outline">
                                            Visit Profile
                                          </Button>
                                        </Link>
                                      </Text>
                                    </Flex>
                                  )
                                )}
                              </>
                            )}
                          </Box>
                        </TabPanel>
                        <TabPanel>
                          <Box bg={"#2b2b2b"} px={5} py={3}>
                            {!followingArray.length ? (
                              <Text fontSize={"md"}>No Following Found</Text>
                            ) : (
                              <>
                                {followingArray.map(
                                  (following, index) => (
                                    <Flex
                                      key={index}
                                      justifyContent={"space-between"}
                                      alignItems={"center"}
                                      my={4}
                                      display={{ base: "block", sm: "flex" }}>
                                      <Flex
                                        gap={2}
                                        alignItems={"center"}
                                        mb={{ base: 3, sm: 0 }}>
                                        <Text>
                                          <Image
                                            borderRadius="full"
                                            boxSize="45px"
                                            objectFit="cover"
                                            src={following?.photoprofil === "" ? "../../public/user-solid.svg" :following.photoprofil}
                                            alt={following.fullname}
                                          />
                                        </Text>
                                        <Box>
                                          <Text fontSize={"sm"}>
                                            {following.fullname}
                                          </Text>
                                          <Text
                                            fontSize={"sm"}
                                            color={"gray.400"}>
                                            @{following.username}
                                          </Text>
                                        </Box>
                                      </Flex>
                                      <Text>
                                        <Link to={`/profile/${following.id}`}>
                                          <Button
                                            color={"white"}
                                            _hover={{
                                              bg: "#38a169",
                                              borderColor: "#38a169",
                                            }}
                                            size="sm"
                                            borderRadius={"full"}
                                            variant="outline">
                                            Visit Profile
                                          </Button>
                                        </Link>
                                      </Text>
                                    </Flex>
                                  )
                                )}
                              </>
                            )}
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </Box>
    </Fragment>
  );
}