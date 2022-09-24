const { BrowserWindow, app, ipcMain } = require("electron");
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
} = require("electron-devtools-installer");
const path = require("path");
const fs = require("fs");

const {
  getSnapshot,
  addItem,
  paginatedQuery,
  getDiscount,
  querybyParameter,
  updateItem,
  deleteItem,
  login,
  logout,
  addReceipt,
  searchWithDates,
} = require("../src/backend/Firebase");

let mainWindow;

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));
});

function createWindow() {
  mainWindow = new BrowserWindow({
    minHeight: 800,
    minWidth: 1280,
    icon: `${__dirname}/icon.ico`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.maximize();
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("addItem", async (e, data) => {
  const { item, dest } = data;
  const message = await addItem(item, dest);
  mainWindow.webContents.send("addItem:message", { message });
});

ipcMain.on("getCompInfo", async (e, data) => {
  const discount = await getDiscount(data.brandID);
  mainWindow.webContents.send(`getCompInfo:done:${data.serial}`, { discount });
});

ipcMain.on("paginatedQuery", async (e, data) => {
  const { collectionName, lastdoc, sender } = data;
  let items = await paginatedQuery(collectionName, lastdoc);
  mainWindow.webContents.send(`paginatedQuery:done-${sender}`, { items });
});

ipcMain.on("querybyParimeter", async (e, data) => {
  let items = await querybyParameter(data.searchValue);
  mainWindow.webContents.send("querybyParimeter:done", { items });
});

ipcMain.on("updateItem", async (e, data) => {
  const message = await updateItem(data.item, data.id, data.collectionName);
  mainWindow.webContents.send("updateItem:done", { message });
});

ipcMain.on("deleteItem", async (e, data) => {
  let message = await deleteItem(data.itemID, data.collectionName);
  mainWindow.webContents.send("deleteItem:done", { message });
});

ipcMain.on("dropdown", async () => {
  const comps = await getSnapshot({ collectionName: "brands" });
  let dropdown = [];
  comps.forEach((comp) => {
    dropdown.push({
      value: comp.id,
      label: comp.name,
    });
  });
  mainWindow.webContents.send("dropdown:ready", { dropdown });
});

ipcMain.on("login", async (e, data) => {
  console.log("login çağırıldı: " + e);
  const { email, password } = data;
  const user = await login(email, password);
  mainWindow.webContents.send("login:done", user);
});

ipcMain.on("logout", async () => {
  const message = await logout();
  mainWindow.webContents.send("logout:done", { message });
});

ipcMain.on("create-receipt", async (e, data) => {
  const message = await addReceipt(data);
  mainWindow.webContents.send("create-receipt:done", { message });
});

ipcMain.on("searchWithDates", async (e, data) => {
  const { fDate, lDate } = data;
  const list = await searchWithDates(fDate, lDate);
  mainWindow.webContents.send("searchWithDates:done", { list });
});

const Receipt = () => {
  const Receipt = (info, cart, currentUser) => {
    const time = new Date();
    const now = `${time.getDate()}.${
      time.getMonth() + 1
    }.${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}`;

    let list = "";
    console.log(info);
    console.log(cart);
    console.log(currentUser);
    cart.forEach((item) => {
      const { name, serial, initPrice, disc, soldPrice, amount, totalPrice } =
        item;
      list += `<tr>
        <td>${name}</td>
        <td>${serial}</td>
        <td>
          ${initPrice}₺ {" -> "} ${soldPrice}₺
        </td>
        <td>${disc}</td>
        <td>${amount}</td>
        <td>${totalPrice.toFixed(2)}</td>
      </tr>`;
    });

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PDF Result Template</title>
    <style>
      .invoice-box {
        max-width: 800px;
        margin: auto;
        padding: 30px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        font-size: 16px;
        line-height: 24px;
        font-family: "Helvetica Neue", "Helvetica";
        color: #555;
      }
      .margin-top {
        margin-top: 50px;
      }
      .justify-center {
        text-align: center;
      }
      .invoice-box table {
        width: 100%;
        line-height: inherit;
        text-align: left;
      }
      .invoice-box table td {
        padding: 5px;
        vertical-align: top;
      }
      .invoice-box table tr td:nth-child(2) {
        text-align: right;
      }
      .invoice-box table tr.top table td {
        padding-bottom: 20px;
      }
      .tab{
        margin-right: 40px;
      }
      .invoice-box table tr.top table td.title {
        font-size: 45px;
        line-height: 45px;
        color: #333;
      }
      .invoice-box table tr.information table td {
        padding-bottom: 40px;
      }
      .invoice-box table tr.heading td {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
      }
      .invoice-box table tr.details td {
        padding-bottom: 20px;
      }
      .invoice-box table tr.item td {
        border-bottom: 1px solid #eee;
      }
      .invoice-box table tr.item.last td {
        border-bottom: none;
      }
      .invoice-box table tr.total td:nth-child(2) {
        border-top: 2px solid #eee;
        font-weight: bold;
      }
      @media only screen and (max-width: 600px) {
        .invoice-box table tr.top table td {
          width: 100%;
          display: block;
          text-align: center;
        }
        .invoice-box table tr.information table td {
          width: 100%;
          display: block;
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-box">
      <table cellpadding="0" cellspacing="0">
        <tr class="top">
          <td colspan="2">
            <table>
              <tr>
                <td class="title">
                  <img
                    src={process.env.PUBLIC_URL + "cag_elektrik.jpeg"}
                    style="width: 100%; max-width: 156px"
                  />
                </td>
                <td>Tarih: ${now}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="information">
          <td colspan="2">
            <table>
              <tr>
                <td>
                  Satın Alan Firma: ${info.company}<br />Satın Alan Personel: ${
      info.buyer
    }<br />
                  İmza:
                </td>
                <td>
                  Satıcı İsmi: ${currentUser.name} <br />
                  <p class="tab">İmza:</p> 
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="heading">
          <td>İsim:</td>
          <td>Kod:</td>
          <td>Fiyat:</td>
          <td>İskonto:</td>
          <td>Adet:</td>
          <td>Tutar:</td>
        </tr>
        ${list}
      </table>
      <br />
      <h1 class="justify-center">
        Toplam Tutar: ${info.total}₺ <br />
        Yapılan Ödeme: ${info.payment}₺
        <hr />
        Kalan Tutar: ${info.total - info.payment}₺ 
      </h1>
    </div>
  </body>
</html>
`;
  };
};
