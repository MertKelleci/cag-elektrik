import React, { useState, useEffect } from "react";
import PageTemplate from "../PageTemplate";
import { motion } from "framer-motion";
import Select from "react-select";
import "./NewProduct.scss";

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

const NewProduct = () => {
  const [dropdown, setDropdown] = useState([]);
  const [selected, setSelected] = useState({
    value: "",
    label: "",
  });
  const [product, setProduct] = useState({
    brandID: "",
    name: "",
    price: 0.0,
    serial: "abc",
    stored: 1,
  });

  useEffect(() => {
    ipcRenderer.send("dropdown");
    ipcRenderer.on("dropdown:ready", (event, data) => {
      setDropdown(data.dropdown);
    });
  }, []);

  useEffect(() => {
    if (product.name !== "") {
      ipcRenderer
        .invoke("addItem", { item: product, dest: "items" })
        .then((message) => {
          toast(message);
        })
        .catch((err) => {
          toast(err);
        });
    }
  }, [product]);

  const handleSelect = (selectedOption) => {
    setSelected(selectedOption);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setProduct({
      brandID: selected.value,
      name: event.target.pName.value.toUpperCase(),
      price: parseFloat(event.target.pPrice.value),
      serial: event.target.pSerial.value.toUpperCase(),
      stored: parseInt(event.target.pStock.value),
    });
    event.target.pName.value = "";
    event.target.pPrice.value = 0;
    event.target.pSerial.value = "";
    event.target.pStock.value = 0;
  };

  return (
    <PageTemplate>
      <div className="pageContent">
        <h1>Yeni Ürün Oluştur</h1>
        <form onSubmit={handleSubmit}>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="İsim"
              name="pName"
              id="pName"
              required
            />
            <label htmlFor="pName" className="form__label">
              Ürün İsmi
            </label>
          </div>
          <div className="selectField">
            <Select options={dropdown} onChange={handleSelect} />
          </div>
          <div className="form__group field">
            <input
              step="0.01"
              type="number"
              className="form__field"
              placeholder="₺₺₺"
              name="pPrice"
              id="pPrice"
              required
            />
            <label htmlFor="pPrice" className="form__label">
              Ürün Fiyatı
            </label>
          </div>
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="Kod"
              name="pSerial"
              id="pSerial"
              required
            />
            <label htmlFor="pSerial" className="form__label">
              Ürün Kodu
            </label>
          </div>
          <div className="form__group field">
            <input
              type="number"
              className="form__field"
              placeholder="Stok"
              name="pStock"
              id="pStock"
              required
            />
            <label htmlFor="pStock" className="form__label">
              Ürünün Mevcut Stoğu
            </label>
          </div>
          <motion.button
            className="button1"
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

export default NewProduct;
