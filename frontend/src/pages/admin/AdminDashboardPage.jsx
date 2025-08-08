import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    People as PeopleIcon,
    VerifiedUser as VerifiedUserIcon,
    Pending as PendingIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getDashboardStats } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    backgroundColor: `${color}.light`, 
                    color: `${color}.main`,
                    mr: 2 
                }}>
                    {icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                setStats(response.data.stats);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    Dashboard Overview
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={<PeopleIcon />}
                            color="primary"
                            subtitle="All registered users"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Verified Users"
                            value={stats?.verifiedUsers || 0}
                            icon={<VerifiedUserIcon />}
                            color="success"
                            subtitle={`${stats?.verificationRate || 0}% verification rate`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Unverified Users"
                            value={stats?.unverifiedUsers || 0}
                            icon={<PendingIcon />}
                            color="warning"
                            subtitle="Pending verification"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Today's Registrations"
                            value={stats?.todayUsers || 0}
                            icon={<TrendingUpIcon />}
                            color="info"
                            subtitle="New users today"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Use the sidebar menu to manage users, view detailed statistics, and configure system settings.
                    </Typography>
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
