import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Container, Row, Col, Card } from 'react-bootstrap';

const DashboardPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container fluid className="flex-grow-1 my-4">
        <Row>
          {/* Left Banner */}
          <Col md={2} className="d-none d-md-block">
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>AI Microlearning</Card.Title>
                <Card.Text>
                  Discover bite-sized lessons on AI, from basics to advanced topics. Stay updated with the latest in artificial intelligence!
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Img variant="top" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="AI Banner" />
              <Card.Body>
                <Card.Text>Learn how AI is transforming industries.</Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={12} md={8}>
            {/* Main dashboard content goes here */}
          </Col>

          {/* Right Banner */}
          <Col md={2} className="d-none d-md-block">
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Why Learn AI?</Card.Title>
                <Card.Text>
                  AI skills are in high demand! Start your microlearning journey and boost your career prospects today.
                </Card.Text>
              </Card.Body>
            </Card>
            <Card>
              <Card.Img variant="top" src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" alt="AI Learning" />
              <Card.Body>
                <Card.Text>Explore practical AI applications.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default DashboardPage;
