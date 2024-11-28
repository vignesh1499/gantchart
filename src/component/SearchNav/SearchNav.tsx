import React, { useEffect, useRef, useState } from "react";
import {
  Navbar,
  Nav,
  Dropdown,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setTrue } from "../../redux/slices/FormSlice";
import { BsPlus, BsSearch } from "react-icons/bs";
import { AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";

const SearchNav: React.FC = () => {
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");
  const displayName = localStorage.getItem("displayName");
  const email = localStorage.getItem("email");
  const photoURL = localStorage.getItem("photoURL");

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        console.log("Imported CSV content: ", text); // Process CSV data
      };
      reader.readAsText(file);
    }
  };

  // Handle file export
  const handleFileExport = () => {
    const data = [
      { name: "John Doe", age: 28 },
      { name: "Jane Smith", age: 32 },
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [["Name", "Age"], ...data.map((item) => [item.name, item.age])]
        .map((row) => row.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    link.click();
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("Search Query: ", e.target.value); // Filter or search logic here
  };

  // Handle Logout
  const handleLogout = () => {
    console.log("User logged out."); // Add logout functionality here
    localStorage.clear(); // Remove token from localStorage
    navigate("/"); // Redirect to login page
  };

  return (
    <Navbar
      bg="transparent"
      expand="lg"
      className="px-3"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Flex container to align project name and profile dropdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "0px 15px 0px 0px",
        }}
      >
        {/* Left Section: Project Name */}
        <Navbar.Brand className="fw-bold fs-4">Project</Navbar.Brand>

        {/* Right Section: Profile Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-secondary"
            id="profile-dropdown"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "5px 12px",
              borderRadius: "12px",
            }}
          >
            <img
              // src={photoURL as string}
              src="https://lh3.googleusercontent.com/a/ACg8ocIi7q67jYg7TIFWjJplJ_LeLbtj9CD3Uss8KyX43fejSEfwa1EO=s96-c"
              alt="User Avatar"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
              }}
            />
            <span>{displayName}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div style={{ width: "100%" }}>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* Middle Section */}
          <Nav className="me-auto d-flex align-items-center">
            {/* New Task Button */}
            <Button
              variant="primary"
              className="me-3"
              onClick={() => dispatch(setTrue())}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                padding: "5px 12px",
              }}
            >
              <BsPlus size={21} />
              <span>New Task</span>
            </Button>

            {/* Import/Export Dropdown */}
            <Dropdown className="me-3">
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{ borderRadius: "12px", padding: "5px 12px" }}
              >
                Import/Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as="label" htmlFor="file-upload">
                  Import CSV
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    id="file-upload"
                    style={{ display: "none" }}
                    onChange={handleFileImport}
                  />
                </Dropdown.Item>
                <Dropdown.Item onClick={handleFileExport}>
                  Export CSV
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Auto Schedule Adjustment Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                border: "1px solid #A8A8A8",
                borderRadius: "12px",
                padding: "5px 12px",
                height: "40px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Auto Schedule Adjustment
              </span>
              <Form.Check
                type="switch"
                id="auto-schedule-switch"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
                style={{ margin: 0, transform: "scale(1.2)" }}
              />
            </div>
          </Nav>

          {/* Right Section */}
          <Nav className="ms-auto d-flex align-items-center">
            {/* Search Bar */}
            <Form
              className="d-flex me-3"
              style={{
                position: "relative",
                borderRadius: "12px",
                border: "1px solid #ccc",
                padding: "5px 10px",
                width: "300px",
              }}
            >
              <BsSearch
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#888",
                  fontSize: "16px",
                }}
              />
              <FormControl
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  border: "none",
                  outline: "none",
                  paddingLeft: "30px",
                  background: "transparent",
                  fontSize: "14px",
                }}
              />
            </Form>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default SearchNav;
