import React, { useEffect, useRef, useState } from "react";
import PageTemplate from "../PageTemplate";
import SetCompany from "../../components/SetCompany";
import "./EditCompany.scss";
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

const EditCompany = () => {
  const [lastdoc, setLastdoc] = useState(null);
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [itemID, setitemID] = useState("");
  const [flagItem, setflagItem] = useState(null);
  const cNameRef = useRef(null);
  const cSerialRef = useRef(null);
  const cDiscRef = useRef(null);

  useEffect(() => {
    ipcRenderer
      .invoke("paginatedQuery", {
        collectionName: "brands",
        lastdoc: lastdoc,
      })
      .then((items) => {
        if (!items.empty) {
          setList([...list, ...items]);
        }
        setLoaded(true);
      });
  }, [lastdoc]);

  useEffect(() => {
    if (flagItem != null) {
      ipcRenderer
        .invoke("updateItem", {
          item: flagItem,
          id: itemID,
          collectionName: "brands",
        })
        .then((message) => {
          toast(message);
        });
    }
  }, [flagItem]);

  useEffect(() => {
    if (selected !== null) {
      setitemID(selected.id);
      cNameRef.current.value = selected?.name;
      cSerialRef.current.value = selected?.serial;
      cDiscRef.current.value = selected?.discount;
    }
  }, [selected]);

  const handleScroll = (event) => {
    let triggerHeight =
      event.currentTarget.scrollTop + event.currentTarget.offsetHeight;

    if (triggerHeight >= (event.currentTarget.scrollHeight * 7) / 10) {
      setLastdoc(list[list.length - 1]);
    }
  };

  const refreshPage = () => {
    setList([]);
    setLastdoc(lastdoc ? null : {});
  };

  const handleSearch = (event) => {
    if (event.target.value.length > 0) {
      ipcRenderer
        .invoke("querybyParimeter", {
          searchValue: event.target.value.toUpperCase(),
          sender: "EditCompany",
        })
        .then((items) => {
          setList(items);
        });
    } else {
      refreshPage();
    }
  };

  const handleDelete = (item) => {
    ipcRenderer
      .invoke("deleteItem", { item: item, collectionName: "brands" })
      .then((message) => {
        toast(message);
        refreshPage();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setflagItem({
      serial: event.target.cSerial.value,
      name: event.target.cName.value.toUpperCase(),
      discount: event.target.cDisc.value,
    });

    refreshPage();
    event.target.cSerial.value = "";
    event.target.cName.value = "";
    event.target.cDisc.value = 0;
  };

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
              <th>Adı</th>
              <th>Kodu</th>
              <th>İskontosu</th>
              <th>Düzenle</th>
              <th>Sil</th>
            </tr>
          </thead>
          <tbody>
            {loaded &&
              list.map((item, index) => {
                return (
                  <SetCompany
                    item={item}
                    key={index}
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
          <div className="form__group field">
            <input
              type="text"
              className="form__field"
              placeholder="İsim"
              name="cName"
              id="cName"
              ref={cNameRef}
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
              name="cSerial"
              id="cSerial"
              ref={cSerialRef}
              required
            />
            <label htmlFor="cSerial" className="form__label">
              Firma Kodu
            </label>
          </div>
          <div className="form__group field">
            <input
              type="number"
              step="0.01"
              className="form__field"
              placeholder="İsim"
              name="cDisc"
              id="cDisc"
              ref={cDiscRef}
              required
            />
            <label htmlFor="cDisc" className="form__label">
              Firma İskontosu
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
        </form>
      </div>
      <ToastContainer />
    </PageTemplate>
  );
};

export default EditCompany;
