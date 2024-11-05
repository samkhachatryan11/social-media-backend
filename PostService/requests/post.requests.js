const Joi = require("joi");

async function publishPostRequest(req, res, next) {
  const schema = Joi.object({
    publisher_id: Joi.number().integer().required(),

    content: Joi.string().alphanum().min(2).max(120).required(),

    likes_count: Joi.number().integer().required(),

    comment: Joi.string().alphanum().min(2).max(120).required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.json(error.message);
  }
}

module.exports = { publishPostRequest };
