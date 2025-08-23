import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { uploadImageToCloudinary, validateImageFile } from '../utils/imageUpload';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
        createdAt: null
    });
    const [stats, setStats] = useState({
        quizzesTaken: 0,
        quizzesCreated: 0,
        averageScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const data = await authService.getUserProfile();
                setUser({
                    name: data.name || '',
                    email: data.email || '',
                    bio: data.bio || '',
                    avatar: data.avatar && data.avatar.trim() !== '' ? data.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || 'U'),
                    createdAt: data.createdAt || null
                });

                // If you have learning stats available, set them here
                if (data.stats) {
                    setStats({
                        quizzesTaken: data.stats.quizzesTaken || 0,
                        quizzesCreated: data.stats.quizzesCreated || 0,
                        averageScore: data.stats.averageScore || 0
                    });
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to load profile. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validationError = validateImageFile(selectedFile);
            if (validationError) {
                setError(validationError);
                return;
            }
            setFile(selectedFile);
            setError(''); // Clear any previous errors
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(true);

            // Upload image if a new one is selected
            let avatarUrl = user.avatar;
            if (file) {
                setUploading(true);
                try {
                    avatarUrl = await uploadImageToCloudinary(file);
                    setUploading(false);
                } catch (uploadError) {
                    setUploading(false);
                    setError('Image upload failed. Please try again.');
                    setLoading(false);
                    return;
                }
            }

            // Update profile data
            const updatedUser = {
                ...user,
                avatar: avatarUrl
            };

            await authService.updateUserProfile(updatedUser);
            setUser(updatedUser);
            setSuccess('Profile updated successfully!');
            setLoading(false);

            // Force a refresh to ensure the header updates
            setTimeout(() => {
                // This will trigger a re-render across the app
                window.dispatchEvent(new Event('storage'));
            }, 100);;
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header as="h4" className="bg-primary text-white">My Profile</Card.Header>
                            <Card.Body>
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-4 align-items-center">
                                        <Col md={4} className="text-center">
                                            <div className="position-relative mb-3">
                                                <Image
                                                    src={file ? URL.createObjectURL(file) : (user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'U'))}
                                                    alt="Profile"
                                                    roundedCircle
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                />
                                                {uploading && (
                                                    <div className="position-absolute top-50 start-50 translate-middle">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Form.Group controlId="avatar">
                                                <Form.Label className="btn btn-outline-primary btn-sm">
                                                    Change Avatar
                                                    <Form.Control
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        hidden
                                                    />
                                                </Form.Label>
                                                <Form.Text className="text-muted d-block">
                                                    Max size: 2MB
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={8}>
                                            <Form.Group className="mb-3" controlId="name">
                                                <Form.Label>Display Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={user.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="joinDate">
                                                <Form.Label>Member Since</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'Not available'}
                                                    readOnly
                                                    disabled
                                                />
                                                <Form.Text className="text-muted">
                                                    Your MicroLearn account creation date
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4" controlId="bio">
                                        <Form.Label>Bio / Short Introduction</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="bio"
                                            value={user.bio}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                    </Form.Group>

                                    <Card className="mb-4">
                                        <Card.Header as="h5">Learning Stats</Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={4} className="text-center mb-3 mb-md-0">
                                                    <h3>{stats.quizzesTaken}</h3>
                                                    <p className="text-muted">Quizzes Taken</p>
                                                </Col>
                                                <Col md={4} className="text-center mb-3 mb-md-0">
                                                    <h3>{stats.quizzesCreated}</h3>
                                                    <p className="text-muted">Quizzes Created</p>
                                                </Col>
                                                <Col md={4} className="text-center">
                                                    <h3>{stats.averageScore}%</h3>
                                                    <p className="text-muted">Average Score</p>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => navigate('/dashboard')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading || uploading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
};

export default ProfilePage;
