const mongoose = require('mongoose');

// Define the schema for quiz options
const optionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: [true, 'Option text is required']
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false });

// Define the schema for quiz questions
const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Question content is required']
    },
    options: {
        type: [optionSchema],
        validate: {
            validator: function (options) {
                // At least 2 options are required
                if (options.length < 2) return false;

                // At least one option must be correct
                return options.some(option => option.isCorrect);
            },
            message: 'Questions must have at least 2 options with at least 1 correct answer'
        }
    }
});

// Define the schema for Quiz
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters long']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'General Knowledge',
            'Science',
            'History',
            'Geography',
            'Mathematics',
            'Literature',
            'Sports',
            'Entertainment',
            'Technology',
            'Other'
        ],
        default: 'Other'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function (questions) {
                return questions.length > 0;
            },
            message: 'At least one question is required'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create Quiz model
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
