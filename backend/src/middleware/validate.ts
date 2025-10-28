import { Request, Response, NextFunction } from 'express';

// Minimal no-op validate middleware.
// Some routes import this helper but in production we only need a placeholder
// so missing imports don't crash the server. Replace with real validation
// logic as needed.
export function validate(_schema?: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    // If a schema is provided, you can run validation here.
    // For now we just pass-through to avoid startup failures.
    next();
  };
}
