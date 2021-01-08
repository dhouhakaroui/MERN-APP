const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const authAdmin=require('../middleware/authAdmin')
const post=require('../models/post')

//add new post
router.post('/',auth,(req,res)=>{
    if (!req.body.text){return res.status(400).send({errors:[{msg:"post is empty!"}]})}
    let newPost =new post({...req.body,user:req.userId})
    newPost.save()
            .then(post=>res.status(201).send(post))
            .catch((err)=>{
                console.error(err.message)
                res.status(500).send({msg:"server error"})
            })
})
//get all post
router.get('/',(req,res)=>{
    post.find()
        .sort({date: -1})
    .then(post=>res.status(201).send(post))
    .catch((err)=>{
        console.error(err.message)
        res.status(500).send({msg:'server error'})
    })
})

//get posts by user_id
router.get('/posts/:user_id',(req,res)=>{
    post.findOne({user: req.params.user_id})
        .then(post=>{
            if(!post){ return  res.status(404).json({msg: 'No Post found'});}
            res.status(201).send(post)})
        .catch((err)=>{
            console.error(err.message)
            res.status(500).send({msg:'server error'})
    })
})

//get post by id
router.get('/:post_id',(req,res)=>{
    post.findOne({_id: req.params.post_id})
        .then(post=>{
            if(!post){ return  res.status(404).json({msg: 'No Post found'});}
            res.status(201).send(post)})
        .catch((err)=>{
            console.error(err.message)
            res.status(500).send({msg:'server error'})
    })
})

//delet post 
router.delete('/delete/:_id',auth,(req,res)=>{
    post.findOneAndDelete({_id:req.params._id,user:req.userId})
    .then(post=>{
        if(!post){res.status(401).send({msg:"User not authorised"})}
        res.status(201).send({msg:'post deleted'})})
    .catch((err)=>{
        console.error(err.message)
        res.status(500).send({msg:'server error'})
    })
})

//UPDATE POST

// update text post
router.put('/:post_id',auth,(req,res)=>{
    post.findByIdAndUpdate({_id:req.params.post_id,user:req.userId}, req.body)
        .then(post=>{res.status(201).send(post)})
        .catch((err)=>{
            console.error(err.message)
            res.status(500).send({msg:'server error'})
        })
})

//like post
router.put('/like/:post_id',auth,(req,res)=>{
    post.findOne({_id: req.params.post_id})
            .then(post => {
                if(post.likes.filter(like => like.user.toString() === req.userId).length > 0){
                    return res.status(400).json({msg: 'Already liked the post'})
                }    
                post.likes.unshift({ user : req.userId});
                post.save().then(post => res.json(post))
            }).catch(err => res.status(404).json({msg:'Post Not Found'}));
})

//dislike post
router.put('/dislike/:post_id',auth,(req,res)=>{
    post.findOne({_id: req.params.post_id})
    .then(post => {        
        if(post.likes.filter(like => like.user.toString() === req.userId).length === 0){
            return res.status(400).json({msg: 'You haven\'t liked this post'})
        }    
        var removeIndex = post.likes.map(like => like.user).indexOf(req.userId);
        post.likes.splice(removeIndex,1);
        post.save().then(post => res.json(post));
    }).catch(err => res.status(404).json({msg:'Post Not Found'}));
})

//add comment
router.put('/addcomment/:post_id',auth,(req,res)=>{
    post.findOne({_id: req.params.post_id})
        .then(post => {
            const newComment = {
                user: req.userId,
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,    
            }
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post)); 
        }).catch(err => res.status(404).json({msg:'No Post found'}));
})

//delet comment
router.put('/delete_comment/:post_id/:comment_id',auth,(req,res)=>{
    const Post = post.findById(req.params.post_id);
    const comment = Post.comments.find((comment) => comment._id === req.params.comment_id );
    if (!comment)
        return res.status(404).json({ msg: "comment does not exist " });
    if (comment.user !== req.userId) 
        return res.status(401).json({ msg: "user not authorized " });
    post.findByIdAndUpdate(req.params.post_id,{$pull: { comments: { _id: req.params.comment_id }}})
        .then(post=>res.status(201).send({msg:'comment deleted'}))
        .catch((err)=>{
            console.error(err.message)
            res.status(500).send({msg:'server error'})
    }) 
})

//update comment
router.put('/update_comment/:post_id/:comment_id',auth,(req,res)=>{
    post.findOne({_id: req.params.post_id})
        .then(post => {
            const newComment = {
                _id:req.params.comment_id,
                user: req.userId,
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,    
            }
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post)); 
        }).catch(err => res.status(404).json({msg:'No Post found'}));

})

module.exports=router