import React, { useState, useEffect } from 'react';
import { Users, Trophy, Clock, Play, Search, Filter, Gift, Zap, FileText } from 'lucide-react';

interface Tournament {
  _id: string;
  name: string;
  description: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  prize: string;
  points: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'upcoming' | 'active' | 'completed';
}

interface LeaderboardEntry {
  _id: string;
  rank: number;
  username: string;
  score: number;
  scenariosCompleted: number;
  points: number;
  countryCode: string;
}

interface Friend {
  _id: string;
  username: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
  score: number;
  points: number;
}

const Multiplayer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'leaderboard' | 'friends' | 'rules'>('tournaments');
  const [searchTerm, setSearchTerm] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would fetch from actual API endpoints
        // For now, we'll show empty states until the backend endpoints are implemented
        setTournaments([]);
        setLeaderboard([]);
        setFriends([]);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching multiplayer data: ' + (err as Error).message);
        console.error('Error fetching multiplayer data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'away': return <div className="w-3 h-3 rounded-full bg-yellow-500"></div>;
      case 'offline': return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
      default: return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
    }
  };

  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tournament.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading multiplayer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Multiplayer Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Multiplayer Arena</h1>
        <p className="text-gray-600">Compete with legal professionals worldwide in real-time scenarios</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'tournaments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy className="w-5 h-5 inline mr-2" />
          Tournaments
        </button>
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'leaderboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Leaderboard
        </button>
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'friends' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('friends')}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Friends
        </button>
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'rules' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('rules')}
        >
          <FileText className="w-5 h-5 inline mr-2" />
          Rules
        </button>
      </div>

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Tournament Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map(tournament => (
                <div 
                  key={tournament._id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                        <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {tournament.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Gift className="w-4 h-4 mr-1" />
                        <span className="text-gray-700 text-sm font-bold">{tournament.points}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tournament.name}</h3>
                    <p className="text-gray-600 mb-4">{tournament.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {tournament.participants}/{tournament.maxParticipants}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-lg font-bold text-indigo-600">{tournament.prize}</div>
                    </div>
                    
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Join Tournament
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tournaments available yet</h3>
                <p className="text-gray-600">Check back later for new tournaments</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Leaderboard</h2>
            
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenarios</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map(player => (
                      <tr key={player._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              player.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                              player.rank === 2 ? 'bg-gray-100 text-gray-800' : 
                              player.rank === 3 ? 'bg-amber-100 text-amber-800' : 
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {player.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-bold">{player.username.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{player.username}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <span className={`fi fi-${player.countryCode.toLowerCase()} mr-2`}></span>
                                {player.countryCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{player.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.scenariosCompleted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-indigo-600">{player.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Leaderboard not available yet</h3>
                <p className="text-gray-600">Participate in tournaments to see rankings</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Friends</h2>
            
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map(friend => (
                  <div key={friend._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-bold">{friend.username.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="font-bold text-gray-900">{friend.username}</h3>
                          <div className="flex items-center">
                            {getStatusIcon(friend.status)}
                            <span className="text-xs text-gray-500 ml-1">{friend.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        friend.status === 'online' ? 'bg-green-100 text-green-800' :
                        friend.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {friend.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="font-bold text-gray-900">{friend.score}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="font-bold text-indigo-600">{friend.points.toLocaleString()}</p>
                      </div>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition duration-200">
                        Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No friends in your list yet</h3>
                <p className="text-gray-600 mb-4">Add friends to compete with them</p>
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                  Add Friends
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Invite Friends</h3>
              <p className="text-gray-600 mb-6">
                Challenge your friends to legal scenarios and climb the leaderboard together
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  Invite Friends
                </button>
                <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition duration-300 font-medium flex items-center justify-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Multiplayer Rules</h2>
          
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Tournament Rules</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>All participants must be registered users of the platform</li>
              <li>Tournaments are conducted in real-time with multiple participants</li>
              <li>Each scenario has a specific time limit for completion</li>
              <li>Scoring is based on accuracy, speed, and legal reasoning</li>
              <li>Participants are ranked based on their total score at the end of the tournament</li>
              <li>Prizes are awarded to top performers based on tournament rules</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Scoring System</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Accuracy: 50% of total score (correct answers and legal reasoning)</li>
              <li>Speed: 30% of total score (time taken to complete scenarios)</li>
              <li>Creativity: 20% of total score (innovative approaches to legal problems)</li>
              <li>Bonus points for perfect scores and early completion</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Fair Play Policy</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>No external assistance during tournaments</li>
              <li>No sharing of answers or collaborating with other participants</li>
              <li>Any violation of rules may result in disqualification</li>
              <li>Decisions of the moderators are final</li>
            </ul>
            
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-bold text-indigo-800 mb-2">Note</h4>
              <p className="text-indigo-700">
                These rules are subject to change. Please check back regularly for updates. 
                For any questions or concerns, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Multiplayer;