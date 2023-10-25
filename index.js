const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const port = 3000;

app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url; // Get the YouTube video URL from the query parameter

    if (!videoURL) {
      return res.status(400).send('Missing video URL');
    }

    // Get information about the video (including the title and size)
    const info = await ytdl.getInfo(videoURL);
    const videoTitle = info.videoDetails.title;
    const autoTitle = videoTitle.replace(/[^\w\s]/gi, ''); // Remove special characters from the title
    const sanitizedTitle = autoTitle || 'audio'; // Use the sanitized title or 'audio' as a default
    const fileSize = info.formats[0].contentLength || 'unknown'; // Get the video size in bytes

    // Set response headers to specify a downloadable file with the auto-generated title and size
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', fileSize);

    // Pipe the video stream into the response
    ytdl(videoURL, { quality: 'highestvideo' }).pipe(res);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

