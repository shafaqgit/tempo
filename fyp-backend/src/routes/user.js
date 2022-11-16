const express = require('express');
const user = require('../models/user');
const router = express.Router();
const User = require('../models/user');

router.post('/signin',(req, res) =>{

});



router.post('/signup',(req, res) =>{

    User.findOne({ email: req.body.email})
    .exec((error,user) => {
        if(user) return res.status(400).json({
        message: 'User already registered'
     });

     const {
        firstName,
        lastName,
        email,
        password

     } = req.body;

     const _user = new User({
        firstName ,
        lastName , 
        email, 
        password,
        username: Math.random().toString()
    });
    _user.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'User could not be registered...Something went wrong'
            });
        }
        if(data)
        {
            return res.status(200).json({
                user:data
            })
        }
      });
    });
});

module.exports = router;