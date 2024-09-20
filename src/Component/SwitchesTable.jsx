// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Pagination,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const SwitchesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSwitch, setNewSwitch] = useState({
    WifiName: "",
    SwitchLocation: "",
    SwitchName: "",
    SwitchPort: "",
    SwitchIPAddress: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentSwitchId, setCurrentSwitchId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/switches/");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSwitch({ ...newSwitch, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update existing switch
        const response = await fetch(
          `http://localhost:4000/api/switches/${currentSwitchId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newSwitch),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update switch");
        }

        const updatedSwitch = await response.json();
        setData((prevData) =>
          prevData.map((switchData) =>
            switchData._id === currentSwitchId ? updatedSwitch : switchData
          )
        );
      } else {
        // Add new switch
        const response = await fetch("http://localhost:4000/api/switches/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSwitch),
        });

        if (!response.ok) {
          throw new Error("Failed to add new switch");
        }

        const addedSwitch = await response.json();
        setData((prevData) => [...prevData, addedSwitch]);
      }

      // Reset form and state
      setNewSwitch({
        WifiName: "",
        SwitchLocation: "",
        SwitchName: "",
        SwitchPort: "",
        SwitchIPAddress: "",
      });
      setEditMode(false);
      setCurrentSwitchId(null);
    } catch (error) {
      setError(error);
    }
  };

  const handleEdit = (switchData) => {
    setNewSwitch(switchData);
    setEditMode(true);
    setCurrentSwitchId(switchData._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/switches/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete switch");
      }

      setData((prevData) =>
        prevData.filter((switchData) => switchData._id !== id)
      );
    } catch (error) {
      setError(error);
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    const value = event.target.value;
    setRowsPerPage(value === "All" ? filteredData.length : parseInt(value, 10));
    setPage(1); // Reset to the first page when changing rows per page
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when searching
  };

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (error)
    return (
      <Typography variant="h6" color="error">
        Error: {error.message}
      </Typography>
    );

  // Filter data based on search query for all fields
  const filteredData = data.filter((switchData) =>
    Object.values(switchData).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(startIndex, endIndex);

  return (
    <Box display="flex" flexDirection="column" gap={2} padding={2}>
      <Typography variant="h4" gutterBottom>
        Switches Data
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: "16px" }}
      />
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px" }}>
        <TextField
          label="WiFi Name"
          name="WifiName"
          value={newSwitch.WifiName}
          onChange={handleInputChange}
          required
        />
        <TextField
          label="Switch Location"
          name="SwitchLocation"
          value={newSwitch.SwitchLocation}
          onChange={handleInputChange}
          required
        />
        <TextField
          label="Switch Name"
          name="SwitchName"
          value={newSwitch.SwitchName}
          onChange={handleInputChange}
          required
        />
        <TextField
          label="Connected Port"
          name="SwitchPort"
          value={newSwitch.SwitchPort}
          onChange={handleInputChange}
        />
        <TextField
          label="Switch IP Address"
          name="SwitchIPAddress"
          value={newSwitch.SwitchIPAddress}
          onChange={handleInputChange}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          {editMode ? "Update" : "Add New"}
        </Button>
      </form>

      {/* Rows per page selection */}
      <FormControl
        variant="outlined"
        style={{ marginBottom: "16px", width: "120px" }}
      >
        <InputLabel>Rows per page</InputLabel>
        <Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          label="Rows per page"
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value="All">All</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Wifi Name</strong>
              </TableCell>
              <TableCell>
                <strong>Switch Location</strong>
              </TableCell>
              <TableCell>
                <strong>Switch Name</strong>
              </TableCell>
              <TableCell>
                <strong>Connected Port</strong>
              </TableCell>
              <TableCell>
                <strong>Switch IP Address</strong>
              </TableCell>
              <TableCell>
                <strong>Created At</strong>
              </TableCell>
              <TableCell>
                <strong>Updated At</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((switchData, index) => (
              <TableRow key={switchData._id}>
                <TableCell>{startIndex + index + 1}</TableCell>{" "}
                {/* Sequential ID */}
                <TableCell>{switchData.WifiName}</TableCell>
                <TableCell>{switchData.SwitchLocation}</TableCell>
                <TableCell>{switchData.SwitchName}</TableCell>
                <TableCell>{switchData.SwitchPort}</TableCell>
                <TableCell>{switchData.SwitchIPAddress}</TableCell>
                <TableCell>
                  {new Date(switchData.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(switchData.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(switchData)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(switchData._id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rowsPerPage !== "All" && (
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={page}
          onChange={handleChangePage}
          variant="outlined"
          shape="rounded"
        />
      )}
    </Box>
  );
};

export default SwitchesTable;
