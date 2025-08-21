const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');
const Quiz = require('../models/Quiz');

// Get the user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user data excluding password
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate learning stats
        const quizzesTaken = await QuizSubmission.countDocuments({ user: userId });
        const quizzesCreated = await Quiz.countDocuments({ creator: userId });

        // Calculate average score if user has taken quizzes
        let averageScore = 0;
        if (quizzesTaken > 0) {
            const submissions = await QuizSubmission.find({ user: userId });
            const totalScore = submissions.reduce((sum, submission) => {
                return sum + (submission.score || 0);
            }, 0);
            averageScore = Math.round((totalScore / quizzesTaken) * 100) / 100;
        }

        // Prepare the response object
        const userProfile = {
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
            bio: user.bio || '',
            avatar: user.avatar || '',
            createdAt: user.createdAt,
            stats: {
                quizzesTaken,
                quizzesCreated,
                averageScore
            }
        };

        return res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update the user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, avatar } = req.body;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        if (name) {
            // Split name into firstName and lastName
            const nameParts = name.split(' ');
            user.firstName = nameParts[0] || '';
            user.lastName = nameParts.slice(1).join(' ') || '';
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (avatar) {
            user.avatar = avatar;
        }

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                bio: user.bio || '',
                avatar: user.avatar || '',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
