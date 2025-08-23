import api from '../config/apiConfig';

// Create a new quiz
export const createQuiz = async (quizData) => {
    try {
        const response = await api.post('/quizzes', quizData);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

// Get all quizzes for the current user
export const getUserQuizzes = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append('search', filters.search);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);

        const response = await api.get(`/quizzes?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        throw error;
    }
};

// Get public quizzes
export const getPublicQuizzes = async () => {
    try {
        const response = await api.get('/quizzes/public');
        return response.data;
    } catch (error) {
        console.error('Error fetching public quizzes:', error);
        throw error;
    }
};

// Get a single quiz by ID
export const getQuizById = async (quizId) => {
    try {
        const response = await api.get(`/quizzes/${quizId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching quiz with ID ${quizId}:`, error);
        throw error;
    }
};

// Update a quiz
export const updateQuiz = async (quizId, quizData) => {
    try {
        const response = await api.put(`/quizzes/${quizId}`, quizData);
        return response.data;
    } catch (error) {
        console.error(`Error updating quiz with ID ${quizId}:`, error);
        throw error;
    }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
    try {
        const response = await api.delete(`/quizzes/${quizId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting quiz with ID ${quizId}:`, error);
        throw error;
    }
};

// Submit answers to a quiz
export const submitQuizAnswers = async (quizId, answers) => {
    try {
        const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
        return response.data;
    } catch (error) {
        console.error(`Error submitting answers for quiz ${quizId}:`, error);
        throw error;
    }
};

// Get submissions for a quiz
export const getQuizSubmissions = async (quizId) => {
    try {
        const response = await api.get(`/quizzes/${quizId}/submissions`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching submissions for quiz ${quizId}:`, error);
        throw error;
    }
};

// Create a quiz from PDF file
export const createQuizFromPDF = async (formData) => {
    try {
        const response = await api.post('/quizzes/upload/pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating quiz from PDF:', error);
        throw error;
    }
};

// Create a quiz from text file
export const createQuizFromTextFile = async (formData) => {
    try {
        const response = await api.post('/quizzes/upload/text', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating quiz from text file:', error);
        throw error;
    }
};

// Create a quiz with AI
export const createQuizWithAI = async (data) => {
    try {
        const response = await api.post('/quizzes/ai', data);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz with AI:', error);
        throw error;
    }
};

const quizService = {
    createQuiz,
    getUserQuizzes,
    getPublicQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuizAnswers,
    getQuizSubmissions,
    createQuizFromPDF,
    createQuizFromTextFile,
    createQuizWithAI,
};

export default quizService;
