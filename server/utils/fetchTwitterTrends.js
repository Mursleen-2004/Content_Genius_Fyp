import axios from 'axios';
import * as cheerio from 'cheerio';

const fetchTwitterTrends = async () => {
  const trends = [];
  const res = await axios.get('https://trends24.in/pakistan/');
  const $ = cheerio.load(res.data);

  $('.trend-card__list li a').each((_, el) => {
    if (trends.length < 6) trends.push($(el).text().trim());
  });

  return trends;
};

export default fetchTwitterTrends;
