// Ultra minimal server to test POST
import express from 'express';

const app = express();
app.use(express.json());

app.post('/test', (req, res) => {
  console.log('✅ POST received!');
  res.json({ success: true, body: req.body });
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`✅ Minimal server on ${PORT}`);
  console.log('Try: curl -X POST http://localhost:4002/test -H "Content-Type: application/json" -d "{\\"test\\":\\"value\\"}"');
});
