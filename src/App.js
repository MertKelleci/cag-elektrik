import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import NewCompany from "./pages/NewCompany/NewCompany";
import NewProduct from "./pages/NewProduct/NewProduct";
import MainPage from "./pages/MainPage";
import Sales from "./pages/Sales/Sales";
import Finalize from "./pages/Sales/Finalize";
import EditProduct from "./pages/EditProduct/EditProduct";
import EditCompany from "./pages/EditCompany/EditCompany";
import Receipts from "./pages/Receipts/Receipts";
import { LoginContext } from "./LoginContext";
import { useState } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [navbar, setNavbar] = useState(true);
  return (
    <HashRouter>
      <LoginContext.Provider
        value={{ currentUser, setCurrentUser, navbar, setNavbar }}
      >
        <Sidebar>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="new/product" element={<NewProduct />} />
            <Route path="new/company" element={<NewCompany />} />
            <Route path="sale" element={<Sales />} />
            <Route path="sale/finalize" element={<Finalize />} />
            <Route path="edit/product" element={<EditProduct />} />
            <Route path="edit/company" element={<EditCompany />} />
            <Route path="receipts" element={<Receipts />} />
          </Routes>
        </Sidebar>
      </LoginContext.Provider>
    </HashRouter>
  );
}

export default App;
