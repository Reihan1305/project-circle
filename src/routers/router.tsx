import { useEffect, useState, ReactNode } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';
import { API } from '@/utils/api';
import Main from '@/layout/Main';
import SearchPage from '@/pages/SearchPage';
import ProfilePage from '@/pages/ProfilePage';
import EditProfilePage from '@/pages/EditProfilePage';
import ReplyPage from '@/pages/ReplyPage';
import FollowPage from "@/pages/FollowPage"

function Router() {
    const [checkAuthFinish, setCheckAuthFinish] = useState<boolean>(true)
    const jwtToken = localStorage.getItem('jwtToken');
    async function authCheck() {
        try {
            await API.get("check", {
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            })
        } catch (error) {
            localStorage.clear()
            return <Navigate to="/login" />
        } finally {
            setCheckAuthFinish(false)
        }
    }

    useEffect(() => {
        if (jwtToken) {
            authCheck()
        } else {
            setCheckAuthFinish(false)
        }
    }, [jwtToken])

    function IsLogin({ children }: { children: ReactNode }) {
        if (jwtToken) {
            return <>{children}</>;
        }
        return <Navigate to="/login" />;
    }

    function IsNotLogged({ children }: { children: ReactNode }) {
        if (!jwtToken) {
            return <>{children}</>;
        }
        return <Navigate to="/" />;
    }

    return (
        <>
            {checkAuthFinish && (
                <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    width={"100vw"}
                    height={"100vh"}
                >
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        width={"70px"}
                        height={"70px"}
                    />
                </Flex>
            )}

            {!checkAuthFinish && (
                <BrowserRouter>
                    <Routes>

                        <Route path="/">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <HomePage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/reply/:threadId">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <ReplyPage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/search">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <SearchPage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/profile/:userId">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <ProfilePage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/my-profile/:userId">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <ProfilePage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/edit-profile">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <EditProfilePage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/follow">
                            <Route
                                index
                                element={
                                    <IsLogin>
                                        <Main>
                                            <FollowPage />
                                        </Main>
                                    </IsLogin>
                                }
                            />
                        </Route>

                        <Route path="/register">
                            <Route
                                index
                                element={
                                    <IsNotLogged>
                                        <RegisterPage />
                                    </IsNotLogged>
                                }
                            />
                        </Route>

                        <Route path="/login">
                            <Route
                                index
                                element={
                                    <IsNotLogged>
                                        <LoginPage />
                                    </IsNotLogged>
                                }
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            )}
        </>
    )
}

export default Router;