import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaCheck, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import quizService from '../services/quizService';
import toast from 'react-hot-toast';

const TakeQuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        fetchQuiz();
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const data = await quizService.getQuizById(id);
            setQuiz(data);

            // Initialize selected options
            const initialSelectedOptions = {};
            data.questions.forEach((question, index) => {
                initialSelectedOptions[question._id] = null;
            });
            setSelectedOptions(initialSelectedOptions);

            // Set timer if needed (for example, 1 minute per question)
            const timeLimit = data.questions.length * 60; // seconds
            setTimeRemaining(timeLimit);

            const timerInterval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval);
                        // Auto-submit when time is up
                        if (!submitted) handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setTimer(timerInterval);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz. Please try again later.');
            navigate('/quiz-list');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionIndex) => {
        if (submitted) return;

        setSelectedOptions(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setShowFeedback(false);
        }
    };

    const isQuizCompleted = () => {
        return Object.values(selectedOptions).every(val => val !== null);
    };

    const handleSubmit = async () => {
        try {
            if (timer) clearInterval(timer);

            // Format answers for submission
            const formattedAnswers = Object.entries(selectedOptions).map(([questionId, optionIndex]) => ({
                questionId,
                selectedOptionIndex: optionIndex || 0 // Default to first option if not selected
            }));

            const response = await quizService.submitQuizAnswers(id, formattedAnswers);
            setResults(response);
            setSubmitted(true);
            toast.success('Quiz submitted successfully!');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Failed to submit quiz. Please try again.');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
                    <button
                        onClick={() => navigate('/quiz-list')}
                        className="px-6 py-3 bg-pink-600 rounded-xl font-bold hover:bg-pink-700 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Results display if submitted
    if (submitted && results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-4 relative overflow-hidden">
                {/* Background elements */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(2px)' }}>
                    <defs>
                        <radialGradient id="g1" cx="50%" cy="50%" r="80%">
                            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
                        <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
                        <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
                    </circle>
                </svg>
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10 pointer-events-none z-0"></div>

                <div className="relative max-w-3xl mx-auto z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400/40"
                    >
                        <div className="p-8 text-center">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-6 font-orbitron">
                                Quiz Results
                            </h2>

                            <div className="bg-black/40 p-6 rounded-2xl mb-8 border-2 border-pink-400/30">
                                <div className="flex justify-center items-center space-x-8 mb-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-yellow-400 mb-1 font-orbitron">
                                            {results.submission.score.toFixed(0)}%
                                        </div>
                                        <div className="text-pink-200 text-sm font-orbitron">Score</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-green-400 mb-1 font-orbitron">
                                            {results.submission.correctAnswers}
                                        </div>
                                        <div className="text-pink-200 text-sm font-orbitron">Correct</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-pink-400 mb-1 font-orbitron">
                                            {results.submission.totalQuestions}
                                        </div>
                                        <div className="text-pink-200 text-sm font-orbitron">Total</div>
                                    </div>
                                </div>

                                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${results.submission.score}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-yellow-400 to-pink-500"
                                    ></motion.div>
                                </div>
                            </div>

                            <p className="text-xl text-pink-200 mb-8 font-orbitron">
                                {results.submission.score >= 70
                                    ? "Great job! You did excellently on this quiz."
                                    : results.submission.score >= 50
                                        ? "Good effort! Keep practicing to improve your score."
                                        : "Don't worry! Try again to improve your knowledge."}
                            </p>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => navigate('/quiz-list')}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl font-orbitron hover:from-indigo-600 hover:to-purple-700 transition-colors"
                                >
                                    Back to Quizzes
                                </button>

                                <button
                                    onClick={() => navigate(`/quiz/${id}`)}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold rounded-xl font-orbitron hover:from-pink-500 hover:to-yellow-400 transition-colors"
                                >
                                    View Quiz Details
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-6 px-4 relative overflow-hidden">
            {/* Background elements */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(2px)' }}>
                <defs>
                    <radialGradient id="g1" cx="50%" cy="50%" r="80%">
                        <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
                    <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
                </circle>
                <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
                    <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
                </circle>
            </svg>
            <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10 pointer-events-none z-0"></div>

            <div className="relative max-w-3xl mx-auto z-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white font-orbitron flex items-center">
                        <FaGamepad className="mr-2 text-yellow-300" />
                        {quiz.title}
                    </h1>

                    {timeRemaining !== null && (
                        <div className={`px-4 py-2 rounded-xl text-white font-bold font-orbitron ${timeRemaining < 30 ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'
                            }`}>
                            Time: {formatTime(timeRemaining)}
                        </div>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400/40 mb-6"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-black/40 px-4 py-2 rounded-xl text-pink-200 font-orbitron">
                                Question {currentQuestionIndex + 1} of {quiz.questions.length}
                            </div>
                            <div className="bg-black/40 px-4 py-2 rounded-xl text-pink-200 font-orbitron">
                                Category: {quiz.category}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-black/40 p-6 rounded-2xl mb-6 border-2 border-pink-400/30">
                                    <h2 className="text-xl font-bold text-white mb-6 font-orbitron">
                                        {currentQuestion.content}
                                    </h2>

                                    <div className="space-y-4">
                                        {currentQuestion.options.map((option, optionIndex) => (
                                            <motion.button
                                                key={optionIndex}
                                                onClick={() => handleOptionSelect(currentQuestion._id, optionIndex)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-orbitron ${selectedOptions[currentQuestion._id] === optionIndex
                                                    ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white border-white'
                                                    : 'bg-black/60 text-white border-pink-400/40 hover:border-pink-400'
                                                    }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${selectedOptions[currentQuestion._id] === optionIndex
                                                        ? 'bg-white text-pink-500'
                                                        : 'bg-pink-400/40 text-white'
                                                        }`}>
                                                        {String.fromCharCode(65 + optionIndex)}
                                                    </div>
                                                    {option.label}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`px-4 py-2 rounded-xl font-orbitron flex items-center ${currentQuestionIndex === 0
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                <FaChevronLeft className="mr-1" /> Previous
                            </button>

                            {currentQuestionIndex < quiz.questions.length - 1 ? (
                                <button
                                    onClick={nextQuestion}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-orbitron flex items-center hover:bg-indigo-700"
                                >
                                    Next <FaChevronRight className="ml-1" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isQuizCompleted()}
                                    className={`px-6 py-2 rounded-xl font-orbitron flex items-center ${isQuizCompleted()
                                        ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-pink-500 hover:to-yellow-400'
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="flex justify-center">
                    <div className="bg-black/40 px-4 py-3 rounded-xl">
                        <div className="flex space-x-2">
                            {quiz.questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentQuestionIndex === index
                                        ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white'
                                        : selectedOptions[quiz.questions[index]._id] !== null
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-700 text-white'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeQuizPage;
