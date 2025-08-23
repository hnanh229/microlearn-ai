const express = require('express');
const router = express.Router();
const quizControllers = require('../controllers/quizControllers');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for in-memory file uploads
const storage = multer.memoryStorage();

// File filter for uploads
const fileFilter = (req, file, cb) => {
    // For PDF files
    if (file.mimetype === 'application/pdf' && req.path.includes('/upload/pdf')) {
        cb(null, true);
    }
    // For text files
    else if (file.mimetype === 'text/plain' && req.path.includes('/upload/text')) {
        cb(null, true);
    }
    // Reject other file types
    else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Public routes
router.get('/public', quizControllers.getPublicQuizzes);

// Protected routes - require authentication
router.use(authMiddleware);

// Create quiz from file uploads - these must come BEFORE the /:id routes
router.post('/upload/pdf', upload.single('pdfFile'), quizControllers.createQuizFromPDF);
router.post('/upload/text', upload.single('textFile'), quizControllers.createQuizFromTextFile);

// AI-generated quiz
router.post('/ai', quizControllers.createQuizWithAI);

// Quiz CRUD operations
router.post('/', quizControllers.createQuiz);
router.get('/', quizControllers.getAllQuizzes);
router.put('/:id', quizControllers.updateQuiz);
router.delete('/:id', quizControllers.deleteQuiz);

// Quiz submissions
router.post('/:id/submit', quizControllers.submitQuizAnswers);
router.get('/:id/submissions', quizControllers.getQuizSubmissions);

// Get quiz by ID - must be last to avoid route conflicts
router.get('/:id', quizControllers.getQuizById);

module.exports = router;
