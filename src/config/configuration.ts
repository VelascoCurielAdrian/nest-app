export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'myapp',
    ssl: process.env.DATABASE_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  cors: {
    // Orígenes permitidos - puedes agregar más según necesites
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:44269', 'http://127.0.0.1:44269'],
    // Credentials permite enviar cookies y headers de autenticación
    credentials: true,
  },
});
