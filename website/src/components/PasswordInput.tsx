import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

type Props = {
  value: string;
  setValue: (value: string) => void;
  showRequirements?: boolean;
  label?: string;
};

const requirements = [
  {
    description: "8 characters minimum",
    regex: /.{8,}/,
  },
  {
    description: "At least one lowercase letter",
    regex: /[a-z]/,
  },
  {
    description: "At least one uppercase letter",
    regex: /[A-Z]/,
  },
  {
    description: "At least one number",
    regex: /[0-9]/,
  },
  {
    description: "At least one special character",
    regex: /[^A-Za-z0-9]/,
  },
];

export default function PasswordInput({
  value,
  setValue,
  showRequirements = false,
  label = "Password",
}: Props) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div>
      <TextField
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoCapitalize="none"
        variant="standard"
        fullWidth
        type={showPassword ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {showRequirements &&
        requirements.map((requirement, index) => (
          <div
            style={{
              color: requirement.regex.test(value) ? "green" : "red",
              fontSize: "0.8rem",
            }}
            key={index}
          >
            {requirement.description}
          </div>
        ))}
    </div>
  );
}
