// /lib/resumeParser.ts

import axios from 'axios';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Downloads the resume file from the provided URL and returns a Buffer.
 */
export async function fetchResumeBuffer(resumeUrl: string): Promise<Buffer> {
  const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

/**
 * Parses the resume file (PDF or DOCX) to extract text.
 */
export async function parseResume(buffer: Buffer, extension: string): Promise<string> {
  if (extension === 'pdf') {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  } else if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}
