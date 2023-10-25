const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;
const nodeID3 = require('node-id3'); // Import the node-id3 library

app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url;

    if (!videoURL) {
      return res.status(400).send('Missing video URL');
    }

    const info = await ytdl.getInfo(videoURL);
    const videoTitle = info.videoDetails.title;
    const autoTitle = videoTitle.replace(/[^\w\s]/gi, '');
    const sanitizedTitle = autoTitle || 'audio';
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const fileSize = audioFormats[0].contentLength || 'unknown';

    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', fileSize);

    // Pipe the audio stream into the response
    ytdl(videoURL, { format: audioFormats[0] }).pipe(res);

    // Set the artist name in the metadata tags
    const tags = {
      title: sanitizedTitle,
      artist: 'vivekfy', // Set the artist name here
    };

    const writeStream = nodeID3.write(tags, res);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

