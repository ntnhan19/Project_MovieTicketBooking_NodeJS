//backend/src/index.js
const dotenv = require('dotenv');
const app = require('./App.js'); // 👈 import từ App.js

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
