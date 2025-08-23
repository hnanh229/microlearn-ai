import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { API_BASE_URL } from '../../config/apiConfig';
import axios from 'axios';

const LoadingScreen = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Connecting to server...');
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 5;

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                setStatus('Waking up the server...');
                // Use health endpoint to check if server is up
                const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
                if (response.status === 200) {
                    setLoading(false);
                }
            } catch (error) {
                if (retryCount < MAX_RETRIES) {
                    setStatus(`Server is starting up, please wait (${retryCount + 1}/${MAX_RETRIES})...`);
                    setRetryCount(prev => prev + 1);
                    // Retry after a delay
                    setTimeout(checkServerStatus, 3000);
                } else {
                    setStatus('Server is taking longer than expected. You can continue but some features may be slow to respond.');
                    setTimeout(() => setLoading(false), 2000);
                }
            }
        };

        checkServerStatus();
    }, [retryCount]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: '#f5f5f5',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 400,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom color="primary">
                        MicroLearn
                    </Typography>
                    <CircularProgress size={60} thickness={4} sx={{ my: 3 }} />
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                        {status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Free hosting services go to sleep after periods of inactivity.
                        Please be patient for a few seconds while I beat it up.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return children;
};

export default LoadingScreen;
