import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, File } from 'lucide-react';

const DocumentUpload: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<'text' | 'pdf'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // Set file type based on file extension
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setFileType('pdf');
      } else {
        setFileType('text');
      }
      
      // Set title from file name
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
      
      // For text files, read content
      if (selectedFile.type.startsWith('text/') || selectedFile.name.toLowerCase().endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target?.result as string || '');
        };
        reader.readAsText(selectedFile);
      } 
      // For PDF files, read as base64
      else if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target?.result as string || '');
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    
    try {
      // For PDF files, we send the base64 encoded file
      let fileContent = content;
      let fileSize = file?.size || 0;
      
      if (fileType === 'pdf' && file) {
        // Send the base64 encoded PDF file
        fileSize = file.size;
      }
      
      const response = await fetch('/api/account/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content: fileContent,
          fileType,
          fileSize
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate('/account/profile');
        }, 2000);
      } else {
        setError(data.message || 'Failed to upload document');
      }
    } catch (err) {
      setError('Failed to upload document: ' + (err as Error).message);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/account/profile" className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Profile
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Legal Document</h1>
            <p className="text-gray-600 mb-6">Upload a text document or PDF for legal analysis</p>
            
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800 mb-2">Document Uploaded Successfully!</h3>
                <p className="text-green-700">Redirecting to your profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter document title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-lg border ${
                          fileType === 'text' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFileType('text')}
                      >
                        <FileText className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <span className="text-sm font-medium">Text Document</span>
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-lg border ${
                          fileType === 'pdf' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFileType('pdf')}
                      >
                        <File className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <span className="text-sm font-medium">PDF Document</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fileType === 'text' ? 'Document Content' : 'Upload File'}
                    </label>
                    
                    {fileType === 'text' ? (
                      <textarea
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Paste your legal document content here..."
                        required
                      />
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition duration-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          {file ? file.name : 'Click to upload PDF file'}
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF files up to 10MB
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Link to="/account/profile">
                      <button
                        type="button"
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
                      >
                        Cancel
                      </button>
                    </Link>
                    <button
                      type="submit"
                      disabled={isUploading || (fileType === 'pdf' && !file)}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition duration-300 ${
                        isUploading || (fileType === 'pdf' && !file)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      }`}
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        'Upload Document'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentUpload;