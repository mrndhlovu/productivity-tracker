import React, { useState } from "react";

import { Menu, X } from "react-feather";

import NavigationBar from "./NavigationBar";

const NavBar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMenu = () => setShowMobileMenu(!showMobileMenu);

  return (
    <>
      <header className="nav__bar">
        <div className="logo">
          <h1 className="logo__text">Checklists</h1>
        </div>
        <div className="mobile__icon_container">
          {showMobileMenu ? (
            <X
              className="mobile__menu__icon"
              size={36}
              onClick={() => toggleMenu()}
            />
          ) : (
            <Menu
              className="mobile__menu__icon"
              size={36}
              onClick={() => toggleMenu()}
            />
          )}
        </div>
      </header>
      {showMobileMenu && (
        <NavigationBar
          className="mobile__menu"
          toggleMenu={toggleMenu}
          lists={[
            {
              title: "Life",
              id: 1,
            },
          ]}
        />
      )}
    </>
  );
};

export default NavBar;