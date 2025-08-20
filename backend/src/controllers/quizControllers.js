const quizService = require("../services/quizService");

/**
 * Create a new quiz
 * @route POST /api/quizzes
 * @access Private
 */
const createQuiz = async (req, res) => {
    try {
        const result = await quizService.createQuiz(req.user._id, req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(400).json({
            message: error.message || "Error occurred while creating quiz",
            error: error.message
        });
    }
};

/**
 * Get all public quizzes
 * @route GET /api/quizzes/public
 * @access Public
 */
const getPublicQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getPublicQuizzes();
        res.json(quizzes);
    } catch (error) {
        console.error("Error getting public quizzes:", error);
        res.status(500).json({ message: "Error getting public quiz list" });
    }
};

/**
 * Create a new quiz from PDF
 * @route POST /api/quizzes/upload/pdf
 * @access Private
 */
const createQuizFromPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        // Extract quiz data from request body
        const quizData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            isPublic: req.body.isPublic === 'true',
        };

        const result = await quizService.createQuizFromPDF(
            req.file,
            req.user._id,
            quizData
        );
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating quiz from PDF:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new quiz from text file
 * @route POST /api/quizzes/upload/text
 * @access Private
 */
const createQuizFromTextFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No text file uploaded" });
        }

        // Extract quiz data from request body
        const quizData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            isPublic: req.body.isPublic === 'true',
        };

        const result = await quizService.createQuizFromTextFile(
            req.file,
            req.user._id,
            quizData
        );
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating quiz from text file:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all quizzes with filters
 * @route GET /api/quizzes
 * @access Private
 */
const getAllQuizzes = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
        };

        // If createdBy is "me" or not specified, use userId from token
        if (!req.query.createdBy || req.query.createdBy === "me") {
            filters.createdBy = req.user._id;
        } else {
            filters.createdBy = req.query.createdBy;
        }

        const quizzes = await quizService.getAllQuizzes(filters);
        res.json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        console.error("Error getting quizzes:", error);
        res.status(500).json({
            success: false,
            message: "Error getting quizzes"
        });
    }
};

/**
 * Get a single quiz
 * @route GET /api/quizzes/:id
 * @access Public/Private (depending on quiz visibility)
 */
const getQuizById = async (req, res) => {
    try {
        const quiz = await quizService.getQuizById(req.params.id);

        // If quiz is not public and user is not the creator, deny access
        if (!quiz.isPublic && (!req.user || quiz.createdBy._id.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: "Not authorized to access this quiz" });
        }

        res.json(quiz);
    } catch (error) {
        console.error("Error getting quiz:", error);
        if (error.message === "Quiz not found") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error getting quiz" });
    }
};

/**
 * Update a quiz
 * @route PUT /api/quizzes/:id
 * @access Private
 */
const updateQuiz = async (req, res) => {
    try {
        const result = await quizService.updateQuiz(
            req.params.id,
            req.user._id,
            req.body
        );
        res.json(result);
    } catch (error) {
        console.error("Error updating quiz:", error);
        if (error.message === "Quiz not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Not authorized to update this quiz") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Error updating quiz" });
    }
};

/**
 * Delete a quiz
 * @route DELETE /api/quizzes/:id
 * @access Private
 */
const deleteQuiz = async (req, res) => {
    try {
        const result = await quizService.deleteQuiz(req.params.id, req.user._id);
        res.json(result);
    } catch (error) {
        console.error("Error deleting quiz:", error);
        if (error.message === "Quiz not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Not authorized to delete this quiz") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Error deleting quiz" });
    }
};

/**
 * Submit quiz answers
 * @route POST /api/quizzes/:id/submit
 * @access Private
 */
const submitQuizAnswers = async (req, res) => {
    try {
        const result = await quizService.submitQuizAnswers(
            req.params.id,
            req.user._id,
            req.body.answers
        );
        res.json(result);
    } catch (error) {
        console.error("Error submitting quiz:", error);
        let status = 500;

        if (error.message === "Quiz not found") {
            status = 404;
        } else if (error.message === "You have already submitted this quiz") {
            status = 409;
        } else if (error.message.includes("validation failed") || error.message.includes("required")) {
            status = 422;
        }

        res.status(status).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get quiz submissions
 * @route GET /api/quizzes/:id/submissions
 * @access Private
 */
const getQuizSubmissions = async (req, res) => {
    try {
        const submissions = await quizService.getQuizSubmissions(
            req.params.id,
            req.user._id
        );
        res.json(submissions);
    } catch (error) {
        console.error("Error getting quiz submissions:", error);
        if (error.message === "Quiz not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Not authorized to view submissions") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Error getting quiz submissions" });
    }
};

/**
 * Create quiz with AI
 * @route POST /api/quizzes/ai
 * @access Private
 */
const createQuizWithAI = async (req, res) => {
    try {
        const result = await quizService.createQuizWithAI(req.user._id, req.body);
        res.status(201).json({
            success: true,
            message: "AI Quiz created successfully",
            data: result.quiz
        });
    } catch (error) {
        console.error("Error creating quiz with AI:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Error creating AI quiz",
            error: error.message
        });
    }
};

module.exports = {
    createQuiz,
    getPublicQuizzes,
    createQuizFromPDF,
    createQuizFromTextFile,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAnswers,
    getQuizSubmissions,
    createQuizWithAI
};
