import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { FaQuestionCircle, FaSearch, FaPlus, FaFileAlt, FaRobot } from 'react-icons/fa';
import { getUserQuizzes, getPublicQuizzes } from '../services/quizService';

const DashboardPage = () => {
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user's quizzes
        const userQuizzesResponse = await getUserQuizzes();
        setUserQuizzes(userQuizzesResponse.data || []);

        // Fetch public quizzes
        const publicQuizzesResponse = await getPublicQuizzes();
        setPublicQuizzes(publicQuizzesResponse || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
            {/* Feature Banner */}
            <Card className="mb-4 bg-primary text-white feature-banner">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h2 className="mb-3">Welcome to MicroLearn AI</h2>
                    <p className="lead">Your platform for creating and sharing knowledge through interactive quizzes</p>
                    <div className="d-flex flex-wrap gap-3 mt-4">
                      <Button
                        variant="light"
                        className="d-flex align-items-center gap-2"
                        onClick={() => navigate('/create-quiz')}
                      >
                        <FaPlus /> Create Quiz
                      </Button>
                      <Button
                        variant="outline-light"
                        className="d-flex align-items-center gap-2"
                        onClick={() => navigate('/summary')}
                      >
                        <FaFileAlt /> Generate Summary
                      </Button>
                    </div>
                  </Col>
                  <Col md={4} className="text-center d-none d-md-block">
                    <div className="display-1 text-light">
                      <FaRobot />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* My Quizzes Section */}
            <Card className="mb-4 section-card">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">My Quizzes</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/quiz-list')}
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : userQuizzes && userQuizzes.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {userQuizzes.slice(0, 6).map((quiz) => (
                      <Col key={quiz._id}>
                        <Card className="h-100 shadow-sm quiz-card">
                          <Card.Body>
                            <Card.Title>{quiz.title}</Card.Title>
                            <Card.Text className="text-muted small">
                              {formatDate(quiz.createdAt)}
                            </Card.Text>
                            <Card.Text>
                              {truncateText(quiz.description || 'No description provided.')}
                            </Card.Text>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <Badge bg={quiz.isPublic ? "success" : "secondary"}>
                                {quiz.isPublic ? "Public" : "Private"}
                              </Badge>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/quiz/${quiz._id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card className="text-center py-5 bg-light">
                    <Card.Body>
                      <div className="display-6 text-muted mb-3">
                        <FaQuestionCircle />
                      </div>
                      <Card.Title>No Quizzes Yet</Card.Title>
                      <Card.Text>
                        You haven't created any quizzes yet. Start creating your first quiz!
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/create-quiz')}
                      >
                        Create Your First Quiz
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>

            {/* Public Quizzes Section */}
            <Card className="mb-4 section-card">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">Public Quizzes</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/public-quizzes')}
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : publicQuizzes && publicQuizzes.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {publicQuizzes.slice(0, 6).map((quiz) => (
                      <Col key={quiz._id}>
                        <Card className="h-100 shadow-sm quiz-card">
                          <Card.Body>
                            <Card.Title>{quiz.title}</Card.Title>
                            <Card.Text className="text-muted small">
                              By {quiz.createdBy?.name || 'Unknown'} • {formatDate(quiz.createdAt)}
                            </Card.Text>
                            <Card.Text>
                              {truncateText(quiz.description || 'No description provided.')}
                            </Card.Text>
                            <div className="mt-3 text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/quiz/${quiz._id}`)}
                              >
                                View Quiz
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card className="text-center py-5 bg-light">
                    <Card.Body>
                      <div className="display-6 text-muted mb-3">
                        <FaSearch />
                      </div>
                      <Card.Title>No Public Quizzes Found</Card.Title>
                      <Card.Text>
                        There are no public quizzes available at the moment. Be the first to share a quiz with the community!
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/create-quiz')}
                      >
                        Create and Share a Quiz
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
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
