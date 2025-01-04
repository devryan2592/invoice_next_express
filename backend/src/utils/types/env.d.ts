declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      
      // Database
      DATABASE_URL: string;
      
      // JWT
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      
      // Frontend
      FRONTEND_URL: string;
      
      // Email Configuration
      EMAIL_FROM: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      
      // Mailgun Configuration (Production)
      MAILGUN_API_KEY?: string;
      MAILGUN_DOMAIN?: string;
      
      // Optional: OAuth (if implementing social login)
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
    }
  }
}

// Need to export something to make this a module
export {}; 