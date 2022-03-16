import mongoose from 'mongoose'


const userSchema = mongoose.Schema({
    name: {type: String,required : true},
    email: {type: String, required : true,unique: true, match :/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
    mobile : {type : Number,required : true,unique :true,maxLength: 10,match : /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/},
    password:{type: String, required: [true,'Please Provide a Password']},
    

});


module.exports = mongoose.model('User',userSchema);