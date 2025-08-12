import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API_URL = `${API_BASE_URL}/auth`;

export const signup = (firstName, lastName, email, password) =>
  axios.post(`${API_URL}/signup`, { firstName, lastName, email, password });

export const login = (email, password) =>
  axios.post(`${API_URL}/login`, { email, password });

export const verifyEmail = (token) =>
  axios.post(`${API_URL}/verify-email`, { token });

export const resendVerification = (email) =>
  axios.post(`${API_URL}/resend-verification`, { email });
