import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    IconButton,
    Chip,
    Typography,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    VerifiedUser as VerifiedUserIcon,
    Pending as PendingIcon,
    Search as SearchIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { getUsers, updateUser, deleteUser, toggleUserVerification } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({});
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage, search, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
            };
            const response = await getUsers(params);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isVerified: user.isVerified,
        });
        setEditDialog({ open: true, user });
    };

    const handleSaveUser = async () => {
        try {
            await updateUser(editDialog.user._id, editForm);
            setEditDialog({ open: false, user: null });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleToggleVerification = async (userId) => {
        try {
            await toggleUserVerification(userId);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle verification');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">
                        User Management
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="verified">Verified</MenuItem>
                                <MenuItem value="unverified">Unverified</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {user.firstName} {user.lastName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isVerified ? 'Verified' : 'Unverified'}
                                                color={user.isVerified ? 'success' : 'warning'}
                                                size="small"
                                                icon={user.isVerified ? <VerifiedUserIcon /> : <PendingIcon />}
                                            />
                                        </TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Edit User">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={user.isVerified ? 'Unverify' : 'Verify'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleVerification(user._id)}
                                                        color={user.isVerified ? 'warning' : 'success'}
                                                    >
                                                        {user.isVerified ? <PendingIcon /> : <VerifiedUserIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[15, 25, 50]}
                        component="div"
                        count={pagination.totalUsers || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>

                {/* Edit User Dialog */}
                <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="First Name"
                                value={editForm.firstName || ''}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Last Name"
                                value={editForm.lastName || ''}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Verification Status</InputLabel>
                                <Select
                                    value={editForm.isVerified || false}
                                    label="Verification Status"
                                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.value })}
                                >
                                    <MenuItem value={true}>Verified</MenuItem>
                                    <MenuItem value={false}>Unverified</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialog({ open: false, user: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUser} variant="contained">
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
};

export default UserManagementPage;
