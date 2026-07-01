import { db } from '../config/db.js';
import { pdfHistory } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';

// ─── Get User History ─────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const history = await db
      .select()
      .from(pdfHistory)
      .where(eq(pdfHistory.userId, req.user.id))
      .orderBy(desc(pdfHistory.createdAt))
      .limit(100);

    return res.json({ history });
  } catch (err) {
    console.error('[History] getHistory error:', err);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

// ─── Add History Entry (internal helper) ────────────────────────────────────
export const addHistoryEntry = async (userId, { filename, operation, fileUrl, metadata }) => {
  try {
    await db.insert(pdfHistory).values({ userId, filename, operation, fileUrl, metadata });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('[History] Failed to log entry:', err.message);
  }
};

// ─── Delete Single History Entry ─────────────────────────────────────────────
export const deleteHistoryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await db
      .delete(pdfHistory)
      .where(eq(pdfHistory.id, id));

    return res.json({ message: 'Entry deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete entry.' });
  }
};

// ─── Clear All History ────────────────────────────────────────────────────────
export const clearHistory = async (req, res) => {
  try {
    await db.delete(pdfHistory).where(eq(pdfHistory.userId, req.user.id));
    return res.json({ message: 'History cleared.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear history.' });
  }
};
