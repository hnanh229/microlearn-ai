import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link
} from '@mui/material';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // TODO: Implement password reset logic here
            console.log('Password reset requested for:', email);
            setStatus({
                type: 'success',
                message: 'If an account exists with this email, you will receive password reset instructions.'
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: 'Failed to process your request. Please try again.'
            });
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
                        Reset Password
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                        Enter your email address and we'll send you instructions to reset your password.
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
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Send Reset Instructions
                        </Button>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Back to Login
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPasswordPage;
