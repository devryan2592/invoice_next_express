declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_DB: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
    }
  }
}

// Need to export something to make this a module
export {}; 