import React, { useContext } from "react";
import Login from "./Login/Login";
import Logout from "./Logout/Logout";
import { LoginContext } from "../LoginContext";

const MainPage = () => {
  const { currentUser } = useContext(LoginContext);
  if (!currentUser) {
    return <Login />;
  } else {
    return <Logout />;
  }
};

export default MainPage;
