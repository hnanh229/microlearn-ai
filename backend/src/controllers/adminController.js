const Admin = require('../models/Admin');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ username, isActive: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken({ 
      id: admin._id, 
      username: admin.username, 
      role: admin.role,
      type: 'admin'
    });

    console.log('[ADMIN LOGIN] Admin logged in:', admin.username);
    res.json({ 
      token, 
      admin: { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      } 
    });
  } catch (err) {
    console.error('[ADMIN LOGIN] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Users List with Pagination
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }

    const users = await User.find(query)
      .select('-password -verificationToken -verificationTokenExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log('[ADMIN] Users fetched:', { page, limit, total, totalPages });

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        usersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('[ADMIN GET USERS] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single User
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('[ADMIN GET USER] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken by another user.' });
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;

    await user.save();

    console.log('[ADMIN] User updated:', user.email);
    res.json({ 
      message: 'User updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[ADMIN UPDATE USER] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('[ADMIN] User deleted:', user.email);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[ADMIN DELETE USER] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Toggle User Verification
exports.toggleUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    console.log('[ADMIN] User verification toggled:', user.email, user.isVerified);
    res.json({ 
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully.`,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('[ADMIN TOGGLE VERIFICATION] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        todayUsers,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
      }
    });
  } catch (err) {
    console.error('[ADMIN DASHBOARD STATS] Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
