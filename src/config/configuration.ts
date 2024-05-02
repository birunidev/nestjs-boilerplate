export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'nest',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    access_token_expiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    refresh_token_expiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  },
});
