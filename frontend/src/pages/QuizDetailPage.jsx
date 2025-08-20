import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiClock, FiUser, FiCalendar, FiList, FiCheckCircle, FiShare2 } from 'react-icons/fi';
import { FaGamepad, FaTrophy, FaLock, FaUnlock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import quizService from '../services/quizService';
import toast from 'react-hot-toast';

const QuizDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const quizData = await quizService.getQuizById(id);
            setQuiz(quizData);

            // Check if current user is the owner
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData._id === quizData.createdBy._id) {
                setIsOwner(true);
                // Fetch submissions if user is the owner
                try {
                    const submissionsData = await quizService.getQuizSubmissions(id);
                    setSubmissions(submissionsData.submissions || []);
                } catch (error) {
                    console.error('Error fetching submissions:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz. Please try again later.');
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await quizService.deleteQuiz(id);
            toast.success('Quiz deleted successfully');
            navigate('/quizzes');
        } catch (error) {
            console.error('Error deleting quiz:', error);
            toast.error('Failed to delete quiz. Please try again later.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleQuestion = (index) => {
        setExpandedQuestion(expandedQuestion === index ? null : index);
    };

    const shareQuiz = () => {
        // Generate shareable link
        const shareUrl = `${window.location.origin}/take-quiz/${id}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                toast.success('Shareable link copied to clipboard!');
            })
            .catch(err => {
                console.error('Error copying link:', err);
                toast.error('Failed to copy link. Please try again.');
            });
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
                        onClick={() => navigate('/quizzes')}
                        className="px-6 py-3 bg-pink-600 rounded-xl font-bold hover:bg-pink-700 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

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

            <div className="relative max-w-4xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400/40 mb-8"
                >
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-sm font-bold rounded-full px-4 py-1 font-orbitron">
                                        {quiz.category}
                                    </div>

                                    <div className="text-pink-200">
                                        {quiz.isPublic ? (
                                            <div className="flex items-center text-green-300 bg-green-900/30 px-3 py-1 rounded-full">
                                                <FaUnlock className="mr-1" />
                                                <span className="text-xs font-orbitron">Public</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-yellow-300 bg-yellow-900/30 px-3 py-1 rounded-full">
                                                <FaLock className="mr-1" />
                                                <span className="text-xs font-orbitron">Private</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-extrabold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg mb-2 flex items-center gap-3">
                                    <FaGamepad className="inline-block text-yellow-300" />
                                    {quiz.title}
                                </h1>
                            </div>

                            {isOwner && (
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/edit-quiz/${id}`}
                                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                                    >
                                        <FiEdit size={20} />
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 bg-black/80 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-black/40 p-6 rounded-2xl mb-6 border-2 border-pink-400/30">
                            <p className="text-pink-200 mb-4 font-orbitron">
                                {quiz.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-pink-300 font-orbitron">
                                <div className="flex items-center">
                                    <FiUser className="mr-2" />
                                    Created by: {quiz.createdBy.name || quiz.createdBy.username}
                                </div>
                                <div className="flex items-center">
                                    <FiCalendar className="mr-2" />
                                    Created: {formatDate(quiz.createdAt)}
                                </div>
                                <div className="flex items-center">
                                    <FiList className="mr-2" />
                                    Questions: {quiz.questions.length}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
                            {quiz.isPublic && (
                                <button
                                    onClick={shareQuiz}
                                    className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl font-orbitron flex items-center justify-center hover:bg-indigo-700 transition-colors"
                                >
                                    <FiShare2 className="mr-2" /> Share Quiz
                                </button>
                            )}

                            <Link
                                to={`/take-quiz/${id}`}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold rounded-xl font-orbitron flex items-center justify-center hover:from-pink-500 hover:to-yellow-400 transition-colors"
                            >
                                <FiCheckCircle className="mr-2" /> Take Quiz
                            </Link>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-4 font-orbitron flex items-center">
                                <FaGamepad className="mr-2 text-yellow-300" />
                                Questions
                            </h2>

                            <div className="space-y-4">
                                {quiz.questions.map((question, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-black/40 rounded-xl border-2 border-pink-400/30 overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <button
                                            onClick={() => toggleQuestion(index)}
                                            className="w-full p-4 text-left flex justify-between items-center"
                                        >
                                            <h3 className="text-lg font-bold text-white font-orbitron flex-1">
                                                {index + 1}. {question.content}
                                            </h3>
                                            <div className="ml-4 text-pink-300">
                                                {expandedQuestion === index ? <FaChevronUp /> : <FaChevronDown />}
                                            </div>
                                        </button>

                                        {expandedQuestion === index && (
                                            <div className="p-4 pt-0 border-t border-pink-400/30">
                                                <div className="grid gap-2">
                                                    {question.options.map((option, optIndex) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`p-3 rounded-lg font-orbitron flex items-center ${option.isCorrect
                                                                    ? 'bg-green-800/50 text-green-300 border border-green-500'
                                                                    : 'bg-black/60 text-pink-200'
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${option.isCorrect
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-pink-400/40 text-white'
                                                                }`}>
                                                                {String.fromCharCode(65 + optIndex)}
                                                            </div>
                                                            {option.label}
                                                            {option.isCorrect && (
                                                                <FaCheck className="ml-auto text-green-400" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {isOwner && submissions.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron flex items-center">
                                    <FaTrophy className="mr-2 text-yellow-300" />
                                    Submissions ({submissions.length})
                                </h2>

                                <div className="bg-black/40 rounded-xl border-2 border-pink-400/30 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-pink-400/30">
                                                    <th className="px-4 py-3 text-left text-pink-200 font-orbitron">User</th>
                                                    <th className="px-4 py-3 text-left text-pink-200 font-orbitron">Score</th>
                                                    <th className="px-4 py-3 text-left text-pink-200 font-orbitron">Correct</th>
                                                    <th className="px-4 py-3 text-left text-pink-200 font-orbitron">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map((submission, index) => (
                                                    <tr
                                                        key={submission._id}
                                                        className={`border-b border-pink-400/20 ${index % 2 === 0 ? 'bg-black/20' : ''}`}
                                                    >
                                                        <td className="px-4 py-3 text-white font-orbitron">
                                                            {submission.user.name || submission.user.username}
                                                        </td>
                                                        <td className="px-4 py-3 font-orbitron">
                                                            <span className={`px-2 py-1 rounded-lg ${submission.score >= 70
                                                                    ? 'bg-green-900/40 text-green-300'
                                                                    : submission.score >= 50
                                                                        ? 'bg-yellow-900/40 text-yellow-300'
                                                                        : 'bg-red-900/40 text-red-300'
                                                                }`}>
                                                                {submission.score.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-white font-orbitron">
                                                            {submission.correctAnswers} / {submission.totalQuestions}
                                                        </td>
                                                        <td className="px-4 py-3 text-pink-200 font-orbitron">
                                                            {formatDate(submission.completedAt)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="px-6 py-3 bg-black/60 text-pink-200 font-bold rounded-xl border-2 border-pink-400/40 font-orbitron hover:bg-pink-900/40 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-indigo-800 to-pink-800 p-8 rounded-2xl max-w-md mx-4 border-2 border-pink-400/40"
                    >
                        <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">Confirm Deletion</h3>
                        <p className="text-pink-200 mb-6 font-orbitron">
                            Are you sure you want to delete the quiz "{quiz.title}"? This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl font-orbitron hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 px-4 bg-black/50 text-white font-bold rounded-xl border-2 border-pink-400/40 font-orbitron hover:bg-black/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default QuizDetailPage;
