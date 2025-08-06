const { Router } = require('express');
const { getHomePageData } = require('../controllers/homeController');

const router = Router();

router.get('/', getHomePageData);

module.exports = router;
