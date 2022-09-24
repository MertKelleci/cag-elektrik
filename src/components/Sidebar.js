import { NavLink } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import { FaBars } from "react-icons/fa";
import { SidebarData as routes1 } from "./SidebarData";
import { LoginContext } from "../LoginContext";

const showAnimation = {
  hidden: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
  show: {
    opacity: 1,
    width: "auto",
    transition: {
      duration: 0.5,
    },
  },
};

const SideBar = ({ children }) => {
  const { currentUser, navbar } = useContext(LoginContext);
  const [routes, setRoutes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (currentUser) {
      setRoutes(routes1);
    } else {
      setRoutes([]);
    }
  }, [currentUser]);
  return (
    <>
      <div className="main-container">
        <motion.div
          animate={{
            width: isOpen ? "250px" : "45px",

            transition: {
              duration: 0.5,
              type: "spring",
              damping: 10,
            },
          }}
          className={`sidebar `}
        >
          <div
            className="top_section"
            style={navbar ? {} : { display: "none" }}
          >
            <AnimatePresence>
              {isOpen && (
                <NavLink
                  to="/"
                  style={{ textDecoration: "none", color: "#EEEEEE" }}
                >
                  <motion.h1
                    variants={showAnimation}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="logo"
                  >
                    Çağ_Elektrik
                  </motion.h1>
                </NavLink>
              )}
            </AnimatePresence>

            <div className="bars">
              <FaBars onClick={toggle} />
            </div>
          </div>
          <section className="routes" style={navbar ? {} : { display: "none" }}>
            {routes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <SidebarMenu
                    key={index}
                    route={route}
                    showAnimation={showAnimation}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                  />
                );
              }

              return (
                <NavLink
                  to={route.path}
                  key={index}
                  className="link"
                  activeclassname="active"
                >
                  <div className="icon">{route.icon}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="link_text"
                      >
                        {route.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </section>
        </motion.div>

        <main style={{ width: "100%" }}>{children}</main>
      </div>
    </>
  );
};

export default SideBar;
