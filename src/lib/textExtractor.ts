import axios from 'axios';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromDocument(url: string): Promise<string> {  
    try {  
        const response = await axios.get(url, { responseType: 'arraybuffer' });  
        const fileBuffer = Buffer.from(response.data);  

        if (url.endsWith('.pdf')) {  
            return await extractTextFromPdf(fileBuffer);  
        } else if (url.endsWith('.doc') || url.endsWith('.docx')) {  
            return await extractTextFromDoc(fileBuffer);  
        } else {  
            throw new Error('Unsupported file type. Please provide a PDF or DOC/DOCX file.');  
        }  
    } catch (error) {  
        console.error('Error fetching or processing the document:', error);  
        throw error;  
    }  
}  

async function extractTextFromPdf(buffer: Buffer): Promise<string> {  
    const data = await pdf(buffer);  
    return data.text;  
}  

async function extractTextFromDoc(buffer: Buffer): Promise<string> {  
    const { value: text } = await mammoth.extractRawText({ buffer });  
    return text;  
}  
