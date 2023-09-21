const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const port = 3000;

app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url; // Get the YouTube video URL from the query parameter
    const title = req.query.title || 'audio'; // Get the title query parameter or use 'audio' as default

    if (!videoURL) {
      return res.status(400).send('Missing video URL');
    }

    // Get information about the video (including file size)
    const info = await ytdl.getInfo(videoURL);
    const fileSize = info.formats[0].contentLength; // Get the file size in bytes

    // Set response headers to specify a downloadable file with the specified title
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
   // res.setHeader('Content-Length', fileSize); // Set the Content-Length header

    // Pipe the video stream into the response
    ytdl(videoURL, { filter: 'audioonly' }).pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
