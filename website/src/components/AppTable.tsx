import React, { ReactNode, useMemo } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchBar from "./SearchBar";

type Column<T> = {
  id: keyof T;
  title: string;
};

type Props<T> = {
  rows: T[];
  filterSearch: (row: T, search: string) => boolean;
  columns: Column<T>[];
  title: string;
  onRowClick: (row: T) => void;
};

export default function AppTable<T>({
  rows,
  filterSearch,
  columns,
  title,
  onRowClick,
}: Props<T>) {
  const [search, setSearch] = React.useState<string>("");
  const shownRows = useMemo(() => {
    return rows.filter((rows) => {
      return filterSearch(rows, search);
    });
  }, [rows, search]);
  return (
    <div>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          marginLeft: "auto",
          marginRight: "auto",
          minWidth: "600px",
        }}
      >
        <div style={{ display: "flex", position: "relative" }}>
          <h2 style={{ paddingLeft: "20px" }}>{title}</h2>
          <div
            style={{
              position: "absolute",
              width: "100%",
              top: "20px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <SearchBar value={search} setValue={setSearch} />
          </div>
        </div>
        <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow style={{ backgroundColor: "#ddd" }}>
              {columns.map((column) => (
                <TableCell style={{ fontWeight: "bold" }}>
                  {column.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shownRows.map((row, i) => (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => onRowClick(row)}
              >
                {columns.map((column) => (
                  <TableCell>{row[column.id] as ReactNode}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
