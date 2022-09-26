const { BrowserWindow, app, ipcMain, Tray } = require("electron");
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
    autoHideMenuBar: true,
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

ipcMain.handle("addItem", async (e, data) => {
  const { item, dest } = data;
  const message = await addItem(item, dest);
  return message;
});

ipcMain.handle("getCompInfo", async (e, data) => {
  const discount = await getDiscount(data.brandID);
  return discount;
});

ipcMain.handle("paginatedQuery", async (e, data) => {
  const { collectionName, lastdoc, sender } = data;
  let items = await paginatedQuery(collectionName, lastdoc);
  return items;
});

ipcMain.handle("querybyParimeter", async (e, data) => {
  let items = await querybyParameter(data.searchValue, data.sender);
  return items;
});

ipcMain.handle("updateItem", async (e, data) => {
  const message = await updateItem(data.item, data.id, data.collectionName);
  return message;
});

ipcMain.handle("deleteItem", async (e, data) => {
  let message = await deleteItem(data.itemID, data.collectionName);
  return message;
});

ipcMain.handle("dropdown", async () => {
  const comps = await getSnapshot({ collectionName: "brands" });
  let dropdown = [];
  comps.forEach((comp) => {
    dropdown.push({
      value: comp.id,
      label: comp.name,
    });
  });
  return dropdown;
});

ipcMain.handle("login", async (e, data) => {
  const { email, password } = data;
  const user = await login(email, password);
  return user;
});

ipcMain.handle("logout", async () => {
  const message = await logout();
  return message;
});

ipcMain.handle("create-receipt", async (e, data) => {
  const message = await addReceipt(data);
  return message;
});

ipcMain.handle("searchWithDates", async (e, data) => {
  const { fDate, lDate } = data;
  const list = await searchWithDates(fDate, lDate);
  return list;
});
