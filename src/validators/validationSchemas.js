const Joi = require('joi');

const signupSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3),
  email: Joi.string().email(),
});

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema
};
