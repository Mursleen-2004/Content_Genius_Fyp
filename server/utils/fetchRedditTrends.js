import axios from 'axios';

// Reddit rejects requests that don't identify themselves, which is why the
// bare call returned 403 both locally and from Vercel.
const USER_AGENT =
  'web:content-genius:v1.0 (trend aggregator for an academic project)';

const fetchRedditTrends = async () => {
  const trends = [];
  const res = await axios.get(
    'https://www.reddit.com/r/pakistan/hot.json?limit=10',
    {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000,
    }
  );

  res.data.data.children.forEach(post => {
    if (trends.length < 6) trends.push(post.data.title);
  });

  return trends;
};

export default fetchRedditTrends;
