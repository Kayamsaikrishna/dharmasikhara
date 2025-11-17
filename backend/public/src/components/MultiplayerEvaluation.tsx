import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlayerMetrics {
  finalScore: number;
  accuracy: number;
  participationRate: number;
  averageResponseTime: number;
  argumentQuality: number;
  evidencePresentation: number;
  crossExamination: number;
  lastUpdated: string;
}

interface EvaluationReport {
  totalPlayers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  skillDistribution: Record<string, number>;
  performanceMetrics: Record<string, {
    score: number;
    skillLevel: string;
    strengths: string[];
    areasForImprovement: string[];
    participationRate: number;
    responseTime: number;
  }>;
  comparativeAnalysis: {
    topPerformers: Array<{id: string, score: number}>;
    performanceGap: number;
    averagePerformanceGap: number;
  };
}

const MultiplayerEvaluation: React.FC = () => {
  const { t } = useLanguage();
  const [gameId, setGameId] = useState('');
  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvaluationReport = async () => {
    if (!gameId.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/multiplayer/evaluation/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvaluationReport(data.data);
      } else {
        setError(data.message || 'Failed to fetch evaluation report');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Fetch evaluation report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-green-100 text-green-800';
      case 'Beginner': return 'bg-yellow-100 text-yellow-800';
      case 'Novice': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('multiplayer.evaluation.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('multiplayer.evaluation.description')}
        </p>
      </div>

      {/* Game ID Input */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('multiplayer.evaluation.gameId')}
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder={t('multiplayer.evaluation.gameIdPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchEvaluationReport}
              disabled={loading || !gameId.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('multiplayer.evaluation.generateReport')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {evaluationReport && (
        <>
          {/* Summary Metrics */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {evaluationReport.totalPlayers}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('multiplayer.evaluation.totalPlayers')}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {evaluationReport.averageScore.toFixed(1)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('multiplayer.evaluation.averageScore')}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className={`text-3xl font-bold ${getScoreColor(evaluationReport.highestScore)} mb-1`}>
                {evaluationReport.highestScore}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('multiplayer.evaluation.highestScore')}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className={`text-3xl font-bold ${getScoreColor(evaluationReport.lowestScore)} mb-1`}>
                {evaluationReport.lowestScore}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('multiplayer.evaluation.lowestScore')}
              </div>
            </div>
          </div>

          {/* Skill Distribution */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('multiplayer.evaluation.skillDistribution')}
            </h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(evaluationReport.skillDistribution).map(([skillLevel, count]) => (
                <div key={skillLevel} className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skillLevel)}`}>
                    {skillLevel}: {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Performance */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('multiplayer.evaluation.individualPerformance')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(evaluationReport.performanceMetrics).map(([playerId, metrics]) => (
                <div key={playerId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Player {playerId}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(metrics.skillLevel)}`}>
                        {metrics.skillLevel}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.score)}`}>
                      {metrics.score}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('multiplayer.evaluation.participation')}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {(metrics.participationRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('multiplayer.evaluation.responseTime')}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {metrics.responseTime.toFixed(1)}s
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('multiplayer.evaluation.strengths')}
                    </h4>
                    {metrics.strengths.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {metrics.strengths.map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {strength}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('multiplayer.evaluation.noStrengths')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('multiplayer.evaluation.areasForImprovement')}
                    </h4>
                    {metrics.areasForImprovement.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {metrics.areasForImprovement.map((improvement, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {improvement}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('multiplayer.evaluation.noImprovements')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparative Analysis */}
          {evaluationReport.comparativeAnalysis.topPerformers && evaluationReport.comparativeAnalysis.topPerformers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('multiplayer.evaluation.comparativeAnalysis')}
              </h2>
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('multiplayer.evaluation.topPerformers')}
                </h3>
                <div className="space-y-2">
                  {evaluationReport.comparativeAnalysis.topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="mr-3 font-medium text-gray-900 dark:text-white">
                          #{index + 1}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          Player {performer.id}
                        </span>
                      </div>
                      <span className={`font-medium ${getScoreColor(performer.score)}`}>
                        {performer.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('multiplayer.evaluation.performanceGap')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {evaluationReport.comparativeAnalysis.performanceGap.toFixed(1)}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('multiplayer.evaluation.averageGap')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {evaluationReport.comparativeAnalysis.averagePerformanceGap.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiplayerEvaluation;