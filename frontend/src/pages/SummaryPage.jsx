import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const SummaryPage = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText(''); // Clear text when file is selected
    setError('');
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (e.target.value.trim()) {
      setFile(null); // Clear file when text is entered
    }
  };

  // Simulate loading progress
  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 95) {
        setProgress(95);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 500);
    return interval;
  };

  // Call backend API for summarization
  const summarizeWithGemini = async (isFileUpload = false) => {
    try {
      const { API_BASE_URL } = await import('../config/apiConfig');

      let response;

      if (isFileUpload) {
        // Handle PDF file upload
        const formData = new FormData();
        formData.append('pdfFile', file);
        if (customPrompt.trim()) {
          formData.append('customPrompt', customPrompt.trim());
        }

        response = await fetch(`${API_BASE_URL}/summary/generate-from-pdf`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Handle text input
        response = await fetch(`${API_BASE_URL}/summary/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
            customPrompt: customPrompt.trim() || null,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();

        // Handle quota/rate limit errors specifically
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(`⏰ API quota exceeded. Please wait ${retryAfter} seconds before trying again.\n\n💡 ${errorData.details || 'You have reached the free tier limit.'}`);
        }

        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error calling summary API: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      let isFileUpload = false;

      // Determine input type
      if (file) {
        isFileUpload = true;
        setLoadingStep('📄 Uploading and parsing PDF...');
      } else if (text.trim()) {
        setLoadingStep('📝 Processing text...');
      } else {
        throw new Error('Please provide either text or upload a PDF file');
      }

      if (!isFileUpload && text.trim().length < 50) {
        throw new Error('Text is too short. Please provide at least 50 characters.');
      }

      // Update loading step
      setTimeout(() => {
        setLoadingStep('🤖 Generating AI summary...');
      }, 2000);

      // Generate summary using Gemini
      const result = await summarizeWithGemini(isFileUpload);

      clearInterval(progressInterval);
      setProgress(100);
      setLoadingStep('✅ Complete!');

      setSummary(result.summary);

    } catch (error) {
      clearInterval(progressInterval);
      setError(error.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingStep('');
        setProgress(0);
      }, 1000);
    }
  };

  const clearAll = () => {
    setText('');
    setFile(null);
    setCustomPrompt('');
    setSummary('');
    setError('');
    setLoadingStep('');
    setProgress(0);
  };

  const promptExamples = [
    "Summarize the main points in bullet format",
    "Create a concise summary with key takeaways",
    "Generate 5 multiple-choice quiz questions",
    "Create quiz questions with 4 options each",
    "Summarize in simple language and add practice questions"
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="flex-grow-1 my-4">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg p-3 mb-5 bg-white rounded">
              <Card.Body>
                <Card.Title as="h2" className="mb-4 text-center">🤖 AI Study Helper</Card.Title>
                <Card.Text className="mb-4 text-center text-muted">
                  Generate concise summaries or educational quiz questions from your text or PDF documents.
                </Card.Text>

                {/* Information callout about capabilities */}
                <Alert variant="info" className="mb-4">
                  <strong>ℹ️ Tool Capabilities:</strong>
                  <ul className="mb-0 mt-1">
                    <li>Generate summaries to capture key points from your documents</li>
                    <li>Create educational quiz questions with multiple-choice answers</li>
                    <li>This tool cannot write stories, poems, or generate inappropriate content</li>
                  </ul>
                </Alert>

                {error && (
                  <Alert variant={error.includes('quota exceeded') || error.includes('API quota') ? 'warning' : 'danger'} className="mb-4">
                    <div style={{ whiteSpace: 'pre-line' }}>
                      <strong>{error.includes('quota exceeded') || error.includes('API quota') ? '⚠️ Quota Limit:' : '❌ Error:'}</strong> {error}
                    </div>
                    {(error.includes('quota exceeded') || error.includes('API quota')) && (
                      <>
                        <hr />
                        <small>
                          <strong>💡 Tips:</strong>
                          <ul className="mb-0 mt-2">
                            <li>Wait a few minutes before trying again</li>
                            <li>Try shorter text to reduce token usage</li>
                            <li>Consider upgrading to paid plan for higher limits</li>
                          </ul>
                        </small>
                      </>
                    )}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Text Input Section - Moved to top */}
                  <Form.Group className="mb-4" controlId="summaryText">
                    <Form.Label as="h5">📝 Paste or Write Your Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Enter or paste your text here..."
                      style={{ fontSize: '1.1rem', padding: '1.2rem', minHeight: '220px', resize: 'vertical' }}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Minimum 50 characters required
                    </Form.Text>
                  </Form.Group>

                  {/* File Upload Section */}
                  <div className="mb-4">
                    <Form.Label as="h5">📄 Upload PDF (Alternative to text)</Form.Label>
                    <div className="p-4 border rounded bg-light text-center">
                      <Form.Control
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: 'inline-block', width: 'auto' }}
                        disabled={loading}
                      />
                      {file && (
                        <div className="mt-2 text-success">
                          <strong>Selected:</strong> {file.name}
                        </div>
                      )}
                      <div className="text-muted mt-2" style={{ fontSize: '0.95rem' }}>
                        <strong>Supported:</strong> PDF files (max 10MB)<br />
                        <small>📋 Large PDFs will be automatically truncated to prevent quota issues</small>
                      </div>
                    </div>
                  </div>

                  {/* Custom Prompt Section - Moved after file upload */}
                  <Form.Group className="mb-4" controlId="customPrompt">
                    <Form.Label as="h5">⚙️ Instructions (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., 'Summarize with bullet points' or 'Generate 5 quiz questions with 4 options each'"
                      style={{ fontSize: '1rem', padding: '1rem' }}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      <strong>You can request:</strong> Summaries or educational quiz questions.
                      <div className="mt-2">
                        {promptExamples.map((example, index) => (
                          <Button
                            key={index}
                            variant="outline-secondary"
                            size="sm"
                            className="me-2 mb-2"
                            onClick={() => setCustomPrompt(example)}
                            disabled={loading}
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-2 mb-4">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      className="flex-grow-1"
                      disabled={loading || (!text.trim() && !file)}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          {loadingStep || 'Processing...'}
                        </>
                      ) : (
                        '🚀 Generate Summary or Quiz Questions'
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={clearAll}
                      disabled={loading}
                    >
                      🗑️ Clear
                    </Button>
                  </div>

                  {/* Error Display - Moved below buttons */}
                  {error && (
                    <Alert variant={error.includes('quota exceeded') || error.includes('API quota') ? 'warning' : 'danger'} className="mb-4">
                      <div style={{ whiteSpace: 'pre-line' }}>
                        <strong>{error.includes('quota exceeded') || error.includes('API quota') ? '⚠️ Quota Limit:' : '❌ Error:'}</strong> {error}
                      </div>
                      {(error.includes('quota exceeded') || error.includes('API quota')) && (
                        <>
                          <hr />
                          <small>
                            <strong>💡 Tips:</strong>
                            <ul className="mb-0 mt-2">
                              <li>Wait a few minutes before trying again</li>
                              <li>Try shorter text to reduce token usage</li>
                              <li>For PDFs: Use smaller files or single pages</li>
                              <li>Consider upgrading to paid plan for higher limits</li>
                            </ul>
                          </small>
                        </>
                      )}
                    </Alert>
                  )}
                </Form>

                {/* Loading Progress */}
                {loading && (
                  <Card className="mt-4 border-primary">
                    <Card.Body className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-3">
                        <Spinner animation="border" variant="primary" className="me-3" />
                        <div>
                          <h5 className="mb-1 text-primary">{loadingStep}</h5>
                          <small className="text-muted">
                            Processing your request with AI...
                          </small>
                        </div>
                      </div>
                      <ProgressBar
                        now={progress}
                        animated
                        striped
                        variant="primary"
                        className="mb-2"
                        style={{ height: '10px' }}
                      />
                      <small className="text-muted">
                        ⏱️ This process takes 5-15 seconds to ensure quality results and prevent spam
                      </small>
                    </Card.Body>
                  </Card>
                )}

                {/* Summary Result */}
                {summary && (
                  <Card className="mt-4 border-success">
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">✨ AI Generated Summary</h5>
                    </Card.Header>
                    <Card.Body>
                      {/* Show PDF truncation warning if applicable */}
                      {summary.wasTruncated && (
                        <Alert variant="info" className="mb-3">
                          <small>
                            📄 <strong>Note:</strong> This PDF was large and has been automatically truncated to prevent quota issues.
                            The summary covers the first ~8,000 characters of the document.
                          </small>
                        </Alert>
                      )}

                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1rem' }}>
                        {summary.content || summary}
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          🤖 Generated using Gemini AI • {new Date().toLocaleString()}
                        </small>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(summary.content || summary)}
                          >
                            📋 Copy
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([summary.content || summary], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `summary_${new Date().toISOString().split('T')[0]}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            💾 Download
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default SummaryPage;
