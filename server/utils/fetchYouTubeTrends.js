import axios from 'axios';

const API_KEY = 'AIzaSyCcK3rNKsjGlMHdYX0dcoBJ_FIHLf2eUls'; // replace if needed

const fetchYouTubeTrends = async () => {
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
