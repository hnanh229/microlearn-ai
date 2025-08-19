import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-light text-dark mt-auto pt-4 border-top">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>About</h5>
            <p>MicroLearn is your platform for microlearning and knowledge sharing.</p>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><a onClick={() => navigate('/dashboard')} className="text-dark" style={{ cursor: 'pointer' }}>Dashboard</a></li>
              <li><a onClick={() => navigate('/about')} className="text-dark" style={{ cursor: 'pointer' }}>About</a></li>
              <li><a onClick={() => navigate('/contact')} className="text-dark" style={{ cursor: 'pointer' }}>Contact</a></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Contact</h5>
            <p>Email: info@microlearn.com<br />Phone: +1 234 567 890</p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-2 border-top">
            &copy; {new Date().getFullYear()} MicroLearn. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
