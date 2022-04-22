import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  DB_REDIS_HOST: process.env.DB_HOST,
  DB_REDIS_PORT: parseInt(process.env.DB_PORT, 10) || 6379,
}));
