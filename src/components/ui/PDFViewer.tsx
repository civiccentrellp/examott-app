'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';

// ✅ Set correct worker version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  preview?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, preview = false }) => {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(false);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(false);
  };

  if (error) {
    return (
      <div className="text-center text-red-600">
        Failed to load PDF.
      </div>
    );
  }

  return (
    <div
      // className="w-full h-full flex flex-col items-center overflow-y-auto bg-black/70"
      className={`w-full h-full flex flex-col items-center ${
  preview ? 'overflow-hidden bg-transparent' : 'overflow-y-auto bg-black/70'
}`}

      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={url}
        onLoadSuccess={onLoadSuccess}
        onLoadError={(err: Error) => {
          console.error("Failed to load PDF file:", err);
          setError(true);
        }}

        loading={
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading PDF...</span>
          </div>
        }
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page
            key={`page_${i + 1}`}
            // pageNumber={i + 1}
            pageNumber={preview ? 1 : i + 1}
            width={preview ? 60 : 900}
            height={preview ? 20 : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
