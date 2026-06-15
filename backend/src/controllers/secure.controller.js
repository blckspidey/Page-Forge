/**
 * @file secure.controller.js
 * @description Controllers mapping PDF protection routes: password locking, password unlocking/decryption.
 */

import fs from 'fs';
import { protectPDF, unlockPDF } from '../services/secure.service.js';

/**
 * Safely unlinks a temporary file from the disk.
 * @param {string} filePath - Absolute path to the file.
 */
const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete temporary file ${filePath}:`, err);
    });
  }
};

/**
 * Controller: handleProtect
 * Description: Password protects/encrypts a PDF document.
 * Request: req.file (PDF file), req.body.password (string)
 * Response: 200 OK with encrypted PDF file attachment
 */
export const handleProtect = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to encrypt.' });
  }

  const { password } = req.body;
  if (!password) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Password is required to secure PDF.' });
  }

  try {
    const protectedBytes = await protectPDF(req.file.path, password);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="secured.pdf"');
    res.send(Buffer.from(protectedBytes));
  } catch (err) {
    console.error('Protect handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to secure PDF.' });
  } finally {
    safeUnlink(req.file.path);
  }
};

/**
 * Controller: handleUnlock
 * Description: Removes password protection from a password-locked PDF document.
 * Request: req.file (PDF file), req.body.password (string)
 * Response: 200 OK with unlocked PDF file attachment
 */
export const handleUnlock = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to unlock.' });
  }

  const { password } = req.body;
  if (!password) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Password is required to decrypt PDF.' });
  }

  try {
    const unlockedBytes = await unlockPDF(req.file.path, password);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="unlocked.pdf"');
    res.send(Buffer.from(unlockedBytes));
  } catch (err) {
    console.error('Unlock handler error:', err);
    res.status(400).json({ error: err.message || 'Incorrect password or failed to decrypt PDF.' });
  } finally {
    safeUnlink(req.file.path);
  }
};
