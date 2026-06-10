const joi = require("joi");
const review = require("./models/review");
const Joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title:joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    country: joi.string().required(),
    price: joi.number().required().min(0),
    image: Joi.object({
      filename: Joi.string(),
      url: Joi.string().required(),
    })
  }).required(),
})

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().required()
  }).required()
})