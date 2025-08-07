import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { resendVerification } from '../services/authService';

const ResendVerifyPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      await resendVerification(email);
      setStatus({ type: 'success', message: 'Verification email sent! Please check your inbox.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to resend verification email.' });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              color: 'primary.main',
              fontWeight: 600
            }}
          >
            Email Verification Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Your email is not verified. Enter your email address to resend the verification email.
          </Typography>
          {status.message && (
            <Alert severity={status.type} sx={{ width: '100%', mb: 2 }}>
              {status.message}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Resend Verification Email
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResendVerifyPage;
