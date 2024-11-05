const Joi = require("joi");
const { User } = require("../models");

async function registrationRequest(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),

    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .external(async (email) => {
        const user = await User.findOne({
          where: {
            email: email,
          },
        });
        if (user) {
          throw new Error("User with this email already exists!");
        }
        return email;
      }),

    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(8)
      .max(32)
      .required(),

    repeat_password: Joi.ref("password"),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const validationErrors = error.details
      ? error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
      : [{ field: "email", message: error.message }];

    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationErrors,
    });
  }
}

async function loginRequest(req, res, next) {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .external(async (email) => {
        const user = await User.findOne({
          where: {
            email: req.body.email,
          },
        });

        if (!user) {
          throw new Joi.ValidationError("User with this email does not exist!");
        }
        return email;
      }),

    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(8)
      .max(32)
      .required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = { registrationRequest, loginRequest };
