import {Router, Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Middleware: JWT token doğrulama
export const authenticateToken = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // TEMPORARY: Allow dev-bypass-token for testing
  if (token === 'dev-bypass-token') {
    req.user = { id: 1, email: 'admin@canary.com', role: 'ADMIN' };
    (req as any).companyId = 1;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Kayıt ol
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, companyName } = req.body;

    if (!email || !password || !name || !companyName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Kullanıcı zaten var mı?
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Şirket oluştur
    const company = await prisma.company.create({
      data: { name: companyName }
    });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur (ilk kullanıcı admin olsun)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        companyId: company.id
      },
      include: {
        company: true
      }
    });

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Giriş yap
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Şifre kontrolü
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Aktif kullanıcı kontrolü
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profil bilgisi al
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { company: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
