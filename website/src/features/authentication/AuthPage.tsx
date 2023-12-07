import React from "react";

type Props = {
  title: string;
  children: React.ReactNode[];
};

export default function AuthPage({ title, children }: Props) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          padding: "20px",
          paddingRight: "40px",
          paddingLeft: "40px",
          borderRadius: "10px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>{title}</h1>
        <div
          style={{
            marginTop: "20px",
            width: "300px",
          }}
        >
          {children.map((child, index) => {
            return (
              <div key={index} style={{ marginBottom: "20px" }}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
