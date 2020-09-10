// File: ./routes/index.js

const router = require('express').Router();

// Use the routes defined in `./users.js` for all activity to http://localhost:3000/users/
router.use('/users', require('./users'));

module.exports = router;