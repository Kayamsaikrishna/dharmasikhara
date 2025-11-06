import React, { useState, useEffect } from 'react';

const TestBailHearingScript: React.FC = () => {
  const [scriptData, setScriptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const response = await fetch('/scenario1/bail_hearing_script.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScriptData(data);
        setLoading(false);
      } catch (err: any) {
        setError(`Failed to fetch bail hearing script: ${err.message || err}`);
        setLoading(false);
      }
    };

    fetchScript();
  }, []);

  if (loading) {
    return <div className="p-4">Loading bail hearing script...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bail Hearing Script Test</h2>
      {scriptData ? (
        <div>
          <p><strong>Case:</strong> {scriptData.case_details?.case_title}</p>
          <p><strong>Court:</strong> {scriptData.case_details?.court}</p>
          <p><strong>Total Sequences:</strong> {scriptData.case_summary?.total_sequences}</p>
          <p><strong>First Sequence:</strong> {scriptData.court_session?.[0]?.dialogue}</p>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default TestBailHearingScript;