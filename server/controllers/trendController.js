import fetchTwitterTrends from '../utils/fetchTwitterTrends.js';
import fetchRedditTrends from '../utils/fetchRedditTrends.js';
import fetchYouTubeTrends from '../utils/fetchYouTubeTrends.js';
import extractPakTrends from '../utils/extractPakTrends.js';
import translateToEnglish from '../utils/translateToEnglish.js';

// These are three independent scrapers/APIs and any one of them can fail on
// its own (rate limits, markup changes, a quota). Previously Promise.all meant
// a single rejection took the whole endpoint down with a 500, so one dead
// source hid the two that were working.
const settle = async (label, promise) => {
  try {
    return await promise;
  } catch (error) {
    console.error(`Trend source "${label}" failed:`, error.message);
    return [];
  }
};

// translateToEnglish hits an unofficial endpoint that rate-limits, so a failed
// translation falls back to the original text instead of losing the trend.
const translateAll = (items) =>
  Promise.all(
    items.map(async (item) => {
      try {
        return await translateToEnglish(item);
      } catch {
        return item;
      }
    })
  );

export const getTrends = async (req, res) => {
  try {
    const [twitterRaw, redditRaw, youtubeRaw] = await Promise.all([
      settle('twitter', fetchTwitterTrends()),
      settle('reddit', fetchRedditTrends()),
      settle('youtube', fetchYouTubeTrends()),
    ]);

    const [twitter, reddit, youtube] = await Promise.all([
      translateAll(twitterRaw),
      translateAll(redditRaw),
      translateAll(youtubeRaw),
    ]);

    const pakistan = extractPakTrends({ twitter, reddit, youtube });

    res.json({ twitter, reddit, youtube, pakistan });
  } catch (error) {
    console.error('Trend Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch and translate trends' });
  }
};
