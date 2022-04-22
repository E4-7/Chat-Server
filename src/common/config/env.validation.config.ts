import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'stage', 'local')
    .default('local'),
  APP_NAME: Joi.string().default('E4/7'),
  APP_HOST: Joi.string().default('localhost'),
  npm_package_version: Joi.string().default('0.01'),
  APP_PORT: Joi.number().default(4000),
  BACKEND_DOMAIN: Joi.string().default('localhost'),
  FRONTEND_DOMAIN: Joi.string().default(['*']),
  DB_REDIS_HOST: Joi.string().default('localhost'),
  DB_REDIS_PORT: Joi.number().default(6379),
});
