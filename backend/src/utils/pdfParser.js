const fs = require('fs');

class SimplePDFParser {
    static async extractText(buffer) {
        try {
            // Convert buffer to string and look for text patterns
            const pdfString = buffer.toString('binary');

            // Simple text extraction using regex patterns
            const textMatches = [];

            // Pattern 1: Look for text objects in PDF
            const streamPattern = /stream\s*(.*?)\s*endstream/gs;
            const matches = pdfString.matchAll(streamPattern);

            for (const match of matches) {
                const streamContent = match[1];
                // Try to extract readable text
                const textPattern = /\((.*?)\)/g;
                const textMatches2 = streamContent.matchAll(textPattern);

                for (const textMatch of textMatches2) {
                    const text = textMatch[1];
                    if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
                        textMatches.push(text);
                    }
                }
            }

            // Pattern 2: Look for direct text content
            const directTextPattern = /\[(.*?)\]/g;
            const directMatches = pdfString.matchAll(directTextPattern);

            for (const match of directMatches) {
                const text = match[1];
                if (text && text.length > 2 && /[a-zA-Z]/.test(text)) {
                    textMatches.push(text);
                }
            }

            // Pattern 3: Look for BT...ET blocks (text objects)
            const btPattern = /BT\s*(.*?)\s*ET/gs;
            const btMatches = pdfString.matchAll(btPattern);

            for (const match of btMatches) {
                const content = match[1];
                // Extract text from Tj commands
                const tjPattern = /\((.*?)\)\s*Tj/g;
                const tjMatches = content.matchAll(tjPattern);

                for (const tjMatch of tjMatches) {
                    const text = tjMatch[1];
                    if (text && text.length > 1) {
                        textMatches.push(text);
                    }
                }

                // Extract text from TJ arrays
                const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
                const tjArrayMatches = content.matchAll(tjArrayPattern);

                for (const tjArrayMatch of tjArrayMatches) {
                    const arrayContent = tjArrayMatch[1];
                    const textInArray = /\((.*?)\)/g;
                    const arrayTextMatches = arrayContent.matchAll(textInArray);

                    for (const arrayTextMatch of arrayTextMatches) {
                        const text = arrayTextMatch[1];
                        if (text && text.length > 1) {
                            textMatches.push(text);
                        }
                    }
                }
            }

            // Clean and join extracted text
            let extractedText = textMatches
                .map(text => text.trim())
                .filter(text => text.length > 0)
                .join(' ');

            // Basic cleanup
            extractedText = extractedText
                .replace(/\\n/g, ' ')
                .replace(/\\r/g, ' ')
                .replace(/\\t/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (extractedText.length < 50) {
                throw new Error('Could not extract enough text from PDF. The PDF might be image-based or encrypted.');
            }

            // Limit text length to prevent quota issues (max ~8000 characters for free tier)
            const MAX_TEXT_LENGTH = 8000;
            if (extractedText.length > MAX_TEXT_LENGTH) {
                console.log(`PDF text length: ${extractedText.length}, truncating to ${MAX_TEXT_LENGTH}`);
                extractedText = extractedText.substring(0, MAX_TEXT_LENGTH) + '\n\n[Text truncated due to length limit - upgrade API plan for full content processing]';
            }

            return extractedText;

        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF: ' + error.message);
        }
    }

    static isValidPDF(buffer) {
        // Check PDF header
        const header = buffer.slice(0, 8).toString();
        return header.startsWith('%PDF-');
    }
}

module.exports = SimplePDFParser;
