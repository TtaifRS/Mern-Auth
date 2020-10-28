import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Layout from "../core/Layout";

const ResetPassWord = ({ match }) => {
  const [values, setValues] = useState({
    name: "",
    newPassword: "",
    token: "",
    buttonText: "Reset Password",
  });

  useEffect(() => {
    let token = match.params.token;
    let { name } = jwt.decode(token);
    console.log(name);
    if (token) {
      setValues({ ...values, name, token });
    }
  }, []);

  const { name, newPassword, token, buttonText } = values;

  const handleChange = (event) => {
    setValues({ ...values, newPassword: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/reset-password`,
      data: { newPassword, resetPasswordLink: token },
    })
      .then((response) => {
        console.log("RESET PASSWORD REQUEST SUCCESS", response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: "Done" });
      })
      .catch((error) => {
        console.log("RESET PASSWORD ERROR", error.response.data);
        setValues({ ...values, buttonText: "Forget Password" });
        toast.error(error.response.data.error);
      });
  };

  const ResetPasswordForm = () => (
    <form>
      <div className="form-group">
        <label htmlFor="password" className="text-muted">
          password
        </label>
        <input
          onChange={handleChange}
          value={newPassword}
          type="password"
          className="form-control"
          placeholder="Type new password"
          required
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
        <h3 className="p-5 text-center">
          Hey {name}, type your new password...
        </h3>
        {ResetPasswordForm()}
      </div>
    </Layout>
  );
};

export default ResetPassWord;
