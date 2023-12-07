import { Fragment } from "react";

type Props = {
  message: string | null;
};

export default function ErrorMessage({ message }: Props) {
  if (!message) return <Fragment />;
  return (
    <div style={{ textAlign: "center", width: "100%", color: "#f55" }}>
      {message}
    </div>
  );
}
