# 🎓 MicroLearn AI

AI-powered learning platform.

## 🌐 Live Demo

**🚀 [Try MicroLearn AI Here](https://hnanh229.github.io/microlearn-ai)**

*Test the MicroLearn AI features directly in your browser!*

---

## ✨ Features

- 🤖 **AI-Powered Summarization** - Intelligent content summarization using Google Gemini AI
- 📄 **PDF Processing** - Upload and summarize PDF documents automatically
- 📝 **Text Summarization** - Paste or type text for instant AI analysis
- 💭 **Custom Prompts** - Personalize your summaries with custom instructions
- 🔐 **User Authentication** - Secure login and registration system
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- ⚡ **Fast Processing** - Optimized for quick AI responses
- 🛡️ **Quota Management** - Smart handling of API limits and large documents

---

## 🛠️ Technology Stack

### Frontend
- **React 19** + **Vite** - Modern development setup
- **Material-UI** + **Bootstrap** - Beautiful, responsive UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Cloudinary** - Cloud image storage and management

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **Google Gemini AI** - Advanced AI summarization
- **Multer** - File upload handling
- **Custom PDF Parser** - Extract text from PDF files

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v16+)
- **MongoDB** (local installation or MongoDB Atlas)
- **Google Gemini API Key** - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/hnanh229/microlearn-ai.git
cd microlearn-ai
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` file with your actual values:
```bash
# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database - Replace with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/microlearn-ai
# For MongoDB Atlas:
# MONGODB_URI=Your_Connection_String_Here?retryWrites=true&w=majority

# JWT Configuration - Generate a strong secret key
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d

# Google Gemini AI - Get your API key from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (for user verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS="your-app-password-here"  # Use App Password, not regular password
EMAIL_FROM=MicroLearn <your-email@gmail.com>

# Client URLs
CLIENT_VERIFY_URL=http://localhost:5173/verify

# Admin Configuration
ADMIN_NAME=admin
ADMIN_PASSWORD=admin123
```

#### Start Backend Server
```bash
npm run dev
```
Server will run on `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## 📋 Environment Variables Guide

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/microlearn-ai` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSyC...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `EMAIL_USER` | Gmail for sending emails | - |
| `EMAIL_PASS` | Gmail app password | - |

### 🔑 Getting API Keys

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy and paste into `.env` file

2. **MongoDB Setup**:
   - **Local**: Install MongoDB locally or use Docker
   - **Cloud**: Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Copy connection string to `.env` file

3. **Cloudinary Setup** (for profile images):
   - Create a free account at [Cloudinary](https://cloudinary.com/users/register/free)
   - Go to your Dashboard to get your Cloud Name
   - Create an upload preset:
     - Go to Settings > Upload > Upload presets > Add upload preset
     - Set Mode to "Unsigned"
     - Save the preset name
   - Add to frontend `.env` file:
     ```
     VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
     VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
     ```

4. **Gmail App Password** (optional, for email features):
   - Enable 2-Factor Authentication on your Gmail
   - Generate App Password in Google Account settings
   - Use the app password (not your regular password)

---

## 📦 Project Structure

```
microlearn-ai/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Backend utilities
│   └── package.json
└── README.md
```

---

## 🎯 Key Features Explained

### AI Summarization
- **Text Input**: Paste any text content for intelligent summarization
- **PDF Upload**: Upload PDF files (max 10MB) for automatic text extraction and summarization
- **Custom Prompts**: Add custom instructions like "Explain for a 10-year-old" or "Focus on key takeaways"
- **Smart Truncation**: Large PDFs are automatically truncated to prevent API quota issues

### User Experience
- **Progress Tracking**: Real-time progress updates during AI processing
- **Error Handling**: Comprehensive error messages with helpful tips
- **Copy & Download**: Easy options to copy or download generated summaries
- **Responsive Design**: Works seamlessly on all device sizes

---

## 🚨 Troubleshooting

### Common Issues

1. **"Quota exceeded" errors**:
   - Wait a few minutes between requests
   - Try shorter text content
   - For PDFs: Use smaller files or single pages

2. **MongoDB connection errors**:
   - Check if MongoDB is running locally
   - Verify connection string in `.env`
   - For Atlas: Check network access settings

3. **CORS errors**:
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check that both servers are running

4. **Email features not working**:
   - Use Gmail App Password, not regular password
   - Enable 2-Factor Authentication first
   - Check Gmail security settings

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🆘 Support

- **Live Demo**: [https://hnanh229.github.io/microlearn-ai](https://hnanh229.github.io/microlearn-ai)
- **Issues**: [GitHub Issues](https://github.com/hnanh229/microlearn-ai/issues)
- **Documentation**: This README file

---

**Made with ❤️ by [HN_Anh](https://github.com/hnanh229)**
