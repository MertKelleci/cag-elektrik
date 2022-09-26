import React, { useEffect, useRef, useState } from "react";
import PageTemplate from "../PageTemplate";
import "./EditProduct.scss";
import { motion } from "framer-motion";
import Select from "react-select";
import SetProduct from "../../components/SetProduct";
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

const EditProduct = () => {
  const [lastdoc, setLastdoc] = useState(null);
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [itemID, setitemID] = useState("");
  const pPriceRef = useRef(null);
  const pNameRef = useRef(null);
  const pSerialRef = useRef(null);
  const pStockRef = useRef(null);
  const [flagItem, setflagItem] = useState(null);
  const [dropdownSelected, setDropdownSelected] = useState({
    value: "",
    label: "",
  });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ipcRenderer
      .invoke("paginatedQuery", {
        collectionName: "items",
        lastdoc: lastdoc,
      })
      .then((items) => {
        if (!items.empty) {
          setList([...list, ...items]);
        }
        setLoaded(true);
      });
    ipcRenderer.invoke("dropdown").then((thisDropdown) => {
      setDropdown(thisDropdown);
    });
  }, [lastdoc]);

  useEffect(() => {
    if (flagItem) {
      ipcRenderer
        .invoke("updateItem", {
          item: flagItem,
          id: itemID,
          collectionName: "items",
        })
        .then((message) => {
          toast(message);
        });
    }
  }, [flagItem]);

  useEffect(() => {
    if (selected !== null) {
      setitemID(selected?.id);
      pPriceRef.current.value = selected?.price;
      pNameRef.current.value = selected?.name;
      setDropdownSelected(dropdown.find((o) => o.value === selected?.brandID));
      pSerialRef.current.value = selected?.serial;
      pStockRef.current.value = selected?.stored;
    }
  }, [selected]);

  const handleScroll = (event) => {
    let triggerHeight =
      event.currentTarget.scrollTop + event.currentTarget.offsetHeight;

    if (triggerHeight >= (event.currentTarget.scrollHeight * 8) / 10) {
      setLastdoc(list[list.length - 1]);
    }
  };

  const refreshPage = () => {
    setList([]);
    setLastdoc(lastdoc ? null : {});
  };

  const handleSelect = (selectedOption) => {
    setDropdownSelected(selectedOption);
  };

  const handleDelete = (item) => {
    ipcRenderer
      .invoke("deleteItem", { item: item, collectionName: "items" })
      .then((message) => {
        toast(message);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setflagItem({
      brandID: dropdownSelected.value,
      name: event.target.pName.value.toUpperCase(),
      price: parseFloat(event.target.pPrice.value),
      serial: event.target.pSerial.value,
      stored: parseInt(event.target.pStock.value),
    });
    refreshPage();
    event.target.pName.value = "";
    event.target.pPrice.value = 0;
    event.target.pSerial.value = "";
    event.target.pStock.value = 0;
  };

  const handleSearch = (event) => {
    if (event.target.value.length > 0) {
      ipcRenderer
        .invoke("querybyParimeter", {
          searchValue: event.target.value.toUpperCase(),
          sender: "EditProducts",
        })
        .then((items) => {
          setList(items);
        });
    } else {
      refreshPage();
    }
  };

  ipcRenderer.on("deleteItem:done", (e, data) => {
    toast(data.message);
    refreshPage();
  });

  return (
    <PageTemplate>
      <div className="controlPanel">
        <div className="form__group field">
          <input
            type="text"
            className="form__field test"
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
      </div>
      <div className="styled-table half" onScroll={handleScroll}>
        <table>
          <thead>
            <tr>
              <th>İsmi</th>
              <th>Kodu</th>
              <th>Fiyatı</th>
              <th>İskontosu</th>
              <th>Markası</th>
              <th>Adet</th>
              <th>Düzenle</th>
              <th>Sil</th>
            </tr>
          </thead>
          <tbody>
            {loaded &&
              list.map((item, index) => {
                return (
                  <SetProduct
                    item={item}
                    key={index}
                    brand={dropdown.find((o) => o.value === item?.brandID)}
                    setSelected={setSelected}
                    selected={selected}
                    deleteItem={handleDelete}
                  />
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="editArea-edit">
        <form onSubmit={handleSubmit}>
          <div className="cells">
            <div className="form__group field">
              <input
                type="text"
                className="form__field"
                placeholder="İsim"
                name="pName"
                id="pName"
                ref={pNameRef}
                required
              />
              <label htmlFor="pName" className="form__label">
                Ürün İsmi
              </label>
            </div>
            <div className="selectField">
              <Select
                options={dropdown}
                onChange={handleSelect}
                value={dropdownSelected}
              />
            </div>
          </div>
          <div className="cells">
            <div className="form__group field">
              <input
                step="0.01"
                type="number"
                className="form__field"
                placeholder="₺₺₺"
                name="pPrice"
                ref={pPriceRef}
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
                ref={pSerialRef}
                id="pSerial"
                required
              />
              <label htmlFor="pSerial" className="form__label">
                Ürün Kodu
              </label>
            </div>
          </div>
          <div className="cells">
            <div className="form__group field">
              <input
                type="number"
                className="form__field"
                placeholder="Stok"
                name="pStock"
                id="pStock"
                ref={pStockRef}
                required
              />
              <label htmlFor="pStock" className="form__label">
                Ürünün Mevcut Stoğu
              </label>
            </div>
            <motion.button
              className="button-EditP"
              variants={buttonVar}
              initial="init"
              whileHover="hover"
            >
              Kaydet
            </motion.button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </PageTemplate>
  );
};

export default EditProduct;
