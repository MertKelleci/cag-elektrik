import React, { useState, useEffect } from "react";
import "./SetProduct.scss";
import { motion } from "framer-motion";
import { TiTick, TiEdit, TiDelete } from "react-icons/ti";
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

const ProductComp = ({ item, setSelected, selected, brand }) => {
  let { brandID, price, serial, stored, name } = item;
  const [disc, setDisc] = useState(0);
  const [highLight, setHighlight] = useState(false);

  useEffect(() => {
    ipcRenderer.send("getCompInfo", { brandID });
  }, []);

  useEffect(() => {
    if (selected !== item) {
      setHighlight(false);
    } else {
      setHighlight(true);
    }
  }, [selected]);

  const [pPrice, setpPrice] = useState(
    (price - (price * disc) / 100).toFixed(2)
  );

  ipcRenderer.on("getCompInfo:done", (e, data) => {
    setDisc(data.discount);
    setpPrice((price - (price * disc) / 100).toFixed(2));
  });

  const handleSelection = () => {
    setSelected(item);
  };

  const deleteItem = () => {
    ipcRenderer.send("deleteItem", {
      itemID: item?.id,
      collectionName: "items",
    });
  };

  return (
    <tr>
      <th>{name}</th>
      <th>{serial}</th>
      <th>
        {price}₺ {" -> "}
        {pPrice}₺
      </th>
      <th>{disc}</th>
      <th>{brand?.label}</th>
      <th>{stored}</th>

      <th>
        <motion.button
          className="button"
          variants={buttonVar}
          initial="init"
          whileHover="hover"
          onClick={handleSelection}
        >
          {highLight ? <TiTick /> : <TiEdit />}
        </motion.button>
      </th>
      <th>
        <motion.button
          className="button"
          variants={buttonVar}
          initial="init"
          whileHover="hover"
          onClick={deleteItem}
        >
          <TiDelete />
        </motion.button>
      </th>
    </tr>
  );
};

export default ProductComp;