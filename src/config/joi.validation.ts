import * as Joi from 'joi';

export const joiValidationSchema = Joi.object({
  MONGODB: Joi.required(),
  PORT: Joi.number(),
  DIFAULT_LIMIT: Joi.number().default(6),
});
