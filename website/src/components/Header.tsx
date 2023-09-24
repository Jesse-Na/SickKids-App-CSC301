import React, { useEffect } from "react";

import { Auth } from "aws-amplify";
import { Button, IconButton, Menu, MenuItem, Popover } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AccountCircle } from "@mui/icons-material";

type Props = {};

const navLinks = [
  {
    name: "Devices",
    path: "/",
  },
  {
    name: "Admins",
    path: "/admins",
  },
  {
    name: "Patients",
    path: "/patients",
  },
];

export default function Header({}: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [email, setEmail] = React.useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setEmail(user.attributes.email);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const signOut = () => {
    handleClose();
    Auth.signOut();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "50px",
        backgroundColor: "#1976d2",
        color: "white",
        display: "flex",
        boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
        marginBottom: "10px",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", paddingLeft: "60px" }}>
        {navLinks.map((link) => (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              paddingRight: "30px",
              cursor: "pointer",
              textDecoration: pathname === link.path ? "underline" : "none",
              color: pathname === link.path ? "white" : "#cfd8dc",
            }}
            onClick={() => navigate(link.path)}
          >
            {link.name}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          fontSize: "25px",
        }}
        onClick={() => navigate("/")}
      >
        PTS Dashboard
      </div>

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: "10px",
        }}
      >
        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Popover
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <div
              style={{
                padding: "10px",
              }}
            >
              {email}
            </div>
            <MenuItem onClick={signOut}>Sign Out</MenuItem>
          </Popover>
        </div>
      </div>
    </div>
  );
}
