const express = require('express');
const ytdl = require('ytdl-core');
const axios = require('axios');
const app = express();
const port = 3000;

app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url; // Get the YouTube video URL from the query parameter

    if (!videoURL) {
      return res.status(400).send('Missing video URL');
    }

    // Get information about the video from YouTube Data API
    const videoInfo = await getVideoInfo(videoURL);

    if (!videoInfo) {
      return res.status(500).send('Failed to fetch video information');
    }

    const { title, channelName, thumbnailUrl } = videoInfo;

    // Set response headers to specify a downloadable audio file with the auto-generated title
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // Fetch the video thumbnail as an image and pipe it to the response
    const imageBuffer = await fetchImage(thumbnailUrl);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', imageBuffer.length);
    res.end(imageBuffer);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function getVideoInfo(videoURL) {
  try {
    // Extract video ID from the URL
    const videoId = ytdl.getVideoID(videoURL);

    // Fetch video details from the YouTube Data API
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=YOUR_API_KEY`);
    const videoData = response.data.items[0].snippet;

    return {
      title: videoData.title,
      channelName: videoData.channelTitle,
      thumbnailUrl: videoData.thumbnails.high.url,
    };
  } catch (error) {
    console.error('Failed to fetch video details:', error);
    return null;
  }
}

async function fetchImage(url) {
  // Fetch and return the image as a buffer
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

