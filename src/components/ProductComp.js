import React, { useState, useEffect } from "react";
import "./ProductComp.scss";
import { motion } from "framer-motion";
import currency from "currency.js";
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

const ProductComp = ({ item, updateCart, updateTotal }) => {
  let { brandID, price, serial, stored, name, id } = item;
  const [disc, setDisc] = useState(0);
  const [amount, setAmount] = useState(0);
  const [pPrice, setpPrice] = useState(
    currency(price).subtract(currency(price).multiply(disc).divide(100)).value
  );

  useEffect(() => {
    ipcRenderer.invoke("getCompInfo", { brandID, serial }).then((discount) => {
      setDisc(discount);
      setpPrice(
        currency(price).subtract(currency(price).multiply(disc).divide(100))
          .value
      );
    });
  }, [item]);

  useEffect(() => {
    setpPrice(
      currency(price).subtract(currency(price).multiply(disc).divide(100)).value
    );
  }, [disc]);

  const handleAmount = (event) => {
    setAmount(event.target.value > stored ? stored : event.target.value);
  };

  const handlePurchase = () => {
    if (amount > 0) {
      updateTotal(pPrice * amount);
      updateCart({
        name,
        serial,
        initPrice: price,
        disc,
        soldPrice: pPrice,
        amount,
        totalPrice: pPrice * amount,
        id,
      });
      setAmount(0);
      ipcRenderer.send("getCompInfo", { brandID });
    }
  };

  return (
    <tr>
      <th>{name}</th>
      <th>{serial}</th>
      <th>
        {currency(price).value}₺ {" -> "}
        {currency(pPrice).value}₺
      </th>
      <th>
        <input
          type="number"
          step="0.5"
          min="0"
          style={{ width: "50px" }}
          max="100"
          placeholder="İskonto"
          value={disc}
          onChange={(event) => {
            setDisc(event.target.value);
          }}
          className="formArea"
        />
      </th>
      <th>
        <input
          type="number"
          min="0"
          style={{ width: "50px" }}
          placeholder="Adet"
          value={amount}
          onChange={handleAmount}
          className="formArea"
        />
      </th>

      <th>
        <motion.button
          className="button"
          variants={buttonVar}
          initial="init"
          whileHover="hover"
          onClick={handlePurchase}
        >
          {(pPrice * amount).toFixed(2)}₺
        </motion.button>
      </th>
    </tr>
  );
};

export default ProductComp;
