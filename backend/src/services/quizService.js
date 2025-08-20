const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const pdfParser = require('../utils/pdfParser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Create a new quiz
 */
const createQuiz = async (userId, quizData) => {
    try {
        // Validate that there's at least one question with options
        if (!quizData.questions || quizData.questions.length === 0) {
            throw new Error('At least one question is required');
        }

        // Create the quiz
        const quiz = await Quiz.create({
            ...quizData,
            createdBy: userId
        });

        return {
            success: true,
            message: 'Quiz created successfully',
            quiz
        };
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

/**
 * Get all public quizzes
 */
const getPublicQuizzes = async () => {
    try {
        return await Quiz.find({ isPublic: true })
            .select('title description category createdBy createdAt')
            .populate('createdBy', 'name username')
            .sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error getting public quizzes:', error);
        throw error;
    }
};

/**
 * Create a quiz from a PDF file
 */
const createQuizFromPDF = async (file, userId, quizData) => {
    try {
        // Use the buffer directly instead of file path
        const pdfParser = require('../utils/pdfParser');
        const text = await pdfParser.extractText(file.buffer);

        if (!text || text.trim() === '') {
            throw new Error('Could not extract text from the PDF');
        }

        // Use AI to generate quiz questions based on the PDF content
        const generatedQuestions = await generateQuestionsFromText(text);

        // Create the quiz with the generated questions
        const quiz = await Quiz.create({
            ...quizData,
            createdBy: userId,
            questions: generatedQuestions
        });

        return {
            success: true,
            message: 'Quiz created successfully from PDF',
            quiz
        };
    } catch (error) {
        console.error('Error creating quiz from PDF:', error);
        throw error;
    }
};

/**
 * Get all quizzes with filters
 */
const getAllQuizzes = async (filters) => {
    try {
        const query = {};

        if (filters.createdBy) {
            query.createdBy = filters.createdBy;
        }

        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }

        return await Quiz.find(query)
            .select('title description category isPublic createdAt updatedAt')
            .populate('createdBy', 'name username')
            .sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error getting quizzes:', error);
        throw error;
    }
};

/**
 * Get a quiz by ID
 */
const getQuizById = async (quizId) => {
    try {
        const quiz = await Quiz.findById(quizId)
            .populate('createdBy', 'name username');

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        return quiz;
    } catch (error) {
        console.error(`Error getting quiz with ID ${quizId}:`, error);
        throw error;
    }
};

/**
 * Update a quiz
 */
const updateQuiz = async (quizId, userId, quizData) => {
    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Check if user is authorized to update this quiz
        if (quiz.createdBy.toString() !== userId.toString()) {
            throw new Error('Not authorized to update this quiz');
        }

        // Update quiz with new data
        Object.assign(quiz, quizData);
        quiz.updatedAt = Date.now();

        await quiz.save();

        return {
            success: true,
            message: 'Quiz updated successfully',
            quiz
        };
    } catch (error) {
        console.error(`Error updating quiz with ID ${quizId}:`, error);
        throw error;
    }
};

/**
 * Delete a quiz
 */
const deleteQuiz = async (quizId, userId) => {
    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Check if user is authorized to delete this quiz
        if (quiz.createdBy.toString() !== userId.toString()) {
            throw new Error('Not authorized to delete this quiz');
        }

        // Delete all submissions for this quiz
        await QuizSubmission.deleteMany({ quiz: quizId });

        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);

        return {
            success: true,
            message: 'Quiz deleted successfully'
        };
    } catch (error) {
        console.error(`Error deleting quiz with ID ${quizId}:`, error);
        throw error;
    }
};

/**
 * Submit answers to a quiz
 */
const submitQuizAnswers = async (quizId, userId, answers) => {
    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Check if user has already submitted this quiz
        const existingSubmission = await QuizSubmission.findOne({
            quiz: quizId,
            user: userId
        });

        if (existingSubmission) {
            throw new Error('You have already submitted this quiz');
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        // Validate and score the answers
        for (const answer of answers) {
            const question = quiz.questions.id(answer.questionId);

            if (!question) {
                throw new Error(`Question with ID ${answer.questionId} not found`);
            }

            if (answer.selectedOptionIndex < 0 || answer.selectedOptionIndex >= question.options.length) {
                throw new Error(`Invalid option index for question ${answer.questionId}`);
            }

            if (question.options[answer.selectedOptionIndex].isCorrect) {
                correctAnswers++;
            }
        }

        const score = (correctAnswers / totalQuestions) * 100;

        // Create submission record
        const submission = await QuizSubmission.create({
            quiz: quizId,
            user: userId,
            answers,
            score,
            totalQuestions,
            correctAnswers
        });

        return {
            success: true,
            message: 'Quiz submitted successfully',
            submission: {
                score,
                correctAnswers,
                totalQuestions
            }
        };
    } catch (error) {
        console.error(`Error submitting quiz ${quizId}:`, error);
        throw error;
    }
};

/**
 * Get submissions for a quiz
 */
const getQuizSubmissions = async (quizId, userId) => {
    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Check if user is authorized to view submissions (must be the creator)
        if (quiz.createdBy.toString() !== userId.toString()) {
            throw new Error('Not authorized to view submissions');
        }

        const submissions = await QuizSubmission.find({ quiz: quizId })
            .populate('user', 'name username')
            .sort({ completedAt: -1 });

        return {
            success: true,
            submissions
        };
    } catch (error) {
        console.error(`Error getting submissions for quiz ${quizId}:`, error);
        throw error;
    }
};

/**
 * Generate questions from text using AI
 */
const generateQuestionsFromText = async (text) => {
    try {
        // Limit text length to avoid token limit issues
        const truncatedText = text.substring(0, 10000);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
    Generate a set of multiple-choice quiz questions based on the following text. 
    Format each question with exactly 4 options, with exactly 1 correct answer.
    
    Text: ${truncatedText}
    
    Generate 5 questions in the following JSON format:
    [
      {
        "content": "Question text goes here?",
        "options": [
          {"label": "Option 1", "isCorrect": false},
          {"label": "Option 2", "isCorrect": true},
          {"label": "Option 3", "isCorrect": false},
          {"label": "Option 4", "isCorrect": false}
        ]
      }
    ]
    
    Ensure each question has exactly 4 options with exactly 1 correct answer. 
    Return ONLY valid JSON without any additional text or explanation.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\\[\\s*\\{.*\\}\\s*\\]/s);
        if (!jsonMatch) {
            throw new Error('Failed to generate proper quiz questions');
        }

        const jsonString = jsonMatch[0].replace(/^```json|```$/g, '').trim();
        const questions = JSON.parse(jsonString);

        // Validate the generated questions
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Failed to generate quiz questions');
        }

        for (const question of questions) {
            if (!question.content || !Array.isArray(question.options) || question.options.length !== 4) {
                throw new Error('Generated questions have incorrect format');
            }

            // Ensure exactly one correct answer
            const correctCount = question.options.filter(opt => opt.isCorrect).length;
            if (correctCount !== 1) {
                throw new Error('Each question must have exactly one correct answer');
            }
        }

        return questions;
    } catch (error) {
        console.error('Error generating questions with AI:', error);
        throw new Error('Failed to generate quiz questions: ' + error.message);
    }
};

/**
 * Create a quiz with AI
 */
const createQuizWithAI = async (userId, data) => {
    try {
        if (!data.text) {
            throw new Error('Text content is required');
        }

        // Generate questions from the provided text
        const generatedQuestions = await generateQuestionsFromText(data.text);

        // Create the quiz with the generated questions
        const quiz = await Quiz.create({
            title: data.title || 'AI Generated Quiz',
            description: data.description || 'This quiz was automatically generated based on provided text.',
            category: data.category || 'Other',
            isPublic: data.isPublic || false,
            createdBy: userId,
            questions: generatedQuestions
        });

        return {
            success: true,
            message: 'AI Quiz created successfully',
            quiz
        };
    } catch (error) {
        console.error('Error creating AI quiz:', error);
        throw error;
    }
};

/**
 * Create a quiz from a text file
 */
const createQuizFromTextFile = async (file, userId, quizData) => {
    try {
        // Read the text directly from buffer
        const text = file.buffer.toString('utf8');

        if (!text || text.trim() === '') {
            throw new Error('Text file is empty');
        }

        // Use AI to generate quiz questions
        const generatedQuestions = await generateQuestionsFromText(text);

        // Create the quiz with the generated questions
        const quiz = await Quiz.create({
            ...quizData,
            createdBy: userId,
            questions: generatedQuestions
        });

        return {
            success: true,
            message: 'Quiz created successfully from text file',
            quiz
        };
    } catch (error) {
        console.error('Error creating quiz from text file:', error);
        throw error;
    }
};

const quizService = {
    createQuiz,
    getPublicQuizzes,
    createQuizFromPDF,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAnswers,
    getQuizSubmissions,
    createQuizWithAI,
    createQuizFromTextFile
};

module.exports = quizService;
