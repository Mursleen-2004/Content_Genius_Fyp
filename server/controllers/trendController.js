import fetchTwitterTrends from '../utils/fetchTwitterTrends.js';
import fetchRedditTrends from '../utils/fetchRedditTrends.js';
import fetchYouTubeTrends from '../utils/fetchYouTubeTrends.js';
import extractPakTrends from '../utils/extractPakTrends.js';
import translateToEnglish from '../utils/translateToEnglish.js';

export const getTrends = async (req, res) => {
  try {
    const [twitterRaw, redditRaw, youtubeRaw] = await Promise.all([
      fetchTwitterTrends(),
      fetchRedditTrends(),
      fetchYouTubeTrends(),
    ]);

    // Translate all trends to English
    const [twitter, reddit, youtube] = await Promise.all([
      Promise.all(twitterRaw.map(translateToEnglish)),
      Promise.all(redditRaw.map(translateToEnglish)),
      Promise.all(youtubeRaw.map(translateToEnglish)),
    ]);

    const pakistan = extractPakTrends({ twitter, reddit, youtube });

    res.json({ twitter, reddit, youtube, pakistan });
  } catch (error) {
    console.error('Trend Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch and translate trends' });
  }
};
