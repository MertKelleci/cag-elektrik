import React from "react";
import { motion } from "framer-motion";
import "./PageTemplate.scss";

const cardVariants = {
  hovered: {
    scale: 1.2,
    boxShadow: "10px 10px 8px rgb(24, 24, 24)",
  },
};

const PageTemplate = ({ children }) => {
  return (
    <div className="pageBody">
      <motion.div
        className="backgroundCard"
        variants={cardVariants}
        whileHover="hovered"
      >
        <main style={{ width: "100%" }}>{children}</main>
      </motion.div>
    </div>
  );
};

export default PageTemplate;
