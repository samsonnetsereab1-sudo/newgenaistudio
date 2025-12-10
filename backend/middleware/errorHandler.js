export default (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Server Error' });
};
