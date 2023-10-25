const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const port = 3000;

app.get('/mp3', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send('Please provide a valid video URL.');
  }

  // Get video info to extract the title
  const info = await ytdl.getInfo(videoUrl);
  const videoTitle = info.videoDetails.title;

  const options = {
    quality: 'highestaudio',
    filter: 'audioonly',
  };

  const stream = ytdl(videoUrl, options);
  const filename = 'output.mp3';
  const output = fs.createWriteStream(filename);

  stream.pipe(output);

  output.on('finish', () => {
    res.download(filename, `${videoTitle}.mp3`, (err) => {
      if (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred while downloading the audio.');
      } else {
        console.log('Download complete.');
        fs.unlinkSync(filename);
      }
    });
  });

  stream.on('error', (err) => {
    console.error('Error:', err);
    res.status(500).send('An error occurred while processing the video URL.');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


