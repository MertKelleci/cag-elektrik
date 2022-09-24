import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import PageTemplate from "../PageTemplate";
import { LoginContext } from "../../LoginContext";
import Loader from "../../components/Loader";
import "./Login.scss";

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

const Login = () => {
  const { setCurrentUser } = useContext(LoginContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(!loading);
    ipcRenderer
      .invoke("login", {
        email: event.target.email.value,
        password: event.target.password.value,
      })
      .then((data) => {
        toast(data.message);
        setLoading(!loading);
        if (data.status === 200) {
          setCurrentUser(data.user);
        }
      });
    event.target.email.value = "";
    event.target.password.value = "";
  };
  return (
    <PageTemplate>
      <div className="center">
        <form onSubmit={handleLogin}>
          <div className="form__group field">
            <input
              type="email"
              className="form__field"
              placeholder="a@b.com"
              name="email"
              id="email"
              required
            />
            <label htmlFor="email" className="form__label">
              Mail Adresiniz
            </label>
          </div>
          <div className="form__group field">
            <input
              type="password"
              className="form__field"
              placeholder="****"
              name="password"
              id="password"
              required
            />
            <label htmlFor="password" className="form__label">
              Şifreniz
            </label>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <motion.button
              className="button-login"
              variants={buttonVar}
              initial="init"
              whileHover="hover"
            >
              Giriş Yap
            </motion.button>
          )}
        </form>
      </div>
      <ToastContainer />
    </PageTemplate>
  );
};

export default Login;
