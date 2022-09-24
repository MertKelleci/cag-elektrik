import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./SetCompany.scss";
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

const SetCompany = ({ item, setSelected, selected }) => {
  const { discount, name, serial } = item;
  const [highLight, setHighlight] = useState(false);

  useEffect(() => {
    if (selected !== item) {
      setHighlight(false);
    } else {
      setHighlight(true);
    }
  }, [selected]);

  const handleSelection = () => {
    setSelected(item);
  };

  const deleteItem = () => {
    ipcRenderer.send("deleteItem", {
      itemID: item.id,
      collectionName: "brands",
    });
  };

  return (
    <tr>
      <th>{name}</th>
      <th>{serial}</th>
      <th>{discount}</th>
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

export default SetCompany;
