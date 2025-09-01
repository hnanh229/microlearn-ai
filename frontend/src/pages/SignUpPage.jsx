import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Link,
    Alert,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
} from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import authService from '../services/authService';

// Validation regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,16}$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,30}$/;

// Email domain validation - common valid domains
const VALID_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
    'protonmail.com', 'zoho.com', 'aol.com', 'mail.com', 'yandex.com'
];

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const navigate = useNavigate();

    // Validation functions
    const validateEmail = (email) => {
        if (!email) return 'Email is required';

        // Check basic email format
        if (!EMAIL_REGEX.test(email)) {
            return 'Please enter a valid email address';
        }

        // Extract domain
        const domain = email.split('@')[1]?.toLowerCase();

        // Check if domain is in our allowed list (you can make this more flexible)
        if (!VALID_EMAIL_DOMAINS.includes(domain)) {
            return `Email domain '${domain}' is not supported. Please use: ${VALID_EMAIL_DOMAINS.slice(0, 3).join(', ')}, etc.`;
        }

        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';

        if (password.length < 8) return 'Password must be at least 8 characters';
        if (password.length > 16) return 'Password must not exceed 16 characters';

        // Check for emoji or special unicode characters
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        if (emojiRegex.test(password)) {
            return 'Password cannot contain emojis';
        }

        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/\d/.test(password)) return 'Password must contain at least one number';

        // Check if password contains only allowed characters
        if (!PASSWORD_REGEX.test(password)) {
            return 'Password can only contain letters, numbers, and these special characters: @$!%*?&';
        }

        return '';
    };

    const validateName = (name, fieldName) => {
        if (!name) return `${fieldName} is required`;
        if (!NAME_REGEX.test(name)) {
            return `${fieldName} can only contain letters and spaces (2-30 characters)`;
        }
        return '';
    };

    const getPasswordStrength = (password) => {
        const requirements = [
            { test: password.length >= 8, text: 'At least 8 characters' },
            { test: password.length <= 16, text: 'Maximum 16 characters' },
            { test: /[a-z]/.test(password), text: 'At least one lowercase letter' },
            { test: /\d/.test(password), text: 'At least one number' },
            { test: !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(password), text: 'No emojis' },
            { test: PASSWORD_REGEX.test(password) || password === '', text: 'Only letters, numbers, and @$!%*?&' }
        ];

        return requirements;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear previous validation error for this field
        setValidationErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        // Real-time validation
        let error = '';
        switch (name) {
            case 'firstName':
                error = validateName(value, 'First name');
                break;
            case 'lastName':
                error = validateName(value, 'Last name');
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                if (value && !showPasswordRules) {
                    setShowPasswordRules(true);
                }
                break;
            case 'confirmPassword':
                if (value && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
        }

        // Update validation errors
        if (error) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const errors = {
            firstName: validateName(formData.firstName, 'First name'),
            lastName: validateName(formData.lastName, 'Last name'),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''
        };

        // Check if there are any validation errors
        const hasErrors = Object.values(errors).some(error => error !== '');

        if (hasErrors) {
            setValidationErrors(errors);
            setError('Please fix the validation errors before submitting');
            return;
        }

        try {
            await authService.signup(formData.firstName, formData.lastName, formData.email, formData.password);
            navigate('/login', {
                state: { success: 'Registration successful! Please check your email to verify your account.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const passwordRequirements = getPasswordStrength(formData.password);

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
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    name="firstName"
                                    autoComplete="given-name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    error={!!validationErrors.firstName}
                                    helperText={validationErrors.firstName}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    error={!!validationErrors.lastName}
                                    helperText={validationErrors.lastName}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!validationErrors.email}
                            helperText={validationErrors.email || 'Use a valid email from: Gmail, Yahoo, Outlook, etc.'}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setShowPasswordRules(true)}
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                        />

                        {/* Password Requirements */}
                        <Collapse in={showPasswordRules && formData.password}>
                            <Box sx={{ mt: 1, mb: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                                    <Info sx={{ mr: 1, fontSize: 16 }} />
                                    Password Requirements:
                                </Typography>
                                <List dense sx={{ py: 0 }}>
                                    {passwordRequirements.map((req, index) => (
                                        <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 24 }}>
                                                {req.test ?
                                                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> :
                                                    <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                                                }
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={req.text}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.875rem',
                                                        color: req.test ? 'success.main' : 'error.main'
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Collapse>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={!!validationErrors.confirmPassword}
                            helperText={validationErrors.confirmPassword}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={Object.values(validationErrors).some(error => error !== '') ||
                                !formData.firstName || !formData.lastName || !formData.email ||
                                !formData.password || !formData.confirmPassword}
                        >
                            Sign Up
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login">
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default SignUpPage;
