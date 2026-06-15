/**
 * @file convert.controller.js
 * @description Controllers mapping file format conversion routes: Word-to-PDF, PDF-to-Word.
 */

import fs from 'fs';
import path from 'path';
import { wordToPdf, pdfToWord } from '../services/convert.service.js';

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
 * Controller: handleWordToPdf
 * Description: Converts an uploaded Microsoft Word docx file to PDF format.
 * Request: req.file (.docx file)
 * Response: 200 OK with PDF file attachment stream
 */
export const handleWordToPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a Word (.docx) file to convert.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.docx') {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Only .docx files are supported for Word to PDF conversion.' });
  }

  try {
    const pdfBytes = await wordToPdf(req.file.path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(req.file.originalname, '.docx')}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Word to PDF handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to convert Word to PDF.' });
  } finally {
    safeUnlink(req.file.path);
  }
};

/**
 * Controller: handlePdfToWord
 * Description: Converts an uploaded PDF file to Microsoft Word (.docx) format by extracting text.
 * Request: req.file (.pdf file)
 * Response: 200 OK with Word docx file attachment stream
 */
export const handlePdfToWord = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to convert.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    safeUnlink(req.file.path);
    return res.status(400).json({ error: 'Only PDF files are supported for PDF to Word conversion.' });
  }

  try {
    const docxBuffer = await pdfToWord(req.file.path);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(req.file.originalname, '.pdf')}.docx"`);
    res.send(Buffer.from(docxBuffer));
  } catch (err) {
    console.error('PDF to Word handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to convert PDF to Word.' });
  } finally {
    safeUnlink(req.file.path);
  }
};
