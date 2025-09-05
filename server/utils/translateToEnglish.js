import axios from 'axios';

const translateToEnglish = async (text) => {
  try {
    const response = await axios.post(
      'https://libretranslate.de/translate', // ✅ Most reliable mirror as of 2025
      {
        q: text,
        source: 'auto',
        target: 'en',
        format: 'text',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data?.translatedText || text;
  } catch (error) {
    console.error('LibreTranslate error:', error.response?.data || error.message);
    return text;
  }
};

export default translateToEnglish;
