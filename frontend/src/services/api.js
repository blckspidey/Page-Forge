import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Response interceptor to handle Blob errors (status 400/500 returns error as JSON inside a Blob)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.data instanceof Blob && error.response.data.type === 'application/json') {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        error.response.data = parsed;
      } catch (e) {
        // Fallback
      }
    }
    return Promise.reject(error);
  }
);

// Helper to trigger direct browser download of a blob response
export const downloadBlob = (response, defaultFilename) => {
  const getHeader = (headers, name) => {
    if (!headers) return '';
    if (typeof headers.get === 'function') {
      return headers.get(name) || '';
    }
    return headers[name.toLowerCase()] || headers[name] || '';
  };

  const contentType = getHeader(response.headers, 'Content-Type');
  const contentDisposition = getHeader(response.headers, 'Content-Disposition');

  if (contentType.toLowerCase().includes('application/json')) {
    console.error('downloadBlob received JSON response instead of document blob.');
    return;
  }

  const blob = new Blob([response.data], { type: contentType || 'application/octet-stream' });
  let filename = defaultFilename || 'document';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=["']?(?:UTF-8'')?([^;"']+)["']?/i);
    if (match && match[1]) {
      try {
        filename = decodeURIComponent(match[1].trim());
      } catch (e) {
        filename = match[1].trim();
      }
    }
  }

  if (!filename || typeof filename !== 'string') {
    filename = defaultFilename || 'document';
  }

  const filenameLower = filename.toLowerCase();
  const contentTypeLower = contentType.toLowerCase();
  if (contentTypeLower.includes('pdf') && !filenameLower.endsWith('.pdf')) {
    filename += '.pdf';
  } else if ((contentTypeLower.includes('word') || contentTypeLower.includes('officedocument') || contentTypeLower.includes('docx')) && !filenameLower.endsWith('.docx')) {
    filename += '.docx';
  } else if (contentTypeLower.includes('zip') && !filenameLower.endsWith('.zip')) {
    filename += '.zip';
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.setAttribute('download', filename);
  
  document.body.appendChild(link);
  
  // Dispatch native MouseEvent click
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(clickEvent);

  // Remove the temporary link from DOM after 1 second, but keep the blob URL in memory to prevent Chrome metadata loss
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 1000);
};


export const mergePDFs = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return api.post('/pdf/merge', formData, { responseType: 'blob' });
};

export const splitPDF = (file, splitPages) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('splitPages', splitPages);
  return api.post('/pdf/split', formData, { responseType: 'blob' });
};

export const organizePDF = (file, operations) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('operations', JSON.stringify(operations));
  return api.post('/pdf/organize', formData, { responseType: 'blob' });
};

export const editPDF = (file, elements) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('elements', JSON.stringify(elements));
  return api.post('/pdf/edit', formData, { responseType: 'blob' });
};

export const convertWordToPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/convert/word-to-pdf', formData, { responseType: 'blob' });
};

export const convertPdfToWord = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/convert/pdf-to-word', formData, { responseType: 'blob' });
};

export const protectPDF = (file, password) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  return api.post('/secure/protect', formData, { responseType: 'blob' });
};

export const unlockPDF = (file, password) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  return api.post('/secure/unlock', formData, { responseType: 'blob' });
};

export default api;
