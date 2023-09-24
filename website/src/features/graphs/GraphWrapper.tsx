import React from "react";

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function GraphWrapper({ children, title }: Props) {
  return (
    <div
      style={{
        borderRadius: "5px",
        padding: "0 10px",
        backgroundColor: "white",
        boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.3)",
        margin: "5px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>{title}</h2>
      {children}
    </div>
  );
}
