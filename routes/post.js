const router = require("express").Router();
const { Router } = require("express");
const { publicPosts, privatePosts } = require("../db/data");
const checkAuth = require("../middleware/checkAuth")

router.get('/public', (req, res) => {
    res.json(publicPosts)
});

router.get('/private', checkAuth, (req, res) => {
    res.json(privatePosts)
});


module.exports = router;