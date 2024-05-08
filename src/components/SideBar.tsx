import { Fragment } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BiLogOut } from "react-icons/bi";
import { BsHouse, BsHouseFill } from "react-icons/bs";
import { FaCircleUser, FaRegCircleUser } from "react-icons/fa6";
import {RiUserSearchFill,RiUserSearchLine} from "react-icons/ri";
import { jwtDecode } from 'jwt-decode'

interface User {
    id: string
}

interface JwtPayload {
    User: User
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const jwtToken = localStorage.getItem("jwtToken");
    let idToken: string = "";

    if (jwtToken) {
        try {
            const decodedToken: JwtPayload = jwtDecode(jwtToken);
            idToken = decodedToken.User.id;
        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    }
    return (
        <Fragment>
            <Box
                px={50}
                py={10}
                borderRight={"3px solid #3a3a3a"}
                overflow={"auto"}
                className="hide-scroll"
                color={"white"}
                h={"100%"}
            >
                <Flex flexDir={"column"} justifyContent={"space-between"} h={"100%"}>
                    <Box>
                        <Link to={"/"}>
                            <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                                <Text fontSize={"2xl"}>
                                    {location.pathname === "/" ? <BsHouseFill /> : <BsHouse />}
                                </Text>
                                <Text fontSize={"md"} mt={1}>
                                    Home
                                </Text>
                            </Box>
                        </Link>
                        <Link to={"/search"}>
                            <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                                <Text fontSize={"2xl"}>
                                    {location.pathname === "/search" ? (
                                        <RiUserSearchFill />
                                    ) : (
                                        <RiUserSearchLine />
                                    )}
                                </Text>
                                <Text fontSize={"md"} mt={1}>
                                    Search
                                </Text>
                            </Box>
                        </Link>
                        <Link to={`/my-profile/${idToken}`}>
                            <Box display={"flex"} alignItems={"center"} gap={3} mb={6}>
                                <Text fontSize={"2xl"}>
                                    {location.pathname.includes("/my-profile") ? (
                                        <FaCircleUser />
                                    ) : (
                                        <FaRegCircleUser />
                                    )}
                                </Text>
                                <Text fontSize={"md"} mt={1}>
                                    My Profile
                                </Text>
                            </Box>
                        </Link>
                    </Box>

                    <Flex alignItems={"center"} gap={3} mb={6}>
                        <Text fontSize={"2xl"}>
                            <BiLogOut />
                        </Text>
                        <Text
                            fontSize={"md"}
                            mt={1}
                            cursor={"pointer"}
                            onClick={() => {
                                Swal.fire({
                                    title: "Are you sure?",
                                    text: "You Will Be Logged Out!",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Yes, Logout!",
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        localStorage.clear();
                                        navigate("/login");
                                    }
                                });
                            }}
                        >
                            Logout
                        </Text>
                    </Flex>
                </Flex>
            </Box>
        </Fragment>
    );
}