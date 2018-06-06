const fetch = require("isomorphic-fetch");
const queryString = require("query-string");

const getRandomGif = async (tag = "assassin's creed") => {
  const url = `http://api.giphy.com/v1/gifs/random?${queryString.stringify({
    tag,
    api_key: process.env.GIPHY_API_KEY
  })}`;

  const res = await fetch(url);
  const json = await res.json();

  return json.data.embed_url;
};

module.exports = { getRandomGif };
