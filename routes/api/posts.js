const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
// @route    GET api/posts
// @desc     Test route
// @access   Public
router.get('/',[auth,[
    check('text','Text is required')
    .not()
    .isEmpty()
]],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }
    try{
        const user = await User.findById(req.user.id).select('-password');
        const nwePost = new Post({
            text : req.body.text,
            name : user.name,
            avatar : user.avatar,
            user : req.user.id,
        });
        const post = await nwePost.save();
        res.json(post);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;