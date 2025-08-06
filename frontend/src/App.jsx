import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import HomePage from './pages/HomePage'
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  )
}

export default App
