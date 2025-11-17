import React, { useState, useRef } from 'react';

interface DocumentExtractorProps {
  onDocumentAnalyzed?: (data: any) => void;
}

const DocumentExtractor: React.FC<DocumentExtractorProps> = ({ onDocumentAnalyzed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError('');
      setSuccess('');
      setExtractedText('');
      setAnalysisResult(null);
      
      // Validate file type
      const validTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      const validExtensions = ['.pdf', '.txt', '.docx', '.doc'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
        setError('Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.');
        return;
      }
      
      // Process the file
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      // For text files, read directly
      if (selectedFile.type.startsWith('text/') || selectedFile.name.toLowerCase().endsWith('.txt')) {
        const text = await selectedFile.text();
        setExtractedText(text);
        await analyzeDocument(text);
        return;
      }
      
      // For other files, send to backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/account/extract-text', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setExtractedText(data.text);
        setSuccess('Document processed successfully!');
        await analyzeDocument(data.text);
      } else {
        throw new Error(data.message || 'Failed to extract text from document');
      }
    } catch (err) {
      console.error('Document processing error:', err);
      setError(`Error processing document: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeDocument = async (text: string) => {
    if (!text.trim()) {
      setError('No text content to analyze');
      return;
    }
    
    try {
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentText: text })
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
        setSuccess('Document analyzed successfully!');
        // Notify parent component if callback provided
        if (onDocumentAnalyzed) {
          onDocumentAnalyzed(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to analyze document');
      }
    } catch (err) {
      console.error('Document analysis error:', err);
      setError(`Error analyzing document: ${(err as Error).message}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Professional Document Extractor</h1>
        <p className="text-gray-600">Upload any legal document for text extraction and AI-powered analysis</p>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {file ? file.name : 'Click to upload a document'}
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, TXT, DOC, DOCX files
            </p>
            {file && (
              <p className="text-xs text-gray-400 mt-2">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-700">Processing document...</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Document Type</h3>
              <p className="text-blue-700">{analysisResult.document_type || 'Unknown'}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Document Length</h3>
              <p className="text-blue-700">{analysisResult.document_length?.toLocaleString() || 0} characters</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Document Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{analysisResult.summary || 'No summary available'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Key Terms</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.key_terms?.slice(0, 10).map((term: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {term}
                  </span>
                )) || <p className="text-gray-500">No key terms identified</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Parties Involved</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.parties_involved?.map((party: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {party}
                  </span>
                )) || <p className="text-gray-500">No parties identified</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Extracted Text</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <pre className="text-gray-700 whitespace-pre-wrap font-sans">
              {extractedText.substring(0, 1000)}
              {extractedText.length > 1000 ? '...' : ''}
            </pre>
            {extractedText.length > 1000 && (
              <p className="text-gray-500 text-sm mt-2">
                Showing first 1000 characters. Total length: {extractedText.length} characters.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={triggerFileInput}
          disabled={isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Another Document
        </button>
        
        {analysisResult && (
          <button
            onClick={() => {
              // Download analysis as JSON
              const dataStr = JSON.stringify(analysisResult, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = 'document-analysis.json';
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentExtractor;