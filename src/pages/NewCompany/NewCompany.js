import React, { useState, useEffect } from "react";
import PageTemplate from "../PageTemplate";
import "./NewCompany.scss";
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

const NewCompany = () => {
  const [company, setCompany] = useState({
    discount: 0,
    name: "",
  });

  function handleChange(event) {
    event.preventDefault();
    setCompany({
      discount: parseFloat(event.target.cDisc.value),
      name: event.target.cName.value.toUpperCase(),
      serial: event.target.cSerial.value,
    });
    event.target.cDisc.value = 0;
    event.target.cName.value = "";
    event.target.cSerial.value = "";
  }

  useEffect(() => {
    if (company.name !== "") {
      ipcRenderer
        .invoke("addItem", { item: company, dest: "brands" })
        .then((message) => {
          toast(message);
        })
        .catch((err) => {
          toast(err);
        });
    }
  }, [company]);

  return (
    <PageTemplate>
      <div className="pageContent">
        <h1>Yeni Firma Oluştur</h1>
        <form onSubmit={handleChange}>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="İsim"
              name="cName"
              id="cName"
              required
            />
            <label htmlFor="cName" className="form__label">
              Firma İsmi
            </label>
          </div>
          <div className="form__group field">
            <input
              step="0.01"
              type="number"
              className="form__field"
              placeholder="İskonto"
              name="cDisc"
              id="cDisc"
              required
            />
            <label htmlFor="cDisc" className="form__label">
              Firma Diskontosu
            </label>
          </div>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="Kod"
              name="cSerial"
              id="cSerial"
              required
            />
            <label htmlFor="cSerial" className="form__label">
              Firma Kodu
            </label>
          </div>
          <motion.button
            className="button"
            variants={buttonVar}
            initial="init"
            whileHover="hover"
          >
            Oluştur
          </motion.button>
        </form>
      </div>
      <ToastContainer />
    </PageTemplate>
  );
};
export default NewCompany;
