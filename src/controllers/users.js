import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const User = require('../models/user')
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { authSchema } from '../helpers/validator'


const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth : {
        user: "xxxxxxxxxx@gmail.com",
        pass: 'xxxxxxxxxx'
    }
})
         
/**Create an User with Joi validation and with mongoose  */
exports.signup = async (req,res,next)=>{
  
    
    bcrypt.hash(req.body.password,10,(error,hash)=>{
        if(error){
            return res.status(500).json({
                error:err
            });            
        }else{
            const user = new User({
                _id : mongoose.Types.ObjectId(),
                name : req.body.name,
                mobile : req.body.mobile,
                email : req.body.email,
                password :hash
        });
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true // remove unknown props
        };
        const {error,value }= authSchema.validate(req.body , options)
        if (error){
            
            return res.status(500).json({                
              
              message: `Validation error: ${error.details.map(x => x.message).join(',')}`
            })
        }
        else{
        user
        .save()
        
        .then(result=>{
            console.log(result);
            const options = {
                from: "xxxxxxxx@gmail.com",
                to: req.body.email,
                subject: "Welcome Mail",
                text: `Hi  ${req.body.name} you have Succesfully Signed up`
            }
            transporter.sendMail(options,function(err, info){
                if (err){
                    console.log(err)
                    return
                }
                console.log(info.response)
            })
            res.status(201).json({                
                message :'User Created',               
                createduser : result
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error : err,
                message:'E-mail/Mobile Already taken'
            })
         
        
        });
    }
}
});
}

/**Login the appropriate with their E-mail and Password
 * Password has been securely stored with bcrypt method
 */
exports.login =async (req,res,next) => {
    User.find({email : req.body.email})
    .exec()
    .then(user => {
        if(user.length <1){
            return res.status(401).json({
                message : 'Auth failed'

            });
            
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result) =>{
            
            if(result){
               const token = jwt.sign({
                    email:user[0].email,
                    userId : user[0]._id
                },process.env.JWT_KEY,
                {
                    expiresIn : "1h"
                });
                return res.status(200).json({
                    message : "Auth Successful",
                    token : token
                })
            }
            res.status(401).json({
                message :'Invalid Password  '
            })

        });   
    })  
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        })

    });


}; 

/**Update the User details by calling with their id */
exports.update = (req,res,next) =>{
    const id = req.params.userId;
    
    User.update({_id : id},{$set: req.body})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);  
    })
    .catch(err => {
        console.log(error);
        res.status(500).json({
            error : err
        });
    });
}

/**To delete User with their -id */
exports.delete_user = (req,res,next) =>{
    const id = req.params.userId;
    User.remove({
        _id : id
    }).exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(error => {
        res.status(500).json({
            error : error
        })
    })

}
/** To get all the User and the details using get method 
 * req.query has been used for the pagination here
*/
exports.users =(req,res,next) =>{
    const {page = req.params.page, limit = req.params.limit} = req.query
    User.find().limit(limit*1).skip((page-1)*limit)

    .select('name email mobile')
    .exec()
    .then(docs => {
        const response ={
            count: docs.length,
            users: docs

        };
    res.status(200).json(response);   
    })
    
    .catch(err =>{
        console.log(err);
        res.status(500).json({error:err});

    })
    
};

/**Exporting the User by the specific user_id for routes 
 * To see the details of the specific user
*/
exports.user = (req,res,next) =>{
    const id= req.params.userId;
    User.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);
        if (doc){
            res.status(200).json({
              name :  doc.name,
              mail :  doc.email,
              mobile : doc.mobile              
            });
        }else{
            res.status(404).json({message: 'No Matching Id '})
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
}