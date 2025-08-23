import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Image, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import eventBus from '../../utils/eventBus';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Function to load user data from localStorage
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    };

    // Load user data immediately
    loadUserData();

    // Event handler for profile updates
    const handleProfileUpdate = (updatedUser) => {
      console.log('Profile updated, refreshing header', updatedUser);
      setUser(updatedUser);
    };

    // Subscribe to profile update events
    eventBus.subscribe('userProfileUpdated', handleProfileUpdate);

    // Clean up
    return () => {
      eventBus.unsubscribe('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    // Clear user session (example: localStorage)
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>MicroLearn</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => navigate('/summary')}
              className={isActive('/summary')}
            >
              Summary
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate('/create-quiz')}
              className={isActive('/create-quiz')}
            >
              Create Quiz
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate('/dashboard')}
              className={isActive('/dashboard')}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate('/contact')}
              className={isActive('/contact')}
            >
              Contact
            </Nav.Link>
          </Nav>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="dropdown-avatar"
              className="d-flex align-items-center user-dropdown-toggle"
              style={{
                border: 'none',
                background: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '2rem',
                cursor: 'pointer',
              }}
            >
              <Image
                src={`${user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || 'User')}&background=random`}${user?.avatar ? `?${Date.now()}` : ''}`}
                roundedCircle
                width={36}
                height={36}
                alt="avatar"
                className="avatar-image"
              />
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="username-tooltip">{user?.name || user?.username || 'User'}</Tooltip>}
              >
                <span className="username-text">
                  {user?.name || user?.username || 'User'}
                </span>
              </OverlayTrigger>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate('/profile')}>
                <i className="fas fa-user me-2"></i> Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/change-password')}>
                <i className="fas fa-key me-2"></i> Change Password
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="fas fa-sign-out-alt me-2"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
