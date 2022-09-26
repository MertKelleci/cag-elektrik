import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import PageTemplate from "../PageTemplate";
import currency from "currency.js";
import { motion } from "framer-motion";
import { LoginContext } from "../../LoginContext";
import "./Finalize.scss";
import jsPDFInvoiceTemplate, {
  OutputType,
} from "jspdf-invoice-template-nodejs";

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

const createProp = (cart, currentUser, info) => {
  const time = new Date();
  const now = `${time.getDate()}-${
    time.getMonth() + 1
  }-${time.getFullYear()} ${time.getHours()}.${time.getMinutes()}`;

  const props = {
    outputType: OutputType.Save,
    returnJsPDFDocObject: true,
    fileName: `${now}.pdf`,
    orientationLandscape: false,
    compress: true,
    logo: {
      src: process.env.PUBLIC_URL + "cag_elektrik.png",
      type: "PNG", //optional, when src= data:uri (nodejs case)
      width: 53.33, //aspect ratio = width/height
      height: 26.66,
      margin: {
        top: 0, //negative or positive num, from the current position
        left: 0, //negative or positive num, from the current position
      },
    },
    stamp: {
      inAllPages: true, //by default = false, just in the last page
      src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
      type: "JPG", //optional, when src= data:uri (nodejs case)
      width: 20, //aspect ratio = width/height
      height: 20,
      margin: {
        top: 0, //negative or positive num, from the current position
        left: 0, //negative or positive num, from the current position
      },
    },
    business: {
      name: "Cag Elektrik",
      address:
        "Deliklikaya Mah. Deliklikaya - Altinsehir Yolu Cad. 25 F Arnavutkoy/ISTANBUL",
      phone: "0212 886 85 95",
      email: "info@cagelektrikmuhendislik.com",
      website: "www.cagelektrikmuhendislik.com",
    },
    contact: {
      label: "Makbuz bilgileri:",
      name: `Firma: ${info.company}`,
      address: `Satin Alan: ${info.buyer}`,
      otherInfo: `Satis Yapan: ${currentUser.name}`,
    },
    invoice: {
      label: "Makbuz #: ",
      num: 19,
      invDate: `Islem Tarihi: ${now}`,
      invGenDate: `Cikti Tarihi: ${now}`,
      headerBorder: false,
      tableBodyBorder: false,
      header: [
        {
          title: "#",
          style: {
            width: 10,
          },
        },
        {
          title: "Isim",
          style: {
            width: 30,
          },
        },
        {
          title: "Kod",
          style: {
            width: 80,
          },
        },
        { title: "Fiyat" },
        { title: "Adet" },
        { title: "Iskonto" },
        { title: "Total" },
      ],
      table: Array.from(cart, (item, index) => [
        index + 1,
        item.name,
        item.id,
        item.initPrice,
        item.amount,
        item.disc,
        item.totalPrice.toFixed(2),
      ]),
      additionalRows: [
        {
          col1: `Total:`,
          col2: `${info.total}`,
          style: {
            fontSize: 14, //optional, default 12
          },
        },
        {
          col1: "Yapilan Odeme:",
          col2: `${info.payment}`,
          style: {
            fontSize: 10, //optional, default 12
          },
        },
      ],
      invDescLabel: "Imza Alani",
      invDesc: "Satin Alan:                                      Satis Yapan:",
    },
    footer: {
      text: "The invoice is created on a computer and is valid without the signature and stamp.",
    },
    pageEnable: true,
    pageLabel: "Page ",
  };

  return props;
};

const Finalize = () => {
  const location = useLocation();
  const { cart } = location.state;
  const [total, setTotal] = useState(0);
  const init = useRef(true);
  const { currentUser } = useContext(LoginContext);
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
    ipcRenderer
      .invoke("create-receipt", {
        cart: cart,
        info: info,
        currentUser: currentUser.name,
      })
      .then((message) => {
        toast(message);
        createProp(cart, currentUser, info);
        const pdfCreated = jsPDFInvoiceTemplate(
          createProp(cart, currentUser, info)
        );
        console.log(pdfCreated);
      });
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
