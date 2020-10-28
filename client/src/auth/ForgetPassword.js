import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Layout from "../core/Layout";

const ForgetPassword = ({ history }) => {
  const [values, setValues] = useState({
    email: "",
    buttonText: "Forget Password",
  });

  const { email, buttonText } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/forget-password`,
      data: { email },
    })
      .then((response) => {
        console.log("FORGET PASSWORD REQUEST SUCCESS", response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: "Requested" });
      })
      .catch((error) => {
        console.log("FORGET PASSWORD ERROR", error.response.data);
        setValues({ ...values, buttonText: "Try Again" });
        toast.error(error.response.data.error);
      });
  };

  const ForgetPasswordForm = () => (
    <form>
      <div className="form-group">
        <label htmlFor="email" className="text-muted">
          email
        </label>
        <input
          onChange={handleChange("email")}
          value={email}
          type="email"
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
        <h1 className="p-5 text-center">Forget Password</h1>
        {ForgetPasswordForm()}
      </div>
    </Layout>
  );
};

export default ForgetPassword;
