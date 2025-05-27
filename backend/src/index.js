//backend/src/index.js
const dotenv = require('dotenv');
const { server } = require('./App');

dotenv.config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
