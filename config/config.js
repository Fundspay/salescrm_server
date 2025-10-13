if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Load .env only in non-production
}

let CONFIG = {};

// General
CONFIG.app = process.env.APP || "dev";
CONFIG.port = process.env.PORT || "3000";

// Database
CONFIG.db_dialect = process.env.DB_DIALECT || "postgres";
CONFIG.db_host = process.env.DB_HOST || "localhost";
CONFIG.db_port = process.env.DB_PORT || "5432";
CONFIG.db_name = process.env.DB_NAME || "hrcrm_db";
CONFIG.db_user = process.env.DB_USER || "root";
CONFIG.db_password = process.env.DB_PASSWORD || "password";
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD || "true";

// S3 Config (Used for file uploads)
CONFIG.s3Region = process.env.S3_REGION || "ap-south-1";
CONFIG.s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || "your-access-key-id";
CONFIG.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "your-secret-access-key";
CONFIG.s3Bucket = process.env.S3_BUCKET || "hrcrm"; 

// SMTP Config
CONFIG.smtpKey = process.env.SMTP_KEY || 'smtpapikey';

 // Email
CONFIG.mailUser = process.env.MAIL_USER || "noreply@example.com";
CONFIG.mailPassword = process.env.MAIL_PASSWORD || "your-password";
CONFIG.mailHost = process.env.MAIL_HOST || "smtp.yourmail.com";
CONFIG.mailPort = process.env.MAIL_PORT || 587;
CONFIG.mailSecure = process.env.MAIL_SECURE === "true"; // Accepts 'true' or 'false' as string

// JWT Secret
CONFIG.jwtSecret = process.env.JWT_SECRET || "your-secret-key";

// AWS Config (if separate from S3)
CONFIG.awsRegion = process.env.AWS_REGION || "us-east-1";
CONFIG.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
CONFIG.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";


module.exports = CONFIG;
