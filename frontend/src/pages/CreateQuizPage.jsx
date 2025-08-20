import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiUpload, FiFileText, FiCpu } from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import quizService from "../services/quizService";
import toast from "react-hot-toast";
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const CreateQuizPage = () => {
    const [activeTab, setActiveTab] = useState("manual");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Other",
        isPublic: false,
        questions: [
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
    });

    // File upload states
    const [pdfFile, setPdfFile] = useState(null);
    const [textFile, setTextFile] = useState(null);
    const [aiText, setAiText] = useState("");

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

        // Only validate questions for manual creation
        if (activeTab === "manual") {
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
        } else if (activeTab === "pdf") {
            if (!pdfFile) {
                newErrors.pdfFile = "PDF file is required";
            }
        } else if (activeTab === "text") {
            if (!textFile) {
                newErrors.textFile = "Text file is required";
            }
        } else if (activeTab === "ai") {
            if (!aiText.trim()) {
                newErrors.aiText = "Text content is required";
            }
        }

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

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'pdf') {
            if (file && file.type === 'application/pdf') {
                setPdfFile(file);
                setErrors(prev => ({ ...prev, pdfFile: null }));
            } else {
                setPdfFile(null);
                setErrors(prev => ({ ...prev, pdfFile: "Please upload a valid PDF file" }));
            }
        } else if (type === 'text') {
            if (file && file.type === 'text/plain') {
                setTextFile(file);
                setErrors(prev => ({ ...prev, textFile: null }));
            } else {
                setTextFile(null);
                setErrors(prev => ({ ...prev, textFile: "Please upload a valid text file" }));
            }
        }
    };

    const handleAITextChange = (e) => {
        setAiText(e.target.value);
        if (errors.aiText) {
            setErrors(prev => ({ ...prev, aiText: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please check all required fields");
            return;
        }

        setLoading(true);
        try {
            let response;

            if (activeTab === "manual") {
                // Format data to match server requirements for manual creation
                const formattedData = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    isPublic: formData.isPublic,
                    questions: formData.questions.map((question) => ({
                        content: question.text,
                        options: question.options.map((option) => ({
                            label: option.text,
                            isCorrect: option.isCorrect,
                        })),
                    })),
                };

                response = await quizService.createQuiz(formattedData);
            } else if (activeTab === "pdf") {
                // Create FormData for PDF upload
                const formDataObj = new FormData();
                formDataObj.append("title", formData.title);
                formDataObj.append("description", formData.description);
                formDataObj.append("category", formData.category);
                formDataObj.append("isPublic", formData.isPublic);
                formDataObj.append("pdfFile", pdfFile);

                response = await quizService.createQuizFromPDF(formDataObj);
            } else if (activeTab === "text") {
                // Create FormData for text file upload
                const formDataObj = new FormData();
                formDataObj.append("title", formData.title);
                formDataObj.append("description", formData.description);
                formDataObj.append("category", formData.category);
                formDataObj.append("isPublic", formData.isPublic);
                formDataObj.append("textFile", textFile);

                response = await quizService.createQuizFromTextFile(formDataObj);
            } else if (activeTab === "ai") {
                // Format data for AI-generated quiz
                const aiData = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    isPublic: formData.isPublic,
                    text: aiText,
                };

                response = await quizService.createQuizWithAI(aiData);
            }

            toast.success("Quiz created successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error creating quiz:", error);
            // Display detailed error message from server
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "An error occurred while creating the quiz. Please try again later.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <Container className="flex-grow-1 my-4">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <Card className="shadow-lg p-3 mb-5 bg-white rounded">
                            <Card.Body>
                                <Card.Title as="h2" className="mb-4 text-center">🎮 Create New Quiz</Card.Title>
                                <Card.Text className="mb-4 text-center text-muted">
                                    Create a quiz using various methods
                                </Card.Text>

                                {/* Tab navigation */}
                                <ul className="nav nav-tabs mb-4">
                                    <li className="nav-item">
                                        <button
                                            onClick={() => setActiveTab("manual")}
                                            className={`nav-link ${activeTab === "manual" ? "active" : ""}`}
                                        >
                                            <FiPlus className="me-2" />
                                            Manual
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            onClick={() => setActiveTab("pdf")}
                                            className={`nav-link ${activeTab === "pdf" ? "active" : ""}`}
                                        >
                                            <FiUpload className="me-2" />
                                            PDF
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            onClick={() => setActiveTab("text")}
                                            className={`nav-link ${activeTab === "text" ? "active" : ""}`}
                                        >
                                            <FiFileText className="me-2" />
                                            Text File
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            onClick={() => setActiveTab("ai")}
                                            className={`nav-link ${activeTab === "ai" ? "active" : ""}`}
                                        >
                                            <FiCpu className="me-2" />
                                            AI Generator
                                        </button>
                                    </li>
                                </ul>

                                <Form onSubmit={handleSubmit}>
                                    {/* Common form fields for all tabs */}
                                    <Form.Group className="mb-3" controlId="title">
                                        <Form.Label>Quiz Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter a title for your quiz"
                                            isInvalid={!!errors.title}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.title}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="description">
                                        <Form.Label>Description (Optional)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe what this quiz is about"
                                            isInvalid={!!errors.description}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.description}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="category">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="isPublic">
                                        <Form.Check
                                            type="checkbox"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            label="Make this quiz public"
                                        />
                                        <Form.Text className="text-muted">
                                            Public quizzes can be viewed and taken by everyone
                                        </Form.Text>
                                    </Form.Group>

                                    {/* Tab-specific content */}
                                    {activeTab === "manual" && (
                                        <div className="mb-4">
                                            <h5 className="mb-3">Questions</h5>

                                            {formData.questions.map((question, questionIndex) => (
                                                <Card key={questionIndex} className="mb-3 bg-light">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <h6>Question {questionIndex + 1}</h6>
                                                            {formData.questions.length > 1 && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => removeQuestion(questionIndex)}
                                                                >
                                                                    <FiTrash2 className="me-1" />
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Question Content</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={question.text}
                                                                onChange={(e) =>
                                                                    handleQuestionChange(
                                                                        questionIndex,
                                                                        "text",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter your question"
                                                                isInvalid={!!errors[`question_${questionIndex}`]}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors[`question_${questionIndex}`]}
                                                            </Form.Control.Feedback>
                                                        </Form.Group>

                                                        <Form.Label>Options (Select the correct one)</Form.Label>
                                                        {question.options.map((option, optionIndex) => (
                                                            <div key={optionIndex} className="mb-2">
                                                                <div className="d-flex align-items-center">
                                                                    <Form.Check
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
                                                                        className="me-2"
                                                                    />
                                                                    <Form.Control
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
                                                                        placeholder={`Option ${optionIndex + 1}`}
                                                                        isInvalid={!!errors[`option_${questionIndex}_${optionIndex}`]}
                                                                    />
                                                                </div>
                                                                {errors[`option_${questionIndex}_${optionIndex}`] && (
                                                                    <div className="text-danger small mt-1">
                                                                        {errors[`option_${questionIndex}_${optionIndex}`]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {errors[`question_${questionIndex}_correct`] && (
                                                            <div className="text-danger small mt-1">
                                                                {errors[`question_${questionIndex}_correct`]}
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                            <div className="d-flex justify-content-end">
                                                <Button
                                                    variant="primary"
                                                    onClick={addQuestion}
                                                >
                                                    <FiPlus className="me-1" />
                                                    Add Question
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "pdf" && (
                                        <div className="mb-4">
                                            <Card className="bg-light">
                                                <Card.Body>
                                                    <h5 className="mb-3">Upload PDF</h5>
                                                    <p className="text-muted mb-3">
                                                        Upload a PDF file and our AI will generate quiz questions from its content.
                                                    </p>
                                                    <Form.Group>
                                                        <Form.Label>PDF File</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => handleFileChange(e, 'pdf')}
                                                            isInvalid={!!errors.pdfFile}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.pdfFile}
                                                        </Form.Control.Feedback>
                                                        {pdfFile && (
                                                            <div className="text-success mt-2">
                                                                Selected file: {pdfFile.name}
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    {activeTab === "text" && (
                                        <div className="mb-4">
                                            <Card className="bg-light">
                                                <Card.Body>
                                                    <h5 className="mb-3">Upload Text File</h5>
                                                    <p className="text-muted mb-3">
                                                        Upload a .txt file and our AI will generate quiz questions from its content.
                                                    </p>
                                                    <Form.Group>
                                                        <Form.Label>Text File (.txt)</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept=".txt"
                                                            onChange={(e) => handleFileChange(e, 'text')}
                                                            isInvalid={!!errors.textFile}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.textFile}
                                                        </Form.Control.Feedback>
                                                        {textFile && (
                                                            <div className="text-success mt-2">
                                                                Selected file: {textFile.name}
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    {activeTab === "ai" && (
                                        <div className="mb-4">
                                            <Card className="bg-light">
                                                <Card.Body>
                                                    <h5 className="mb-3">AI Quiz Generator</h5>
                                                    <p className="text-muted mb-3">
                                                        Paste your text content and our AI will generate quiz questions from it.
                                                    </p>
                                                    <Form.Group>
                                                        <Form.Label>Text Content</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={8}
                                                            value={aiText}
                                                            onChange={handleAITextChange}
                                                            placeholder="Paste your text content here..."
                                                            isInvalid={!!errors.aiText}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.aiText}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mt-4">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="flex-grow-1"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <FaGamepad className="me-2" /> Create Quiz
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate("/dashboard")}
                                            className="flex-grow-1"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    );
};

export default CreateQuizPage;
