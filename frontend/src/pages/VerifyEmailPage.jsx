import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import authService from '../services/authService';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found in URL.');
            return;
        }

        const verifyToken = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully! You can now log in to your account.');

                // Start countdown for auto-redirect
                let countdownValue = 3;
                setCountdown(countdownValue);
                const countdownInterval = setInterval(() => {
                    countdownValue--;
                    setCountdown(countdownValue);
                    if (countdownValue <= 0) {
                        clearInterval(countdownInterval);
                        navigate('/login', {
                            state: { success: 'Email verified successfully! You can now log in to your account.' }
                        });
                    }
                }, 1000);
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Verification failed.';
                if (errorMsg.includes('expired') || errorMsg.includes('Invalid')) {
                    setStatus('expired');
                    setMessage('This verification link has expired or is invalid. Please request a new verification email.');

                    // Start countdown for auto-redirect
                    let countdownValue = 4;
                    setCountdown(countdownValue);
                    const countdownInterval = setInterval(() => {
                        countdownValue--;
                        setCountdown(countdownValue);
                        if (countdownValue <= 0) {
                            clearInterval(countdownInterval);
                            navigate('/resend-verify');
                        }
                    }, 1000);
                } else {
                    setStatus('error');
                    setMessage(errorMsg);
                }
            }
        };

        verifyToken();
    }, [token]);

    const handleResendVerification = () => {
        navigate('/resend-verify');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={60} sx={{ mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Verifying your email...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please wait while we verify your email address.
                        </Typography>
                    </Box>
                );

            case 'success':
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" color="success.main" sx={{ mb: 2 }}>
                            ✅ Email Verified!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Redirecting to login in {countdown} seconds...
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGoToLogin}
                            sx={{ px: 4 }}
                        >
                            Go to Login Now
                        </Button>
                    </Box>
                );

            case 'expired':
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" color="warning.main" sx={{ mb: 2 }}>
                            ⏰ Link Expired
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Redirecting to resend page in {countdown} seconds...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleResendVerification}
                                sx={{ px: 3 }}
                            >
                                Resend Verification Now
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleGoToLogin}
                                sx={{ px: 3 }}
                            >
                                Go to Login
                            </Button>
                        </Box>
                    </Box>
                );

            case 'error':
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" color="error.main" sx={{ mb: 2 }}>
                            ❌ Verification Failed
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {message}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={handleResendVerification}
                                sx={{ px: 3 }}
                            >
                                Resend Verification
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleGoToLogin}
                                sx={{ px: 3 }}
                            >
                                Go to Login
                            </Button>
                        </Box>
                    </Box>
                );

            default:
                return null;
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
                        Email Verification
                    </Typography>

                    {renderContent()}
                </Paper>
            </Box>
        </Container>
    );
};

export default VerifyEmailPage;
