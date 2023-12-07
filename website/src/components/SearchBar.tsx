import { Search } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";

type Props = {
  value: string;
  setValue: (value: string) => void;
};

export default function SearchBar({ value, setValue }: Props) {
  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      id="input-with-icon-textfield"
      placeholder="Search..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      variant="standard"
    />
  );
}
