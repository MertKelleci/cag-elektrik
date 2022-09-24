import React, { useState, useEffect } from "react";
import PageTemplate from "../PageTemplate";
import ProductComp from "../../components/ProductComp";
import { BiRefresh } from "react-icons/bi";
import "./Sales.scss";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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

const Sales = () => {
  const [lastdoc, setLastdoc] = useState({});
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState([]);
  const [cart, setCart] = useState([]);
  useEffect(() => {
    ipcRenderer.send("paginatedQuery", {
      collectionName: "items",
      lastdoc: lastdoc,
      sender: "Sales",
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
    setList([]);
    setLastdoc({});
  };

  const updateCart = (product) => {
    setCart([...cart, product]);
  };

  const updateTotal = (price) => {
    setTotal(total + price);
  };

  const handleSearch = (event) => {
    if (event.target.value.length > 0) {
      ipcRenderer.send("querybyParimeter", {
        searchValue: event.target.value.toUpperCase(),
        sender: "Sales",
      });
    } else {
      refreshPage();
    }
  };

  ipcRenderer.on("querybyParimeter:done", (e, data) => {
    if (data.items.length > 0) {
      setList(data.items);
    }
  });

  ipcRenderer.on("paginatedQuery:done-Sales", (e, data) => {
    if (!data.empty) {
      setList([...list, ...data.items]);
    }
    setLoaded(true);
  });
  return (
    <PageTemplate>
      <div className="controlPanel">
        <div className="form__group field">
          <input
            type="text"
            className="form__field"
            placeholder="İsim"
            name="pName"
            id="pName"
            onChange={handleSearch}
            required
          />
          <label htmlFor="pName" className="form__label">
            Ürün İsmi/Kodu
          </label>
        </div>
        <div className="buttonGroup">
          <motion.button
            className="button3"
            variants={buttonVar}
            initial="init"
            whileHover="hover"
            onClick={refreshPage}
          >
            <BiRefresh />
          </motion.button>
          <Link to="/sale/finalize" state={{ cart }}>
            <motion.button
              className="button2"
              variants={buttonVar}
              initial="init"
              whileHover="hover"
            >
              {total.toFixed(2)}₺
            </motion.button>
          </Link>
        </div>
      </div>
      <div className="styled-table" onScroll={handleScroll}>
        <table>
          <thead>
            <tr>
              <th>İsmi</th>
              <th>Kodu</th>
              <th>Fiyatı</th>
              <th>İskontosu</th>
              <th>Adet</th>
              <th>Sepete Ekle</th>
            </tr>
          </thead>
          <tbody>
            {loaded &&
              list.map((item, index) => {
                return (
                  <ProductComp
                    item={item}
                    key={index}
                    updateCart={updateCart}
                    updateTotal={updateTotal}
                  />
                );
              })}
          </tbody>
        </table>
      </div>
    </PageTemplate>
  );
};

<div className="labelInfo">
  <p>İsmi</p>
  <p>Kodu</p>
  <p>Fiyatı</p>
  <p>İskontosu</p>
  <p>Adet</p>
  <p>Sepete Ekle</p>
</div>;

export default Sales;
