import React from 'react';
import { Navbar, Nav, Container, Dropdown, Image, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session (example: localStorage)
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/dashboard">MicroLearn</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/summary">Summary</Nav.Link>
            <Nav.Link href="/contact">Contact</Nav.Link>
          </Nav>
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="dropdown-avatar" style={{ border: 'none', background: 'none', padding: 0 }}>
              <Image src="https://ui-avatars.com/api/?name=U" roundedCircle width={36} height={36} alt="avatar" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/change-password')}>Change Password</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
