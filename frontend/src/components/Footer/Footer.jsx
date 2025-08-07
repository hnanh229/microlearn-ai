import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
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
              <li><a href="/dashboard" className="text-dark">Dashboard</a></li>
              <li><a href="/about" className="text-dark">About</a></li>
              <li><a href="/contact" className="text-dark">Contact</a></li>
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
