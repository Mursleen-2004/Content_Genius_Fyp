import axios from 'axios';

const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  params: {
    key: process.env.GEMINI_API_KEY,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export default geminiClient;