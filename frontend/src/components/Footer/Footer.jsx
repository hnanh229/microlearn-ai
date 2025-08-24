import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer>
      <Container>
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5>About MicroLearn</h5>
            <p>MicroLearn is your platform for microlearning and knowledge sharing. We help you learn efficiently with bite-sized content designed for busy professionals and students.</p>
            <div className="social-links">
              <a href="#!" aria-label="Facebook"><FaFacebook /></a>
              <a href="#!" aria-label="Twitter"><FaTwitter /></a>
              <a href="#!" aria-label="Instagram"><FaInstagram /></a>
              <a href="#!" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </Col>
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Dashboard</a></li>
              <li><a onClick={() => navigate('/create-quiz')} style={{ cursor: 'pointer' }}>Create Quiz</a></li>
              <li><a onClick={() => navigate('/about')} style={{ cursor: 'pointer' }}>About Us</a></li>
              <li><a onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact</a></li>
            </ul>
          </Col>
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5>Resources</h5>
            <ul className="list-unstyled">
              <li><a onClick={() => navigate('/faq')} style={{ cursor: 'pointer' }}>FAQ</a></li>
              <li><a onClick={() => navigate('/privacy-policy')} style={{ cursor: 'pointer' }}>Privacy Policy</a></li>
              <li><a onClick={() => navigate('/terms')} style={{ cursor: 'pointer' }}>Terms of Service</a></li>
              <li><a onClick={() => navigate('/support')} style={{ cursor: 'pointer' }}>Support</a></li>
            </ul>
          </Col>
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5>Contact Us</h5>
            <div className="footer-contact-info">
              <FaEnvelope /><span>testmail.hna@gmail.com</span>
            </div>
            <div className="footer-contact-info">
              <FaPhone /><span>+1 234 567 890</span>
            </div>
            <div className="footer-contact-info">
              <FaMapMarkerAlt /><span>123 Learning Street, DaNang City, Viet Nam</span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="text-center footer-bottom">
            &copy; {new Date().getFullYear()} MicroLearn. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
