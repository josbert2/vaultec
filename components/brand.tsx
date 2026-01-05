import React from "react";
import { Logo } from "./logo";

const Brand = () => {
  return (
    <div className="flex items-center gap-2">
      <Logo size={32} />
      <h1 className="font-extrabold text-xl tracking-wide uppercase">
        Passweird
      </h1>
    </div>
  );
};

export default Brand;
