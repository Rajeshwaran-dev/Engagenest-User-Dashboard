import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Spinner = ({
  size = "medium",
  overlay = false,
  centered = true,
  text = "",
}) => {
  const sizeStyles = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 },
  };

  const lottieContent = (
    <div className={centered ? "loading-center" : "loading-spinner"}>
      <DotLottieReact
        src="https://lottie.host/4c38cc20-dbed-457a-8178-f5c2566b5d46/M54aP0PgKD.lottie"
        loop
        autoplay

        speed="2"
        style={sizeStyles[size]}
      />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );

  if (overlay) {
    return <div className="loading-overlay">{lottieContent}</div>;
  }

  return lottieContent;
};

export default Spinner;
