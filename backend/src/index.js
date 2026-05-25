const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/api', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Siri Vruddhi Backend' });
});

app.listen(port, () => {
  console.log(`Siri Vruddhi backend running on http://localhost:${port}`);
});
