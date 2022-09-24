import React from "react";
import * as MdIcons from "react-icons/md";
// import * as GrIcons from "react-icons/gr";
import * as IoIcons from "react-icons/io";
import { RiFileSettingsFill, RiFolderSettingsFill } from "react-icons/ri";

export const SidebarData = [
  {
    path: "#",
    name: "Yeni",
    icon: <IoIcons.IoIosAddCircle />,
    subRoutes: [
      {
        path: "/new/company",
        name: "Yeni Marka",
        icon: <MdIcons.MdAddBusiness />,
      },
      {
        path: "/new/product",
        name: "Yeni Ürün",
        icon: <MdIcons.MdOutlineAddChart />,
      },
    ],
  },
  {
    path: "/sale",
    name: "Satış",
    icon: <MdIcons.MdAddShoppingCart />,
  },
  {
    path: "#",
    name: "Düzenle",
    icon: <IoIcons.IoMdSettings />,
    subRoutes: [
      {
        path: "/edit/product",
        name: "Ürün Düzenle/Sil",
        icon: <RiFileSettingsFill />,
      },
      {
        path: "/edit/company",
        name: "Marka Düzenle/Sil",
        icon: <RiFolderSettingsFill />,
      },
    ],
  },
  {
    path: "/receipts",
    name: "Fiş",
    icon: <MdIcons.MdReceiptLong />,
  },
];
