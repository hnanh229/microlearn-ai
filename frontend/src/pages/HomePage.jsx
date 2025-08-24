import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { FaGraduationCap, FaLaptop, FaMedal, FaRegLightbulb } from 'react-icons/fa';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { homeService } from '../services/homeService';
import './HomePage.css';

// Function to get course images based on category
const getCourseImage = (category) => {
  const lowerCategory = category?.toLowerCase() || '';

  // Define specific images for common categories
  const categoryImages = {
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=640&auto=format&fit=crop',
    'programming': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=640&auto=format&fit=crop',
    'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=640&auto=format&fit=crop',
    'marketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=640&auto=format&fit=crop',
    'design': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=640&auto=format&fit=crop',
    'science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=640&auto=format&fit=crop',
    'health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=640&auto=format&fit=crop',
    'language': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=640&auto=format&fit=crop',
  };

  // Check if category exists in our mapping
  if (lowerCategory && categoryImages[lowerCategory]) {
    return categoryImages[lowerCategory];
  }

  // For unknown categories, use a default image based on the first letter
  const firstLetter = lowerCategory ? lowerCategory[0] : 'e';
  const defaultImages = {
    'a': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640&auto=format&fit=crop',
    'b': 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=640&auto=format&fit=crop',
    'c': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=640&auto=format&fit=crop',
    'd': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=640&auto=format&fit=crop',
    'e': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=640&auto=format&fit=crop',
    'f': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=640&auto=format&fit=crop',
    'g': 'https://images.unsplash.com/photo-1560785496-3c9d27877182?q=80&w=640&auto=format&fit=crop',
    'h': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=640&auto=format&fit=crop',
    'i': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640&auto=format&fit=crop',
    'j': 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=640&auto=format&fit=crop',
    'k': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=640&auto=format&fit=crop',
    'l': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=640&auto=format&fit=crop',
    'm': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=640&auto=format&fit=crop',
    'n': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=640&auto=format&fit=crop',
    'o': 'https://images.unsplash.com/photo-1560785496-3c9d27877182?q=80&w=640&auto=format&fit=crop',
    'p': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=640&auto=format&fit=crop',
    'q': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640&auto=format&fit=crop',
    'r': 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=640&auto=format&fit=crop',
    's': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=640&auto=format&fit=crop',
    't': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=640&auto=format&fit=crop',
    'u': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=640&auto=format&fit=crop',
    'v': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=640&auto=format&fit=crop',
    'w': 'https://images.unsplash.com/photo-1560785496-3c9d27877182?q=80&w=640&auto=format&fit=crop',
    'x': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=640&auto=format&fit=crop',
    'y': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640&auto=format&fit=crop',
    'z': 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=640&auto=format&fit=crop',
  };

  // Use the first letter mapping or fallback to the Cloudinary default image
  return defaultImages[firstLetter] || 'https://res.cloudinary.com/di8a3pdgu/image/upload/cld-sample-2';
};

// Image component with loading state
const CourseImage = ({ course }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Try to use category-specific image first
  const primaryImageUrl = getCourseImage(course.category);

  // Cloudinary fallback image
  const fallbackImageUrl = "https://res.cloudinary.com/di8a3pdgu/image/upload/cld-sample-2";

  // Keep track of which image we're displaying
  const [currentImageUrl, setCurrentImageUrl] = useState(primaryImageUrl);

  return (
    <div className="course-image">
      {loading && (
        <div className="image-loading-placeholder">
          <div className="spinner-container">
            <Spinner animation="border" variant="light" size="sm" />
          </div>
        </div>
      )}
      {error && (
        <div className="image-error-placeholder">
          <div className="category-initial">
            {course.category ? course.category[0].toUpperCase() : 'M'}
          </div>
        </div>
      )}
      <img
        src={currentImageUrl}
        alt={course.title}
        style={{ display: loading || error ? 'none' : 'block' }}
        onLoad={() => setLoading(false)}
        onError={(e) => {
          console.error(`Failed to load image for ${course.title}`);
          // If primary image fails and we haven't tried fallback yet
          if (currentImageUrl !== fallbackImageUrl) {
            console.log(`Trying fallback image for ${course.title}`);
            setCurrentImageUrl(fallbackImageUrl);
          } else {
            // Both primary and fallback failed
            setLoading(false);
            setError(true);
          }
        }}
      />
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await homeService.getHomePageData();
        setHomeData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        // Create fallback data if API fails
        setHomeData({
          quotes: [
            { id: 1, text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
            { id: 2, text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
            { id: 3, text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" }
          ],
          featuredCourses: [
            { id: 1, title: "Machine Learning Fundamentals", description: "Learn the basics of machine learning algorithms and their applications.", category: "Technology", lessons: 12, students: 234 },
            { id: 2, title: "Web Development Bootcamp", description: "Master HTML, CSS, JavaScript and modern frameworks to build responsive websites.", category: "Programming", lessons: 24, students: 512 },
            { id: 3, title: "Digital Marketing Essentials", description: "Discover proven strategies for effective online marketing campaigns.", category: "Business", lessons: 18, students: 345 }
          ]
        });
        setError('Using demo data - could not connect to server');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="home-hero">
        {/* Parallax Background Elements */}
        <div className="parallax-bg">
          <div className="parallax-element element-1"></div>
          <div className="parallax-element element-2"></div>
          <div className="parallax-element element-3"></div>
          <div className="parallax-element element-4"></div>
          <div className="parallax-element element-5"></div>
        </div>
        <Container>
          <Row className="align-items-center hero-content">
            <Col lg={8} className="text-center text-lg-start">
              <h1 className="hero-title animate-in">
                Master Micro-Learning With MicroLearn
              </h1>
              <p className="hero-subtitle animate-in">
                Enhance your knowledge efficiently with bite-sized learning modules. Our platform makes it easy to create,
                share, and learn from micro-quizzes designed for maximum retention.
              </p>
              <div className="hero-buttons animate-in">
                <Button variant="light" className="me-3 mb-2" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
                <Button variant="outline-light" className="mb-2" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </Col>
            <Col lg={4} className="d-none d-lg-block">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070"
                alt="Learning Illustration"
                className="img-fluid rounded-circle animate-in"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '350px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hero to Features Section Divider */}
      <div className="section-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8f8faff" fillOpacity="1" d="M0,32L60,42.7C120,53,240,75,360,69.3C480,64,600,32,720,21.3C840,11,960,21,1080,37.3C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="text-center section-title">Why Choose MicroLearn?</h2>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="feature-card shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-4">
                    <FaRegLightbulb />
                  </div>
                  <h5>Quick Learning</h5>
                  <p className="text-muted">
                    Bite-sized content designed for efficient knowledge acquisition without overwhelming you.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-4">
                    <FaLaptop />
                  </div>
                  <h5>Create & Share</h5>
                  <p className="text-muted">
                    Easily create your own quizzes and share them with colleagues, classmates, or friends.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-4">
                    <FaGraduationCap />
                  </div>
                  <h5>Track Progress</h5>
                  <p className="text-muted">
                    Monitor your learning journey with detailed statistics and performance insights on your progress.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card shadow-sm">
                <Card.Body>
                  <div className="feature-icon mb-4">
                    <FaMedal />
                  </div>
                  <h5>Earn Achievements</h5>
                  <p className="text-muted">
                    Get rewarded for your learning efforts with badges and achievement recognition as you progress.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features to Testimonials Section Divider */}
      <div className="section-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,42.7C840,32,960,32,1080,48C1200,64,1320,96,1380,112L1440,128L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>

      {/* Testimonials */}
      <section className="testimonials-section">
        <Container>
          <h2 className="text-center section-title">Learning Inspiration</h2>
          <Row className="g-4">
            {homeData.quotes.map((quote) => (
              <Col md={4} key={quote.id}>
                <Card className="testimonial-card shadow-sm">
                  <Card.Body>
                    <div className="testimonial-quote">
                      {quote.text}
                    </div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(quote.author)}&background=random`} alt={quote.author} />
                      </div>
                      <div className="author-info">
                        <h6>{quote.author}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials to Featured Courses Section Divider */}
      <div className="section-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8f9fa" fillOpacity="1" d="M0,0L60,10.7C120,21,240,43,360,42.7C480,43,600,21,720,10.7C840,0,960,0,1080,5.3C1200,11,1320,21,1380,26.7L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>

      {/* Featured Courses */}
      <section className="courses-section">
        <Container>
          <h2 className="text-center section-title">Featured Quizzes</h2>
          <Row className="g-4">
            {homeData.featuredCourses.map((course) => (
              <Col md={4} key={course.id}>
                <Card className="course-card shadow-sm">
                  <CourseImage course={course} />
                  <Card.Body>
                    <span className="course-category">{course.category || 'Learning'}</span>
                    <h5>{course.title}</h5>
                    <p className="text-muted">{course.description}</p>
                    <div className="course-stats">
                      <span><i className="fas fa-book-open me-2"></i> {course.lessons || 10} questions</span>
                      <span><i className="fas fa-users me-2"></i> {course.students || 200} learners</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <Container>
          <h2 className="cta-title">Ready to Start Learning?</h2>
          <p className="cta-subtitle">
            Join thousands of learners who are already benefiting from our micro-learning platform.
            Create your account today and take the first step towards more efficient learning.
          </p>
          <Button
            variant="light"
            size="lg"
            className="cta-button"
            onClick={() => navigate('/signup')}
          >
            Get Started Now
          </Button>
        </Container>
      </section>

      {error && (
        <div className="alert alert-warning m-3" role="alert">
          {error}
        </div>
      )}

      <Footer />
    </>
  );
};

export default HomePage;
