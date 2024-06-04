const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files (optional)
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Custom POST route

// Use json-server router
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
