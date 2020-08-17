import React from "react";
import PropTypes from "prop-types";

const UIHeader = ({ content, className = "content__header" }) => (
  <h1 className={`${className}`}>{content}</h1>
);

UIHeader.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default UIHeader;