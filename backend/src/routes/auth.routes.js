import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  googleCallback,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// ─── Email / Password ─────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
router.post('/refresh',  refresh);
router.get('/me',        authMiddleware, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/fail', session: false }),
  googleCallback
);

router.get('/google/fail', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?error=google_failed`);
});

export default router;
