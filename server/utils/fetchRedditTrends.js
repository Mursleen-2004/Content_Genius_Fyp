import axios from 'axios';

const fetchRedditTrends = async () => {
  const trends = [];
  const res = await axios.get('https://www.reddit.com/r/pakistan/hot.json?limit=10');

  res.data.data.children.forEach(post => {
    if (trends.length < 6) trends.push(post.data.title);
  });

  return trends;
};

export default fetchRedditTrends;
