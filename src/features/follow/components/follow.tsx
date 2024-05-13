import { Fragment, useEffect, useState} from "react";
import { useAppDispatch, useAppSelectore } from "@/redux/store";
import { API } from "@/utils/api";
import getError from "@/utils/getError";
import {Alert,AlertDescription,AlertIcon,Box,Button,Card,CardBody,Flex,Image,Spinner,Tab,TabList,TabPanel,TabPanels,Tabs,Text,Input} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";

export default function Follow () {
    const [followerArray, setFollowerArray] = useState<any[]>([]);
    const [followingArray, setFollowingArray] = useState<any[]>([]);
    const {data:detailUser} = useAppSelectore((state) => state.profile);
    const jwtToken = localStorage.getItem("jwtToken");
  
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
            detailUser?.follower.map(async (following:any) => {
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
    return(
        <Fragment>
            <Tabs variant="solid-rounded" colorScheme="green" width={"600px"} mt={5}>
                      <TabList justifyContent={"center"} gap={"20px"}>
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
        </Fragment>
    )
}