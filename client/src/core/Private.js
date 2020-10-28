import React, { useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Layout from "../core/Layout";
import { isAuth, getCookie, signOut, updateProfile } from "../helper/helper";

const Private = ({ history }) => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    buttonText: "Submit",
  });

  const { name, email, password, role, buttonText } = values;

  const token = getCookie("token");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/user/${isAuth()._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Private Profile Update", response);
        const { name, role, email } = response.data;
        setValues({ ...values, role, name, email });
      })
      .catch((error) => {
        console.log("Private Profile Update Error", error.response.data.error);
        if (error.response.status === 401) {
          signOut(() => {
            history.push("/");
          });
        }
      });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/user/update`,
      data: { name, password },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("PRIVATE PROFILE UPDATE SUCCESS", response);
        updateProfile(response, () => {
          setValues({
            ...values,
            buttonText: "Submitted",
          });
          toast.success("Profile Updated Succesfully");
        });
      })
      .catch((error) => {
        console.log("PRIVATE PROFILE UPDATE ERROR", error.response.data);

        setValues({ ...values, buttonText: "Submit" });
        toast.error(error.response.data.error);
      });
  };

  const updateForm = () => (
    <form>
      <div className="form-group">
        <label htmlFor="name" className="text-muted">
          name
        </label>
        <input
          onChange={handleChange("name")}
          value={name}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="role" className="text-muted">
          role
        </label>
        <input
          defaultValue={role}
          type="text"
          readOnly
          className="form-control-plaintext"
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="text-muted">
          email
        </label>
        <input
          defaultValue={email}
          type="email"
          readOnly
          className="form-control-plaintext"
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="text-muted">
          password
        </label>
        <input
          onChange={handleChange("password")}
          value={password}
          type="password"
          className="form-control"
        />
      </div>

      <div>
        <button onClick={clickSubmit} className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );
  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        <h1 className="pt-5 text-center">Update Profile</h1>
        <p className="text-center">User Page</p>
        {updateForm()}
      </div>
    </Layout>
  );
};

export default Private;
