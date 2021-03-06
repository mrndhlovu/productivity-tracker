/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import PropTypes from "prop-types";

import TextField from "@material-ui/core/TextField";

const UIInput = ({
  className = "input",
  defaultValue,
  handleChange,
  id = "ui-input",
  label,
  placeholder,
  type,
}) => (
  <div className="ui__input__container">
    {label && (
      <div className="ui__input__label__container">
        <label className="input__label">{label}</label>
      </div>
    )}
    <TextField
      className={`${className} ui__input`}
      id={id}
      type={type}
      onChange={handleChange}
      defaultValue={defaultValue}
      placeholder={placeholder}
      fullWidth
      label={label}
      InputLabelProps={{ opacity: 0, className: "label__input" }}
    />
  </div>
);

UIInput.defaultProps = {
  id: "ui-input",
  className: "input",
  defaultValue: "",
  placeholder: "",
};

UIInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

export default UIInput;
