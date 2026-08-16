import axios from 'axios';

const fetchYouTubeTrends = async () => {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.error('YOUTUBE_API_KEY is not set; skipping YouTube trends.');
    return [];
  }

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'PK',
        maxResults: 6,
        key: API_KEY,
      },
    });

    return res.data.items.map(video => video.snippet.title);
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return [];
  }
};

export default fetchYouTubeTrends;
