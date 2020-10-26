import React, { Fragment } from "react";
import { Link } from "react-router-dom";

function Layout({ children }) {
  const nav = () => (
    <ui className="nav nav-tabs bg-primary">
      <li className="nav-item">
        <Link to="/" className="text-light nav-link">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/signup" className="text-light nav-link">
          Sign Up
        </Link>
      </li>
    </ui>
  );
  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
}

export default Layout;
