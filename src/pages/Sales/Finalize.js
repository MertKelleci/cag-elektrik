import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTemplate from "../PageTemplate";
import currency from "currency.js";
import { motion } from "framer-motion";
import Receipt from "../HTML Receipt/Receipt";
import { LoginContext } from "../../LoginContext";
import "./Finalize.scss";

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

const Finalize = () => {
  const location = useLocation();
  const { cart } = location.state;
  const [total, setTotal] = useState(0);
  const init = useRef(true);
  const { currentUser } = useContext(LoginContext);
  const navigate = useNavigate();
  const [info, setInfo] = useState({
    company: "",
    buyer: "",
    total: 0,
    payment: 0,
  });

  useEffect(() => {
    if (init.current) {
      init.current = false;
      return;
    }
    ipcRenderer.send("create-receipt", {
      cart: cart,
      info: info,
      currentUser: currentUser.name,
    });

    ipcRenderer.send("createPDF", { cart, info, currentUser });
    // navigate("/receipt", { state: { cart: cart, info: info } });
  }, [info]);

  useEffect(() => {
    let flag = currency(0);
    cart.forEach((item, index) => {
      flag = currency(flag).add(item.totalPrice);
    });
    setTotal(flag.value);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setInfo({
      company: event.target.cName.value.toUpperCase(),
      buyer: event.target.bName.value,
      total: total,
      payment: parseFloat(event.target.payment.value),
    });
  };

  ipcRenderer.on("create-receipt:done", (e, data) => {
    navigate("/sale");
    toast(data.message);
  });

  return (
    <PageTemplate>
      <div className="receipt">
        <table>
          <thead>
            <tr>
              <th>İsim</th>
              <th>Kod</th>
              <th>Fiyat</th>
              <th>İskonto</th>
              <th>Adet</th>
              <th>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => {
              const {
                name,
                serial,
                initPrice,
                disc,
                soldPrice,
                amount,
                totalPrice,
              } = item;
              return (
                <tr key={index}>
                  <td>{name}</td>
                  <td>{serial}</td>
                  <td>
                    {initPrice}₺ {" -> "} {soldPrice}₺
                  </td>
                  <td>{disc}</td>
                  <td>{amount}</td>
                  <td>{totalPrice.toFixed(2)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="3">Toplam Tutar:</td>
              <td colSpan="3">{total}₺</td>
            </tr>
          </tbody>
        </table>
      </div>
      <form className="buyers-form" onSubmit={handleSubmit}>
        <div className="finalize-cells">
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
              type="text"
              className="form__field"
              placeholder="İsim"
              name="bName"
              id="bName"
              required
            />
            <label htmlFor="bName" className="form__label">
              Satın Alan
            </label>
          </div>
        </div>
        <div className="finalize-cells">
          <div className="form__group field">
            <input
              type="number"
              step="0.01"
              min="0"
              max={total.toString()}
              className="form__field"
              placeholder="İsim"
              name="payment"
              id="payment"
              required
            />
            <label htmlFor="payment" className="form__label">
              Ödeme Miktarı
            </label>
          </div>

          <motion.button
            className="finalize-button"
            variants={buttonVar}
            initial="init"
            whileHover="hover"
          >
            Tamamla
          </motion.button>
        </div>
      </form>
      <ToastContainer />
    </PageTemplate>
  );
};

export default Finalize;
