const extractPakTrends = ({ twitter, reddit, youtube }) => {
  const topics = [...twitter, ...reddit, ...youtube];
  const keywords = new Set();

  topics.forEach(topic => {
    const words = topic.split(/[\s#@]+/);
    words.forEach(word => {           //fetching trends from these 3 platforms
      const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleaned.length > 3 && keywords.size < 6) {
        keywords.add(cleaned);
      }
    });
  });

  return Array.from(keywords).slice(0, 6);
};

export default extractPakTrends;
