import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    companyId?: number;
    // allow any other middleware-augmented props used across the app
    [key: string]: any;
  }
}
