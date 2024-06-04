const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const cors = require('cors');
const webPush = require('web-push');
const app = express();
const port = process.env.PORT || 3000;
const webPushKey = 'ElCXTyTmHeNvPGZZXMCg_N0ydq3Q_-flSppgQEp3L5U';
const db = require('./db.json');
const fs = require('fs');

// Middleware to serve static files (optional)
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Custom POST route

// Use json-server router
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

app.use('*', (req, res, next) => {
  if (req.originalUrl === '/posts' && req.method === 'POST') {
    webPush.setVapidDetails(
      'mailto:aniket@gmail.com',
      'BKs5V_LcV6fY7kn3-pDMgjkqjo6gZhDS2jYr44OW5kNLD6DMAEvLVuqaR7uTc0tlPtd_XJScw-WKx5DsbaKcc7c',
      webPushKey
    );
    db.subscriptions.forEach((sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keys.auth,
          p256dh: sub.keys.p256dh,
        },
      };

      webPush
        .sendNotification(
          pushConfig,
          JSON.stringify({
            title: req.body.title,
            content: `New post added from ${req.body.location}`,
          })
        )
        .then(() => {
          console.log('Notification sent successfully');
        })
        .catch((error) => {
          console.error('Error sending notification:', error);
        });
    });
  }
  next();
});
app.use(middlewares);
app.use(router);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
