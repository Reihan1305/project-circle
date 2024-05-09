import { Box, Card, CardBody, Image, Text } from "@chakra-ui/react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import {FaGithub,FaLinkedin,FaSquareFacebook,FaSquareInstagram} from "react-icons/fa6";

export default function Watermark() {
  return (
    <Fragment>
      <Card bg={"#3a3a3a"} color={"white"}>
        <CardBody py={4} px={5}>
          <Box fontSize={"md"}>
            Developed by Reihan  - {" "}
            <Link to={"https://github.com/reihan1305"}>
            <FaGithub style={{ display: "inline", marginRight: "5px" }} />
            </Link>
            <Link to={"https://www.linkedin.com/in/reihan-firdaus-1078092aa/"}>
            <FaLinkedin style={{ display: "inline", marginRight: "5px" }} />
            </Link>
            <Link to={"https://www.facebook.com/profile.php?id=100017343370277"}>
            <FaSquareFacebook style={{ display: "inline", marginRight: "5px" }}/>
            </Link>
            <Link to={"https://www.instagram.com/_freihan_/"}>
            <FaSquareInstagram style={{ display: "inline", marginRight: "5px" }}/>
            </Link>
            
          </Box>
          <Text fontSize={"xs"} color={"gray.400"}>
            Powered by{" "}
            <Image
              src="../public/vite.svg"
              alt="Dumbways Logo"
              width={"20px"}
              display={"inline"}
              position={"relative"}
              bottom={"-3px"}
            />{" "}
            With Reihan Firdaus
          </Text>
        </CardBody>
      </Card>
    </Fragment>
  );
}