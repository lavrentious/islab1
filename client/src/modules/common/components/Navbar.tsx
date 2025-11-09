import * as React from "react";
import { Navbar as BootstrapNavbar, Container, Nav } from "react-bootstrap";
import { FaCar, FaCog, FaFileImport, FaHome } from "react-icons/fa";
import { TbPrison as Logo } from "react-icons/tb";
import { Link } from "react-router";
import VersionsStatus from "./VersionsStatus";

const Navbar: React.FunctionComponent = () => {
  return (
    <BootstrapNavbar
      id="navbar"
      expand="lg"
      variant="light"
      bg="light"
      sticky="top"
    >
      <Container>
        <Nav.Link as={Link} to="/">
          <BootstrapNavbar.Brand>
            <Logo style={{ fontSize: "2.5rem", verticalAlign: "middle" }} />
          </BootstrapNavbar.Brand>
          {/* <BootstrapNavbar.Brand className="d-flex flex-nowrap align-items-center"> */}
        </Nav.Link>
        <BootstrapNavbar.Toggle>
          <span className="navbar-toggler-icon" />
        </BootstrapNavbar.Toggle>

        <BootstrapNavbar.Collapse>
          <Nav className="d-flex justify-content-between flex-row w-100">
            <div className="d-flex flex-wrap">
              <Nav.Link as={Link} to="/">
                <FaHome className="me-2" />
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/cars">
                <FaCar className="me-2" />
                Cars
              </Nav.Link>
              <Nav.Link as={Link} to="/imports">
                <FaFileImport className="me-2" />
                Imports
              </Nav.Link>
              <Nav.Link as={Link} to="/settings">
                <FaCog className="me-2" />
                Settings
              </Nav.Link>
            </div>
            <div className="d-flex flex-wrap my-auto">
              <VersionsStatus />
            </div>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
