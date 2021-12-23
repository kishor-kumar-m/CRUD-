import Joi from 'joi'


const authSchema = Joi.object({
    name : Joi.string().required().messages({
        'string.empty': `"name" cannot be an empty field`,
      }),
    email: Joi.string().email().lowercase().required(),
    mobile : Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
    password : Joi.string().min(6).required(),

});






module.exports = {authSchema}