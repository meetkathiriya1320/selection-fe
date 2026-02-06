import React from "react";
import classNames from "classnames";
import "./Card.css";

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div className={classNames("card", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
