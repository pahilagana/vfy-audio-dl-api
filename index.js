const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;
const ffmpeg = require('fluent-ffmpeg');

app.get('/poster', async (req, res) => {
  try {
    const videoURL = req.query.url; // Get the YouTube video URL from the query parameter

    if (!videoURL) {
      return res.status(400).send('Missing video URL');
    }

    // Capture a snapshot of the video at a specific time (e.g., 10 seconds into the video)
    const snapshotTime = 10; // You can adjust this time as needed
    const snapshotFilename = 'snapshot.jpg';

    ffmpeg()
      .input(videoURL)
      .seekInput(snapshotTime)
      .frames(1)
      .output(snapshotFilename)
      .on('end', () => {
        // Set the content type for the response
        res.setHeader('Content-Type', 'image/jpeg');

        // Pipe the snapshot image into the response
        const imageStream = fs.createReadStream(snapshotFilename);
        imageStream.pipe(res);

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

