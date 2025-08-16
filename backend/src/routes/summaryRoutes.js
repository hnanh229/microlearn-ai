const express = require('express');
const multer = require('multer');
const SimplePDFParser = require('../utils/pdfParser');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Route to generate summary using Gemini AI with text input
router.post('/generate', async (req, res) => {
    try {
        const { text, customPrompt } = req.body;

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                error: 'Text is required and must be at least 50 characters long'
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key is not configured on the server'
            });
        }

        // Import Gemini AI library
        const { GoogleGenerativeAI } = require('@google/generative-ai');

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create prompt for summarization
        let prompt;
        if (customPrompt && customPrompt.trim()) {
            prompt = `${customPrompt.trim()}

Text to process:
${text}`;
        } else {
            prompt = `Please provide a comprehensive summary of the following text. 
The summary should:
1. Capture the main ideas and key points
2. Be well-structured and easy to understand
3. Include important details while being concise
4. Use bullet points or numbered lists when appropriate

Text to summarize:
${text}`;
        }

        // Add artificial delay to prevent spam (5-10 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000));

        // Generate summary
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        res.json({
            success: true,
            summary: summary,
            originalLength: text.length,
            summaryLength: summary.length,
            usedCustomPrompt: !!(customPrompt && customPrompt.trim())
        });

    } catch (error) {
        console.error('Error generating summary:', error);

        // Handle specific API errors
        if (error.message.includes('API_KEY_INVALID')) {
            return res.status(401).json({
                error: 'Invalid Gemini API key. Please check your configuration.'
            });
        }

        if (error.message.includes('QUOTA_EXCEEDED') || error.status === 429) {
            return res.status(429).json({
                error: 'API quota exceeded. Please wait a few minutes before trying again.',
                details: 'You have reached the free tier limit. Please try again later or consider upgrading your plan.',
                retryAfter: 60 // seconds
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Too many requests. Please wait before trying again.',
                details: 'Rate limit exceeded. Free tier allows limited requests per minute.',
                retryAfter: 60
            });
        }

        res.status(500).json({
            error: 'Failed to generate summary. Please try again.',
            details: error.message
        });
    }
});

// Route to handle PDF file upload and summarization
router.post('/generate-from-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        const { customPrompt } = req.body;

        if (!req.file) {
            return res.status(400).json({
                error: 'PDF file is required'
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key is not configured on the server'
            });
        }

        // Validate PDF file
        if (!SimplePDFParser.isValidPDF(req.file.buffer)) {
            return res.status(400).json({
                error: 'Invalid PDF file format'
            });
        }

        // Extract text from PDF
        const extractedText = await SimplePDFParser.extractText(req.file.buffer);

        if (extractedText.length < 50) {
            return res.status(400).json({
                error: 'Could not extract enough text from PDF. The PDF might be image-based or encrypted.'
            });
        }

        // Import Gemini AI library
        const { GoogleGenerativeAI } = require('@google/generative-ai');

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create prompt for summarization
        let prompt;
        if (customPrompt && customPrompt.trim()) {
            prompt = `${customPrompt.trim()}

Text extracted from PDF to process:
${extractedText}`;
        } else {
            prompt = `Please provide a comprehensive summary of the following text extracted from a PDF document. 
The summary should:
1. Capture the main ideas and key points
2. Be well-structured and easy to understand
3. Include important details while being concise
4. Use bullet points or numbered lists when appropriate

Text to summarize:
${extractedText}`;
        }

        // Add artificial delay to prevent spam (5-10 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000));

        // Generate summary
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        res.json({
            success: true,
            summary: summary,
            originalLength: extractedText.length,
            summaryLength: summary.length,
            extractedText: extractedText.substring(0, 500) + '...', // Preview of extracted text
            fileName: req.file.originalname,
            usedCustomPrompt: !!(customPrompt && customPrompt.trim()),
            wasTruncated: extractedText.includes('[Text truncated due to length limit')
        });

    } catch (error) {
        console.error('Error processing PDF:', error);

        // Handle specific API errors
        if (error.message.includes('API_KEY_INVALID')) {
            return res.status(401).json({
                error: 'Invalid Gemini API key. Please check your configuration.'
            });
        }

        if (error.message.includes('QUOTA_EXCEEDED') || error.status === 429) {
            return res.status(429).json({
                error: 'API quota exceeded. Please wait a few minutes before trying again.',
                details: 'You have reached the free tier limit. Please try again later or consider upgrading your plan.',
                retryAfter: 60 // seconds
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Too many requests. Please wait before trying again.',
                details: 'Rate limit exceeded. Free tier allows limited requests per minute.',
                retryAfter: 60
            });
        }

        res.status(500).json({
            error: 'Failed to process PDF and generate summary.',
            details: error.message
        });
    }
});

module.exports = router;
