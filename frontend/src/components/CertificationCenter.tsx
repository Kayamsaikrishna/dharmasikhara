import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  duration: string;
  difficulty: string;
  practiceAreas: string[];
  price: number;
}

interface UserCertification {
  id: string;
  certificationType: string;
  certificationName: string;
  issueDate: string;
  expiryDate: string;
  userName: string;
  userId: string;
  blockchainHash: string;
  status: string;
}

interface EligibilityStatus {
  eligible: boolean;
  completedScenarios: number;
  requiredScenarios: number;
  averageScore: number;
  minAverageScore: number;
  practiceArea: string;
}

const CertificationCenter: React.FC = () => {
  const { t } = useLanguage();
  const [availableCertifications, setAvailableCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus | null>(null);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Mock user ID for demonstration
  const userId = 'user-123';

  // Fetch available certifications
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        // Use relative URLs for production
        const response = await fetch(`/api/certification`);
        const data = await response.json();
        
        if (data.success) {
          setAvailableCertifications(data.data);
        } else {
          setError(data.message || 'Failed to fetch certifications');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Fetch certifications error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Fetch user's certifications
  useEffect(() => {
    const fetchUserCertifications = async () => {
      try {
        // Use relative URLs for production
        const response = await fetch(`/api/certification/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setUserCertifications(data.data);
        }
      } catch (err) {
        console.error('Fetch user certifications error:', err);
      }
    };

    fetchUserCertifications();
  }, []);

  const handleCertificationSelect = async (certification: Certification) => {
    setSelectedCertification(certification);
    setEligibilityStatus(null);
    setVerificationResult(null);
    
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/certification/eligibility/${userId}/${certification.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEligibilityStatus(data.data);
      }
    } catch (err) {
      console.error('Check eligibility error:', err);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedCertification) return;
    
    setIssuingCertificate(true);
    setError('');
    
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/certification/issue/${userId}/${selectedCertification.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new certificate to user's certificates
        if (data.data) {
          setUserCertifications(prev => [...prev, {
            id: data.data.id,
            certificationType: data.data.certificationType,
            certificationName: data.data.certificationName,
            issueDate: data.data.issueDate,
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString(),
            userName: data.data.userName,
            userId: data.data.userId,
            blockchainHash: data.data.blockchainHash,
            status: 'active'
          }]);
          
          // Show success message
          alert('Certificate issued successfully!');
        }
      } else {
        setError(data.message || 'Failed to issue certificate');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Issue certificate error:', err);
    } finally {
      setIssuingCertificate(false);
    }
  };

  const handleVerifyCertificate = async (certificateId: string) => {
    try {
      // Use relative URLs for production
      const response = await fetch(`/api/certification/verify/${certificateId}`);
      const data = await response.json();
      
      if (data.success) {
        setVerificationResult({
          valid: data.data.valid,
          message: data.data.message
        });
      } else {
        setError(data.message || 'Failed to verify certificate');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Verify certificate error:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('certifications.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('certifications.description')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Certifications */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('certifications.availableCertifications')}
            </h2>
            
            {availableCertifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCertifications.map((cert) => (
                  <div 
                    key={cert.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCertification?.id === cert.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleCertificationSelect(cert)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {cert.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(cert.difficulty)}`}>
                        {cert.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {cert.description}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{cert.duration}</span>
                      <span>{cert.practiceAreas.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('certifications.noCertifications')}
                </p>
              </div>
            )}
          </div>

          {/* Earned Certifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('certifications.earnedCertifications')}
            </h2>
            
            {userCertifications.length > 0 ? (
              <div className="space-y-4">
                {userCertifications.map((cert) => (
                  <div 
                    key={cert.id} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {cert.certificationName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {cert.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {cert.id}
                      </span>
                      <button
                        onClick={() => handleVerifyCertificate(cert.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('certifications.verify')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('certifications.noEarnedCertifications')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Certification Details */}
        <div className="lg:col-span-1">
          {selectedCertification ? (
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCertification.name}
                    </h2>
                    <button
                      onClick={() => setSelectedCertification(null)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {selectedCertification.description}
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('certifications.requirements')}
                      </h3>
                      <ul className="space-y-2">
                        {selectedCertification.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-green-500">✓</span>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {t('certifications.duration')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {selectedCertification.duration}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {t('certifications.difficulty')}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(selectedCertification.difficulty)}`}>
                          {selectedCertification.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {eligibilityStatus && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('certifications.eligibilityStatus')}
                      </h3>
                      {eligibilityStatus.eligible ? (
                        <div className="text-green-700 dark:text-green-300">
                          <p className="mb-2">✓ {t('certifications.eligible')}</p>
                          <p className="text-sm">
                            {t('certifications.completedScenarios')}: {eligibilityStatus.completedScenarios}/{eligibilityStatus.requiredScenarios}
                          </p>
                          <p className="text-sm">
                            {t('certifications.averageScore')}: {eligibilityStatus.averageScore}% (Required: {eligibilityStatus.minAverageScore}%)
                          </p>
                        </div>
                      ) : (
                        <div className="text-yellow-700 dark:text-yellow-300">
                          <p className="mb-2">⚠ {t('certifications.notEligible')}</p>
                          <p className="text-sm">
                            {t('certifications.completedScenarios')}: {eligibilityStatus.completedScenarios}/{eligibilityStatus.requiredScenarios}
                          </p>
                          <p className="text-sm">
                            {t('certifications.averageScore')}: {eligibilityStatus.averageScore}% (Required: {eligibilityStatus.minAverageScore}%)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={handleIssueCertificate}
                    disabled={!eligibilityStatus?.eligible || issuingCertificate}
                    className={`w-full py-2 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      eligibilityStatus?.eligible 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {issuingCertificate ? t('common.loading') : t('certifications.issueCertificate')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('certifications.certificationDetails')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('certifications.selectCertification')}
              </p>
            </div>
          )}
          
          {/* Verification Result */}
          {verificationResult && (
            <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('certifications.verificationResult')}
              </h2>
              <div className={`p-3 rounded-md ${verificationResult.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={`text-sm ${verificationResult.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {verificationResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationCenter;