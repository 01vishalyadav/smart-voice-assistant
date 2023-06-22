const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hi, I\'m a smart voice assistant');
});

module.exports = router;