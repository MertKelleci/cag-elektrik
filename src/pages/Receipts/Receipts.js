import React, { useState, useEffect } from "react";
import PageTemplate from "../PageTemplate";
import { motion } from "framer-motion";
import ReceiptComp from "../../components/ReceiptComp";
import "./Receipts.scss";

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

const Receipts = () => {
  const [lastdoc, setLastdoc] = useState(null);
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [fDate, setFDate] = useState(null);
  const [lDate, setLDate] = useState(null);

  useEffect(() => {
    ipcRenderer
      .invoke("paginatedQuery", {
        collectionName: "receipts",
        lastdoc: lastdoc,
        sender: "Receipts",
      })
      .then((items) => {
        if (!items.empty) {
          setList([...list, ...items]);
        }
        setLoaded(true);
      });
  }, [lastdoc]);

  const handleScroll = (event) => {
    let triggerHeight =
      event.currentTarget.scrollTop + event.currentTarget.offsetHeight;

    if (triggerHeight >= (event.currentTarget.scrollHeight * 9) / 10) {
      setLastdoc(list[list.length - 1]);
    }
  };

  const refreshPage = () => {
    setLastdoc(lastdoc ? null : {});
    setList([]);
  };

  const handleSearch = (event) => {
    if (event.target.value.length > 0) {
      ipcRenderer
        .invoke("querybyParimeter", {
          searchValue: event.target.value.toUpperCase(),
          sender: "Receipts",
        })
        .then((items) => {
          if (items.length > 0) {
            setList(items);
          }
        });
    } else {
      refreshPage();
    }
  };

  const handleDateSearch = () => {
    if (!fDate || !lDate) {
      toast("Lütfen tarihleri girin!");
      return;
    }

    ipcRenderer.invoke("searchWithDates", { fDate, lDate }).then((list) => {
      setList(list);
    });
  };

  return (
    <PageTemplate>
      <div className="receipts-searchbar">
        <div className="form__group field">
          <input
            type="text"
            className="form__field"
            placeholder="İsim"
            name="cName"
            id="cName"
            onChange={handleSearch}
            required
          />
          <label htmlFor="cName" className="form__label">
            Firma İsmi
          </label>
        </div>
        <div className="form__group field">
          <input
            type="date"
            className="form__field"
            placeholder="İsim"
            name="fDate"
            id="fDate"
            onChange={(event) => {
              setFDate(new Date(event.target.value));
            }}
            required
          />
          <label htmlFor="fDate" className="form__label">
            Başlangıç Tarihi
          </label>
        </div>
        <div className="form__group field">
          <input
            type="date"
            className="form__field"
            placeholder="İsim"
            name="lDate"
            id="lDate"
            onChange={(event) => {
              setLDate(new Date(event.target.value));
            }}
            required
          />
          <label htmlFor="lDate" className="form__label">
            Bitiş Tarihi
          </label>
        </div>
        <motion.button
          className="button2"
          variants={buttonVar}
          initial="init"
          whileHover="hover"
          onClick={handleDateSearch}
          style={{ borderRadius: "10px" }}
        >
          Tarih İle Ara
        </motion.button>
      </div>
      <motion.div layout className="receipts-maindiv" onScroll={handleScroll}>
        {loaded &&
          list.map((item, index) => {
            return <ReceiptComp key={index} item={item} />;
          })}
      </motion.div>
      <ToastContainer />
    </PageTemplate>
  );
};

export default Receipts;
