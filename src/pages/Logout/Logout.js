import React, { useContext, useState } from "react";
import { LoginContext } from "../../LoginContext";
import PageTemplate from "../PageTemplate";
import Loader from "../../components/Loader";
import "./Logout.scss";
import { motion } from "framer-motion";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { ipcRenderer } = window.require("electron");

const buttonVar = {
  init: {
    backgroundColor: "#000000",
    color: "#EEEEEE",
  },
  hover: {
    backgroundColor: "#00ADB5",
    color: "#EEEEEE",
    scale: 1.2,
  },
};
const Logout = () => {
  const { currentUser, setCurrentUser } = useContext(LoginContext);
  const [loading, setLoading] = useState(false);
  const handleLogout = () => {
    setLoading(!loading);
    ipcRenderer.invoke("logout").then((message) => {
      toast(message);
      setLoading(!loading);
      setCurrentUser(null);
    });
  };

  return (
    <PageTemplate>
      <div className="userCard">
        <p>Geçerli Kullanıcı:</p>
        <p>
          <b>{currentUser.name}</b>
        </p>
        {loading ? (
          <Loader />
        ) : (
          <motion.button
            className="button-logout"
            variants={buttonVar}
            initial="init"
            whileHover="hover"
            onClick={handleLogout}
          >
            Çıkış Yap
          </motion.button>
        )}
      </div>
      <ToastContainer />
    </PageTemplate>
  );
};

export default Logout;
