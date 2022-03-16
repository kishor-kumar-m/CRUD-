import mongoose, { Mongoose } from 'mongoose'
import bcrypt from 'bcrypt'
const User = require('../models/user')
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { authSchema } from '../helpers/validator'
import redis from 'redis'
import util from 'util'
import events from 'events';


const client = redis.createClient({
    port: 6379,
    host: "127.0.0.1",
  });
  client.set = util.promisify(client.set);
  client.get = util.promisify(client.get);





/**Create an User with Joi validation and with mongoose  */
exports.signup = async (req,res,next)=>{
  
    
    bcrypt.hash(req.body.password,10,(error,hash)=>{
        if(error){sendMail
            return res.status(500).json({
                error:err
            });            
        }else{
            const user = new User({
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
            client.flushall('ASYNC');
            console.log(result);
            const options = {
                from: "korathop@gmail.com",
                to: req.body.email,
                subject: "Welcome Mail",
                
                text: `Hi  ${req.body.name} you have Succesfully Signed up`
            }
            transporter.sendMail(options, function(err, success) {
                if(err){
                    console.log(err);
                }
                if(success){
                    this.events.emit('success', success);
                }
            })
            
            res.status(201).json({                
                message :'User Created',               
                createduser : result
                
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error : err.message,
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
exports.update = async (req,res,next) =>{
    const id = req.params.userId;
    const updates = req.body;
    const options = {new : true};
    await User.findByIdAndUpdate(id,updates,options)   
    
 
    .exec()
    .then(result => {
        client.flushall('ASYNC');
        console.log(result);
        res.status(200).json(result);  
    })
    .catch(err => {
        console.log(err);
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
exports.users = async(req,res,next) =>{
    const cachedPost = await client.get(`user`)
    const {page = req.params.page || 1, limit = req.params.limit || 10} = req.query
    User.find().limit(limit*1).skip((page-1)*limit)
    .select('name email mobile')
    .exec()
    .then(docs => {
        if(cachedPost){
            const result = JSON.parse(cachedPost)       
                return res.json({count:result.length,users:result,message:'retrieved from cache'})
        }
        if (docs){          
        const response ={
            count: docs.length,
            users: docs

        };
        client.set(`user`,JSON.stringify(response)) 
    res.status(200).json(response);   
    }})
    
    .catch(err =>{
        console.log(err);
        res.status(500).json({error:err});

    })
    
};

/**Exporting the User by the specific user_id for routes 
 * To see the details of the specific user
*/
exports.user = async (req,res,next) =>{
    const id= req.params.userId;
    const cachedPost = await client.get(`user-${id}`)
    
    User.findById(id)

    .exec()
    .then(doc => {
    if(cachedPost){
        const result = JSON.parse(cachedPost)       
            return res.json({
                name : result.name,
                mail :result.email,
                mobile : result.mobile,
                message: "data retrieved from the cache"})
        }
        if (doc){
            console.log('doc',doc);
        client.set(`user-${id}`,JSON.stringify(doc),"EX",3600)   
        return res.status(200).json({
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
        res.status(500).json({error:err.message});
    });
}