import axios from 'axios';

const API_URL = '/api/auth';

export const signup = (email, password) =>
  axios.post(`${API_URL}/signup`, { email, password });

export const login = (email, password) =>
  axios.post(`${API_URL}/login`, { email, password });

export const verifyEmail = (token) =>
  axios.post(`${API_URL}/verify-email`, { token });

export const resendVerification = (email) =>
  axios.post(`${API_URL}/resend-verification`, { email });
