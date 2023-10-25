const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

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
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const fileSize = audioFormats[0].contentLength || 'unknown'; // Get the audio size in bytes

    // Capture a snapshot of the video at a specific time (e.g., 10 seconds into the video)
    const snapshotTime = 10; // You can adjust this time as needed
    const snapshotFilename = 'snapshot.jpg';

    ffmpeg()
      .input(videoURL)
      .seekInput(snapshotTime)
      .frames(1)
      .output(snapshotFilename)
      .on('end', () => {
        // Once the snapshot is captured, set it as the poster for the audio file
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', fileSize);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Thumbnail', snapshotFilename); // Set the snapshot as the poster

        // Pipe the audio stream into the response
        ytdl(videoURL, { format: audioFormats[0] }).pipe(res);

        // Delete the snapshot file after it's served
        fs.unlink(snapshotFilename, (err) => {
          if (err) {
            console.error('Error deleting snapshot file:', err);
          }
        });
      })
      .run();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

