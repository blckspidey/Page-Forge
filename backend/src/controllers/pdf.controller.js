/**
 * @file pdf.controller.js
 * @description Controllers mapping Express route requests to PDF processing actions: merging, splitting, reordering, and overlay edits.
 */

import fs from 'fs';
import { mergePDFs } from '../services/merge.service.js';
import { splitPDF } from '../services/split.service.js';
import { organizePDF } from '../services/organize.service.js';
import { editPDF } from '../services/edit.service.js';

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
 * Controller: handleMerge
 * Description: Merges multiple uploaded PDF files.
 * Request: req.files (array of uploaded files)
 * Response: 200 OK with merged PDF binary stream
 */
export const handleMerge = async (req, res) => {
  const filePaths = req.files?.map(file => file.path) || [];
  
  if (filePaths.length < 2) {
    filePaths.forEach(safeUnlink);
    return res.status(400).json({ error: 'Please upload at least 2 PDF files to merge.' });
  }

  try {
    const mergedBytes = await mergePDFs(filePaths);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(mergedBytes));
  } catch (err) {
    console.error('Merge handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to merge PDFs' });
  } finally {
    filePaths.forEach(safeUnlink);
  }
};

/**
 * Controller: handleSplit
 * Description: Splits a single uploaded PDF file.
 * Request: req.file (PDF file), req.body.splitPages (string range, e.g. "1-2, 4")
 * Response: 200 OK with split PDF or ZIP stream containing splits
 */
export const handleSplit = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to split.' });
  }

  const { splitPages } = req.body;
  if (!splitPages) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Split page ranges (splitPages) are required.' });
  }

  try {
    const result = await splitPDF(req.file.path, splitPages);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.data));
  } catch (err) {
    console.error('Split handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to split PDF' });
  } finally {
    safeUnlink(req.file.path);
  }
};

/**
 * Controller: handleOrganize
 * Description: Reorganizes page layouts (deletions, rotations, blank insertions, reordering).
 * Request: req.file (PDF file), req.body.operations (JSON array of operations)
 * Response: 200 OK with reorganized PDF stream
 */
export const handleOrganize = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to organize.' });
  }

  let operations;
  try {
    operations = typeof req.body.operations === 'string' 
      ? JSON.parse(req.body.operations) 
      : req.body.operations;
  } catch (err) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Invalid operations format. Must be JSON.' });
  }

  if (!operations || !Array.isArray(operations)) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Operations array is required.' });
  }

  try {
    const organizedBytes = await organizePDF(req.file.path, operations);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="organized.pdf"');
    res.send(Buffer.from(organizedBytes));
  } catch (err) {
    console.error('Organize handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to organize PDF' });
  } finally {
    safeUnlink(req.file.path);
  }
};

/**
 * Controller: handleEdit
 * Description: Places layout overlays (texts, images, shapes, signatures) onto the PDF.
 * Request: req.file (PDF file), req.body.elements (JSON array of overlay element data)
 * Response: 200 OK with modified PDF stream
 */
export const handleEdit = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to edit.' });
  }

  let elements;
  try {
    elements = typeof req.body.elements === 'string' 
      ? JSON.parse(req.body.elements) 
      : req.body.elements;
  } catch (err) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Invalid elements format. Must be JSON.' });
  }

  if (!elements || !Array.isArray(elements)) {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Elements array is required.' });
  }

  try {
    const editedBytes = await editPDF(req.file.path, elements);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="edited.pdf"');
    res.send(Buffer.from(editedBytes));
  } catch (err) {
    console.error('Edit handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to edit PDF' });
  } finally {
    safeUnlink(req.file.path);
  }
};
