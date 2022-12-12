const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.post('/addCategory',(req, res) =>{
    req.body.cName=req.body.cName.toLowerCase();
   
    Category.findOne({ cName: req.body.cName})
    .exec((error,category) => {
        if(category) return res.status(400).json({
        message: 'Given Category already added'
     });
     const {
        cName
     } = req.body;
     console.log("Sent request of Category: "+req.body.cName);
     const _category = new Category({
        cName
    });
    _category.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Category could not be added...Something went wrong'
            });
        }
        if(data)
        {
            return res.status(200).json({
                category:data
            })
        }
      });
    });
});

module.exports = router;