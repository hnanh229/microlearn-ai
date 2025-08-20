import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { FaGamepad, FaStar, FaEdit } from "react-icons/fa";
import quizService from "../services/quizService";
import toast from "react-hot-toast";

const EditQuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Other",
        isPublic: false,
        questions: [],
    });
    const [errors, setErrors] = useState({});
    const [originalQuiz, setOriginalQuiz] = useState(null);

    const categories = [
        "General Knowledge",
        "Science",
        "History",
        "Geography",
        "Mathematics",
        "Literature",
        "Sports",
        "Entertainment",
        "Technology",
        "Other",
    ];

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const quizData = await quizService.getQuizById(id);
            setOriginalQuiz(quizData);

            // Format quiz data for the form
            setFormData({
                title: quizData.title,
                description: quizData.description || "",
                category: quizData.category,
                isPublic: quizData.isPublic,
                questions: quizData.questions.map(q => ({
                    _id: q._id,
                    text: q.content,
                    options: q.options.map(opt => ({
                        text: opt.label,
                        isCorrect: opt.isCorrect,
                    })),
                })),
            });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz. Please try again later.');
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate title
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        // Validate description
        if (formData.description.length > 500) {
            newErrors.description = "Description must not exceed 500 characters";
        }

        // Validate questions
        formData.questions.forEach((question, qIndex) => {
            if (!question.text.trim()) {
                newErrors[`question_${qIndex}`] = "Question is required";
            }

            // Validate options
            let hasCorrectAnswer = false;
            question.options.forEach((option, oIndex) => {
                if (!option.text.trim()) {
                    newErrors[`option_${qIndex}_${oIndex}`] = "Option is required";
                }
                if (option.isCorrect) hasCorrectAnswer = true;
            });

            if (!hasCorrectAnswer) {
                newErrors[`question_${qIndex}_correct`] =
                    "Each question must have at least one correct answer";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleQuestionChange = (index, field, value) => {
        setFormData((prev) => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = {
                ...newQuestions[index],
                [field]: value,
            };
            return {
                ...prev,
                questions: newQuestions,
            };
        });
        // Clear error when user starts typing
        if (errors[`question_${index}`]) {
            setErrors((prev) => ({ ...prev, [`question_${index}`]: null }));
        }
    };

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        setFormData((prev) => {
            const newQuestions = [...prev.questions];

            // If changing isCorrect to true, set all others to false
            if (field === "isCorrect" && value === true) {
                newQuestions[questionIndex].options.forEach((option, idx) => {
                    option.isCorrect = idx === optionIndex;
                });
            } else {
                newQuestions[questionIndex].options[optionIndex] = {
                    ...newQuestions[questionIndex].options[optionIndex],
                    [field]: value,
                };
            }

            return {
                ...prev,
                questions: newQuestions,
            };
        });
        // Clear error when user starts typing
        if (errors[`option_${questionIndex}_${optionIndex}`]) {
            setErrors((prev) => ({
                ...prev,
                [`option_${questionIndex}_${optionIndex}`]: null,
            }));
        }
    };

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: "",
                    options: [
                        { text: "", isCorrect: true },
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                    ],
                },
            ],
        }));
    };

    const removeQuestion = (index) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please check all required fields");
            return;
        }

        setSaving(true);
        try {
            // Format data to match server requirements
            const formattedData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                isPublic: formData.isPublic,
                questions: formData.questions.map((question) => ({
                    _id: question._id, // Include original ID if it exists
                    content: question.text,
                    options: question.options.map((option) => ({
                        label: option.text,
                        isCorrect: option.isCorrect,
                    })),
                })),
            };

            const response = await quizService.updateQuiz(id, formattedData);
            toast.success("Quiz updated successfully!");
            navigate(`/quiz/${id}`);
        } catch (error) {
            console.error("Error updating quiz:", error);
            // Display detailed error message from server
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "An error occurred while updating the quiz. Please try again later.";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-8 relative overflow-hidden">
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

            <div className="relative min-h-screen flex items-center justify-center p-4 w-full z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-3xl"
                >
                    <div className="bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-shadow duration-500">
                        <div className="p-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center mb-10"
                            >
                                <h1 className="text-4xl md:text-5xl font-extrabold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg mb-2 flex items-center justify-center gap-3">
                                    <FaEdit className="inline-block text-yellow-300 animate-bounce" />
                                    Edit Quiz
                                    <FaStar className="inline-block text-pink-300 animate-spin-slow" />
                                </h1>
                                <p className="text-lg text-pink-200 font-orbitron tracking-wide drop-shadow">Update your quiz content and settings</p>
                            </motion.div>

                            <form onSubmit={handleSubmit}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="mb-6"
                                >
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-bold text-pink-200 mb-2 font-orbitron tracking-wide"
                                        style={{ color: '#ffe259' }}
                                    >
                                        Quiz Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg bg-black/60 text-white placeholder:text-pink-200 focus:ring-2 focus:ring-yellow-400 transition-colors shadow-lg ${errors.title
                                                ? "border-red-500 focus:ring-red-200"
                                                : "border-pink-400 focus:border-yellow-400"
                                            }`}
                                        placeholder="Enter a title for your quiz"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-400 font-orbitron">{errors.title}</p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="mb-6"
                                >
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-bold text-pink-200 mb-2 font-orbitron tracking-wide"
                                        style={{ color: '#ffe259' }}
                                    >
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg bg-black/60 text-white placeholder:text-pink-200 focus:ring-2 focus:ring-yellow-400 transition-colors shadow-lg ${errors.description
                                                ? "border-red-500 focus:ring-red-200"
                                                : "border-pink-400 focus:border-yellow-400"
                                            }`}
                                        placeholder="Describe what this quiz is about"
                                    ></textarea>
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-400 font-orbitron">
                                            {errors.description}
                                        </p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="mb-6"
                                >
                                    <label
                                        htmlFor="category"
                                        className="block text-sm font-bold text-pink-200 mb-2 font-orbitron tracking-wide"
                                        style={{ color: '#ffe259' }}
                                    >
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-pink-400 rounded-xl font-orbitron text-lg bg-black/60 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 transition-colors shadow-lg"
                                    >
                                        {categories.map((category) => (
                                            <option key={category} value={category} className="bg-black/80">
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="mb-8"
                                >
                                    <label className="flex items-center font-orbitron text-pink-200">
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-pink-400 rounded shadow"
                                        />
                                        <span className="ml-2">Make this quiz public</span>
                                    </label>
                                    <p className="text-sm text-pink-300 mt-1 ml-6 font-orbitron">
                                        Public quizzes can be viewed and taken by everyone
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                    className="mb-8"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold font-orbitron text-yellow-400 drop-shadow">Questions</h2>
                                    </div>

                                    {formData.questions.map((question, questionIndex) => (
                                        <motion.div
                                            key={questionIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.1 * questionIndex }}
                                            className="mb-6 p-6 bg-gradient-to-br from-black/70 via-indigo-900/60 to-pink-900/60 rounded-2xl shadow-xl border-2 border-pink-400/40"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-bold font-orbitron text-pink-200">Question {questionIndex + 1}</h3>
                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(questionIndex)}
                                                        className="text-red-400 hover:text-red-600 font-orbitron flex items-center space-x-1 transition drop-shadow-glow"
                                                    >
                                                        <FiTrash2 className="w-5 h-5 animate-pulse" />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-pink-200 mb-2 font-orbitron" style={{ color: '#ffe259' }}>Question Content</label>
                                                <input
                                                    type="text"
                                                    value={question.text}
                                                    onChange={(e) =>
                                                        handleQuestionChange(
                                                            questionIndex,
                                                            "text",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`w-full px-4 py-3 border-2 rounded-xl font-orbitron text-lg bg-black/60 text-white placeholder:text-pink-200 focus:ring-2 focus:ring-yellow-400 transition-colors shadow-lg ${errors[`question_${questionIndex}`]
                                                            ? "border-red-500 focus:ring-red-200"
                                                            : "border-pink-400 focus:border-yellow-400"
                                                        }`}
                                                    placeholder="Enter your question"
                                                />
                                                {errors[`question_${questionIndex}`] && (
                                                    <p className="mt-1 text-sm text-red-400 font-orbitron">
                                                        {errors[`question_${questionIndex}`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-sm font-bold text-pink-200 mb-2 font-orbitron" style={{ color: '#ffe259' }}>Options (Select the correct one)</label>
                                                {question.options.map((option, optionIndex) => (
                                                    <div
                                                        key={optionIndex}
                                                        className="flex items-center space-x-3"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${questionIndex}`}
                                                            checked={option.isCorrect}
                                                            onChange={() => {
                                                                handleOptionChange(
                                                                    questionIndex,
                                                                    optionIndex,
                                                                    "isCorrect",
                                                                    true
                                                                );
                                                            }}
                                                            className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-pink-400"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) =>
                                                                handleOptionChange(
                                                                    questionIndex,
                                                                    optionIndex,
                                                                    "text",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`flex-1 px-4 py-3 border-2 rounded-xl font-orbitron text-lg bg-black/60 text-white placeholder:text-pink-200 focus:ring-2 focus:ring-yellow-400 transition-colors shadow-lg ${errors[`option_${questionIndex}_${optionIndex}`]
                                                                    ? "border-red-500 focus:ring-red-200"
                                                                    : "border-pink-400 focus:border-yellow-400"
                                                                }`}
                                                            placeholder={`Option ${optionIndex + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                                {errors[`question_${questionIndex}_correct`] && (
                                                    <p className="mt-1 text-sm text-red-400 font-orbitron">
                                                        {errors[`question_${questionIndex}_correct`]}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="px-6 py-2 font-orbitron rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white shadow-lg border-2 border-white/30 hover:from-pink-400 hover:to-yellow-400 transition-all text-lg drop-shadow-glow hover:scale-105 active:scale-95 animate-pulse-slow"
                                        >
                                            <FiPlus className="w-5 h-5 inline-block mr-2 align-middle animate-bounce text-yellow-200" />
                                            <span>Add Question</span>
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="flex space-x-4 mt-8"
                                >
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-4 px-6 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-bold rounded-2xl shadow-xl border-2 border-white/30 hover:from-pink-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-xl drop-shadow-glow hover:scale-105 active:scale-95 animate-pulse-slow"
                                    >
                                        {saving ? (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-2 justify-center"><FiSave className="inline-block text-yellow-300" />Save Changes</span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/quiz/${id}`)}
                                        className="flex-1 py-4 px-6 font-orbitron bg-black/60 text-pink-200 font-bold rounded-2xl border-2 border-pink-400 hover:bg-pink-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 shadow-xl text-xl"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EditQuizPage;
