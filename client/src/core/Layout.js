import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signOut } from "../helper/helper";

function Layout({ children, match, history }) {
  const isActive = (path) => {
    if (match.path === path) {
      return { color: "#000" };
    } else {
      return { color: "#fff" };
    }
  };

  const nav = () => (
    <ui className="nav nav-tabs bg-primary">
      <li className="nav-item">
        <Link to="/" className=" nav-link" style={isActive("/")}>
          Home
        </Link>
      </li>
      {!isAuth() && (
        <Fragment>
          <li className="nav-item">
            <Link
              to="/signin"
              className=" nav-link"
              style={isActive("/signin")}
            >
              Sign In
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/signup"
              className=" nav-link"
              style={isActive("/signup")}
            >
              Sign Up
            </Link>
          </li>
        </Fragment>
      )}
      {isAuth() && (
        <li className="nav-item">
          <span className="nav-link">{isAuth().name}</span>
        </li>
      )}
      {isAuth() && (
        <li className="nav-item">
          <span
            className="nav-link"
            onClick={() => {
              signOut(() => history.push("/"));
            }}
            style={{ cursor: "pointer", color: "#fff" }}
          >
            Signout
          </span>
        </li>
      )}
    </ui>
  );
  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
}

export default withRouter(Layout);
