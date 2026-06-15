import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import fs from 'fs';

export const protectPDF = async (filePath, password) => {
  if (!password) {
    throw new Error('Password is required to encrypt PDF');
  }

  const pdfBytes = fs.readFileSync(filePath);
  const uint8Bytes = new Uint8Array(pdfBytes);
  
  // Use @pdfsmaller/pdf-encrypt to encrypt
  const encryptedBytes = await encryptPDF(uint8Bytes, password);
  return Buffer.from(encryptedBytes);
};

export const unlockPDF = async (filePath, password) => {
  if (!password) {
    throw new Error('Password is required to decrypt PDF');
  }

  const pdfBytes = fs.readFileSync(filePath);
  const uint8Bytes = new Uint8Array(pdfBytes);

  try {
    // Use @pdfsmaller/pdf-decrypt to decrypt
    const decryptedBytes = await decryptPDF(uint8Bytes, password);
    return Buffer.from(decryptedBytes);
  } catch (err) {
    throw new Error('Incorrect password or failed to decrypt PDF');
  }
};
