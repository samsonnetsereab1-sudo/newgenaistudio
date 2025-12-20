import express from 'express';

const app = express();
app.use(express.json());

app.post('/test-generate', (req, res) => {
  console.log('========== DIRECT TEST REQUEST ==========');
  console.log('Body:', req.body);
  res.json({ message: 'Direct test works!', prompt: req.body.prompt });
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
});
