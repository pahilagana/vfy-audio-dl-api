const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const port = 10000;

app.get('/download', async (req, res) => {
  const videoURL = req.query.url; // Get the YouTube video URL from the query parameter
  const videoInfo = await ytdl.getInfo(videoURL);

  // Get the title of the video
  const videoTitle = videoInfo.videoDetails.title;
  const fileName = `${videoTitle}.mp3`;

  // Set headers for the MP3 file download
  res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-type', 'audio/mpeg');

  // Convert the video to MP3 and pipe it to the response
  ytdl(videoURL, { quality: 'highestaudio' })
    .pipe(res)
    .on('finish', () => {
      console.log(`Downloaded ${videoTitle} as ${fileName}`);
    })
    .on('error', (err) => {
      console.error('Error:', err);
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
