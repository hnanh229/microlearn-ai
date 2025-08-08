import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockOutlined from '@mui/icons-material/LockOutlined';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
} from '@mui/material';
import { adminLogin } from '../../services/adminService';

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await adminLogin(formData.username, formData.password);
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminData', JSON.stringify(response.data.admin));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
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
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600
                            }}
                        >
                            Admin Login
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminLoginPage;
