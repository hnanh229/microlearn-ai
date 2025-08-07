import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const SummaryPage = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submit logic here
    alert('Submitted!');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="flex-grow-1 my-4">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg p-3 mb-5 bg-white rounded">
              <Card.Body>
                <Card.Title as="h2" className="mb-4 text-center">AI Knowledge Summary</Card.Title>
                <Card.Text className="mb-4 text-center text-muted">
                  Use AI to summarize knowledge from your text, PDF documents, or pictures of text. Paste your text, or upload a PDF/image to get a concise summary.
                </Card.Text>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="summaryText">
                    <Form.Label as="h5">Paste or Write Your Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter or paste your text here..."
                      style={{ fontSize: '1.1rem', padding: '1.2rem', minHeight: '220px', resize: 'vertical' }}
                    />
                  </Form.Group>
                  <div className="mb-4">
                    <Form.Label as="h5">Upload PDF or Image</Form.Label>
                    <div className="p-4 border rounded bg-light text-center">
                      <Form.Control
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        style={{ display: 'inline-block', width: 'auto' }}
                      />
                      {file && <div className="mt-2 text-success">Selected: {file.name}</div>}
                      <div className="text-muted mt-2" style={{ fontSize: '0.95rem' }}>
                        Supported formats: PDF, JPG, PNG, etc.
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" type="submit" size="lg" className="w-100 mt-2">
                    Submit
                  </Button>
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

export default SummaryPage;
