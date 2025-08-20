import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2, FiEye, FiList, FiCheckCircle } from 'react-icons/fi';
import { FaGamepad, FaGraduationCap, FaTrophy, FaLock, FaUnlock } from 'react-icons/fa';
import quizService from '../services/quizService';
import toast from 'react-hot-toast';

const QuizListPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [publicQuizzes, setPublicQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('myQuizzes');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, [activeTab]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            if (activeTab === 'myQuizzes') {
                const response = await quizService.getUserQuizzes();
                setQuizzes(response.data || []);
            } else {
                const response = await quizService.getPublicQuizzes();
                setPublicQuizzes(response || []);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            toast.error('Failed to fetch quizzes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (quiz) => {
        setSelectedQuiz(quiz);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success('Quiz deleted successfully');
            setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            toast.error('Failed to delete quiz. Please try again later.');
        }
    };

    const filteredQuizzes = () => {
        const list = activeTab === 'myQuizzes' ? quizzes : publicQuizzes;
        if (!searchTerm) return list;

        return list.filter(quiz =>
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-4 relative overflow-hidden">
            {/* Animated SVG background */}
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

            <div className="relative max-w-6xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg mb-2 flex items-center justify-center gap-3">
                        <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
                        Quiz Library
                        <FaTrophy className="inline-block text-pink-300 animate-spin-slow" />
                    </h1>
                    <p className="text-lg text-pink-200 font-orbitron tracking-wide drop-shadow">Browse and manage your quizzes</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400/40"
                >
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div className="mb-4 md:mb-0 flex space-x-2">
                                <button
                                    onClick={() => setActiveTab('myQuizzes')}
                                    className={`px-4 py-2 rounded-lg font-orbitron flex items-center space-x-2 ${activeTab === 'myQuizzes'
                                            ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold'
                                            : 'bg-black/50 text-pink-200 hover:bg-pink-900/50'
                                        }`}
                                >
                                    <FiList className="inline-block" />
                                    <span>My Quizzes</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('publicQuizzes')}
                                    className={`px-4 py-2 rounded-lg font-orbitron flex items-center space-x-2 ${activeTab === 'publicQuizzes'
                                            ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold'
                                            : 'bg-black/50 text-pink-200 hover:bg-pink-900/50'
                                        }`}
                                >
                                    <FaGraduationCap className="inline-block" />
                                    <span>Public Quizzes</span>
                                </button>
                            </div>

                            <div className="w-full md:w-auto flex items-center">
                                <div className="relative flex-1 md:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search quizzes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 border-2 border-pink-400 rounded-xl font-orbitron bg-black/60 text-white placeholder:text-pink-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                                    />
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300" />
                                </div>

                                {activeTab === 'myQuizzes' && (
                                    <Link
                                        to="/create-quiz"
                                        className="ml-2 px-4 py-2 font-orbitron rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white shadow-lg border-2 border-white/30 hover:from-pink-400 hover:to-yellow-400 transition-all flex items-center space-x-1"
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        <span className="hidden md:inline">New Quiz</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                            </div>
                        ) : filteredQuizzes().length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4 text-pink-300 flex justify-center">
                                    {activeTab === 'myQuizzes' ? <FiPlus /> : <FiSearch />}
                                </div>
                                <h3 className="text-xl font-bold text-pink-200 mb-2 font-orbitron">
                                    {activeTab === 'myQuizzes' ? "You haven't created any quizzes yet" : "No public quizzes found"}
                                </h3>
                                <p className="text-pink-300 mb-6 font-orbitron">
                                    {activeTab === 'myQuizzes'
                                        ? "Create your first quiz to start testing knowledge!"
                                        : "Try a different search term or check back later."}
                                </p>
                                {activeTab === 'myQuizzes' && (
                                    <Link
                                        to="/create-quiz"
                                        className="px-6 py-3 font-orbitron rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white shadow-lg border-2 border-white/30 hover:from-pink-400 hover:to-yellow-400 transition-all inline-flex items-center space-x-2"
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        <span>Create Quiz</span>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredQuizzes().map((quiz) => (
                                    <motion.div
                                        key={quiz._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-gradient-to-br from-black/70 via-indigo-900/60 to-pink-900/60 rounded-2xl shadow-xl border-2 border-pink-400/40 overflow-hidden hover:shadow-[0_0_15px_5px_rgba(236,72,153,0.5)] transition-shadow duration-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold rounded-full px-3 py-1 font-orbitron">
                                                    {quiz.category}
                                                </div>
                                                <div className="text-pink-200">
                                                    {quiz.isPublic ? (
                                                        <div className="flex items-center text-green-300">
                                                            <FaUnlock className="mr-1" />
                                                            <span className="text-xs font-orbitron">Public</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-yellow-300">
                                                            <FaLock className="mr-1" />
                                                            <span className="text-xs font-orbitron">Private</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 font-orbitron line-clamp-2">
                                                {quiz.title}
                                            </h3>

                                            <p className="text-pink-200 text-sm mb-4 line-clamp-2 font-orbitron">
                                                {quiz.description || "No description provided."}
                                            </p>

                                            <div className="flex justify-between items-center text-xs text-pink-300 mb-4 font-orbitron">
                                                <div>
                                                    Created: {formatDate(quiz.createdAt)}
                                                </div>
                                                <div>
                                                    By: {quiz.createdBy?.name || quiz.createdBy?.username || "Unknown"}
                                                </div>
                                            </div>

                                            <div className="flex justify-between space-x-2">
                                                <Link
                                                    to={`/quiz/${quiz._id}`}
                                                    className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold rounded-lg font-orbitron flex items-center justify-center hover:from-pink-500 hover:to-yellow-400 transition-colors"
                                                >
                                                    <FiEye className="mr-1" /> View
                                                </Link>

                                                {activeTab === 'myQuizzes' && (
                                                    <>
                                                        <Link
                                                            to={`/edit-quiz/${quiz._id}`}
                                                            className="flex-1 text-center py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg font-orbitron flex items-center justify-center hover:bg-indigo-700 transition-colors"
                                                        >
                                                            <FiEdit className="mr-1" /> Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(quiz)}
                                                            className="flex-1 text-center py-2 px-4 bg-black/80 text-red-400 font-bold rounded-lg font-orbitron flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                                                        >
                                                            <FiTrash2 className="mr-1" /> Delete
                                                        </button>
                                                    </>
                                                )}

                                                {activeTab === 'publicQuizzes' && (
                                                    <Link
                                                        to={`/take-quiz/${quiz._id}`}
                                                        className="flex-1 text-center py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg font-orbitron flex items-center justify-center hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <FiCheckCircle className="mr-1" /> Take Quiz
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
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
                            Are you sure you want to delete the quiz "{selectedQuiz?.title}"? This action cannot be undone.
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

export default QuizListPage;
