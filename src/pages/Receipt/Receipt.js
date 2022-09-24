import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginContext } from "../../LoginContext";
import "./Receipt.scss";
const { ipcRenderer } = window.require("electron");

const Receipt = () => {
  const { currentUser, setNavbar } = useContext(LoginContext);
  const time = new Date();
  // const navigate = useNavigate();
  const location = useLocation();
  const { cart, info } = location.state;
  const now = `${time.getDate()}.${
    time.getMonth() + 1
  }.${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}`;

  // useEffect(() => {
  //   setNavbar(false);
  //   ipcRenderer.send("printPage");
  // }, []);

  // ipcRenderer.on("printPage:done", () => {
  //   setNavbar(true);
  //   navigate("/sale");
  // });

  useEffect(() => {
    console.log(info);
    // setNavbar(false);
    // ipcRenderer.send("createPdf");
  }, []);

  // ipcRenderer.on("createPdf:done", () => {
  //   // setNavbar(true);
  //   // navigate("/sale");
  // });

  return (
    <div className="page">
      <div className="page-header">
        <div className="cells">
          <p>
            <b>Tarih:</b> {now}
          </p>
          <p>
            <b>Teklif Veren:</b> {currentUser.name}
          </p>
          <p>
            <b>Teklif Veren İmza:</b>
          </p>
        </div>
        <div className="cells">
          <p>
            <b>Satın Alan Firma: </b> {info.company}
          </p>
          <p>
            <b>Satın Alan Personel: </b> {info.buyer}
          </p>
          <p>
            <b>Personel İmza:</b>
          </p>
        </div>
        <div>
          <img
            src={process.env.PUBLIC_URL + "cag_elektrik.jpeg"}
            alt="Çağ Elektrik Logo"
          />
        </div>
      </div>
      <div className="page-items">
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
                <tr>
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
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>Toplam Tutar:</td>
              <td>{info.total}₺</td>
            </tr>
            <tr>
              <td>Ödenen Tutar:</td>
              <td>{info.payment}₺</td>
            </tr>
            <tr>
              <td>Kalan:</td>
              <td>{info.total - info.payment}₺</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipt;
