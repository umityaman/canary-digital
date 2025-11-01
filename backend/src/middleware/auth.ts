import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthRequest extends Request {
  userId?: number
  companyId?: number
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.userId = decoded.userId
    req.companyId = decoded.companyId
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Geçersiz token' })
  }
}

// Backwards-compatible alias used across the codebase
export const authenticate = authenticateToken

export default authenticateToken
