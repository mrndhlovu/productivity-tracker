import React, { useState } from "react";
import { Redirect, useLocation } from "react-router-dom";

import { useMainContent } from "../../utils/hookUtils";
import CreateItemWrapper from "../shared/CreateItemWrapper";
import UIInput from "../shared/UIInput";

const INITIAL_STATE = {
  email: undefined,
  password: undefined,
  firstName: undefined,
  lastName: undefined,
};

const Register = () => {
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/" } };

  const {
    registrationHandler,
    auth: { authenticated },
  } = useMainContent();

  const [credentials, setCredentials] = useState(INITIAL_STATE);

  const handleChange = (field, e) => {
    setCredentials({ ...credentials, [field]: e.target.value });
  };

  if (authenticated) return <Redirect to={from.pathname} />;

  return (
    <CreateItemWrapper
      header="Register"
      clickHandler={() => registrationHandler(credentials)}
      buttonText="Register"
    >
      <div className="setting__registration__container">
        <div>
          <UIInput
            id="outlined-search"
            label="First Name"
            type="text"
            handleChange={(e) => handleChange("lastName", e)}
          />
          <UIInput
            id="outlined-search"
            label="Last Name"
            type="text"
            handleChange={(e) => handleChange("firstName", e)}
          />
        </div>
        <div>
          <UIInput
            id="outlined-search"
            label="Email Address"
            type="email"
            handleChange={(e) => handleChange("email", e)}
          />

          <UIInput
            id="outlined-search"
            label="Password"
            type="password"
            handleChange={(e) => handleChange("password", e)}
          />
        </div>
      </div>
    </CreateItemWrapper>
  );
};

export default Register;