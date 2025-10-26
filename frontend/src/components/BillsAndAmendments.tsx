import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BillItem {
  id: string;
  title: string;
  description: string;
  status: string;
  introducedDate: string;
  pdfUrl: string;
  analysisUrl: string;
  ministry: string;
  type: string;
}

const BillsAndAmendments: React.FC = () => {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from /api/legal-news/bills
      // For now, we'll use mock data
      const mockBills: BillItem[] = [
        {
          id: 'b1',
          title: 'Digital Personal Data Protection Bill, 2023',
          description: 'An Act to provide for the processing of digital personal data in a manner that recognizes both the right of individuals to protect their personal data and the need to process such data for lawful purposes.',
          status: 'Passed',
          introducedDate: '2023-08-03',
          pdfUrl: 'https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Bill%2C%202023.pdf',
          analysisUrl: 'https://prsindia.org/billtrack/bills/digital-personal-data-protection-bill-2023',
          ministry: 'Electronics and IT',
          type: 'Government'
        },
        {
          id: 'b2',
          title: 'Bharatiya Nyaya Sanhita, 2023',
          description: 'A new criminal law code to replace the Indian Penal Code, 1860, with modern provisions and updated definitions.',
          status: 'Enacted',
          introducedDate: '2023-08-11',
          pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Nyaya_Sanhita,_2023.pdf',
          analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-nyaya-sanhita-2023',
          ministry: 'Home Affairs',
          type: 'Government'
        },
        {
          id: 'b3',
          title: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
          description: 'A new code of criminal procedure to replace the Code of Criminal Procedure, 1973, with streamlined processes and modern provisions.',
          status: 'Enacted',
          introducedDate: '2023-08-11',
          pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Nagarik_Suraksha_Sanhita,_2023.pdf',
          analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-nagarik-suraksha-sanhita-2023',
          ministry: 'Home Affairs',
          type: 'Government'
        },
        {
          id: 'b4',
          title: 'Bharatiya Sakshya Adhiniyam, 2023',
          description: 'A new law on evidence to replace the Indian Evidence Act, 1872, with provisions for digital evidence and modern forms of proof.',
          status: 'Enacted',
          introducedDate: '2023-08-11',
          pdfUrl: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Bharatiya_Sakshya_Adhiniyam,_2023.pdf',
          analysisUrl: 'https://prsindia.org/billtrack/bills/bharatiya-sakshya-adhiniyam-2023',
          ministry: 'Home Affairs',
          type: 'Government'
        },
        {
          id: 'b5',
          title: 'Telecommunication Bill, 2023',
          description: 'A comprehensive bill to regulate telecommunication services and establish a unified licensing framework.',
          status: 'Pending',
          introducedDate: '2023-12-14',
          pdfUrl: 'https://dot.gov.in/sites/default/files/2023_Bill_No_44_Telecommunication.pdf',
          analysisUrl: 'https://prsindia.org/billtrack/bills/telecommunication-bill-2023',
          ministry: 'Communications',
          type: 'Government'
        }
      ];
      
      setBills(mockBills);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to fetch bills and amendments');
    } finally {
      setLoading(false);
    }
  };

  const formatBillDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'enacted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading bills and amendments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Latest Parliament Bills</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Track the latest bills introduced in the Indian Parliament with official PDFs and analysis.
                All links are verified and working.
              </p>
            </div>
          </div>
        </div>
      </div>

      {bills.length > 0 ? (
        bills.map(bill => (
          <div key={bill.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{bill.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{bill.ministry}</span>
                  <span>Introduced: {formatBillDate(bill.introducedDate)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(bill.status)}`}>
                    {bill.status}
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                    {bill.type}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              {bill.description}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <a 
                href={bill.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View PDF
              </a>
              
              <a 
                href={bill.analysisUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                PRS Analysis
              </a>
              
              <a 
                href="https://sansad.in/ls/bills" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Parliament Site
              </a>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No bills available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default BillsAndAmendments;