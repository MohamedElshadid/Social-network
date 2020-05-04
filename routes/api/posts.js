const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
// @route    Add api/posts
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

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get('/',auth,async (req , res) => {
    try {
        const posts = await Post.find().sort({data:-1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');   
    }
});

// @route    GET api/post:id
// @desc     Get post by id
// @access   Private

router.get('/:id',auth,async (req , res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            return res.status(404).json({msg : 'Post Not Found'});
        }
        res.json(post);
    } catch (err) {
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg : 'Post Not Found'});
        }
        console.error(err.message);
        res.status(500).send('Server Error');   
    }
});

// @route    Delete api/post:id
// @desc     Delete post by id
// @access   Private

router.delete('/:id',auth,async (req , res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({msg : 'Post Not Found'});
        }

        if(post.user.toString() !== req.params.id) {

            return res.status(401).json({msg : 'User Not Authorized'});
        }

        await post.remove();

        res.json({msg : 'Post Removed'});
    } catch (err) {
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg : 'Post Not Found'});
        }
        console.error(err.message);
        res.status(500).send('Server Error');   
    }
});
module.exports = router;