import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { homeService } from '../services/homeService';

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
        setError('Failed to load home page data');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!homeData) {
    return null;
  }

  return (
    <Box
      component="main"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        m: 0,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </Box>
      <Container
        disableGutters
        sx={{
          width: '100%',
          maxWidth: '1200px !important',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 'bold'
            }}
          >
            Welcome to MicroLearn
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}
          >
            Empowering your learning journey, one small step at a time
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            mb: { xs: 4, md: 6 }
          }}
        >
          {homeData.quotes.map((quote) => (
            <Paper
              key={quote.id}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              elevation={3}
            >
              <Typography
                variant="h6"
                component="blockquote"
                gutterBottom
                sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
              >
                "{quote.text}"
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 2,
                  textAlign: 'right',
                  fontStyle: 'italic'
                }}
              >
                — {quote.author}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ width: '100%' }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              mb: { xs: 3, md: 5 },
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Featured Courses
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              }
            }}
          >
            {homeData.featuredCourses.map((course) => (
              <Paper
                key={course.id}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                elevation={2}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    color: 'primary.main'
                  }}
                >
                  {course.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, flex: 1 }}
                >
                  {course.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
