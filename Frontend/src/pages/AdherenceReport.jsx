import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import CircleProgress from '../components/CircleProgress';
import Card from '../components/Card';
import { TrendingUp, Award, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdherenceReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Use environment variable for backend URL, fallback to localhost:5000
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = `${backendUrl}/api/v1/adherence/report`;

      console.log('🔗 Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📊 Response status:', response.status);

      // Safe JSON parsing - read as text first
      const text = await response.text();
      console.log('📝 Response preview:', text.substring(0, 200)); // Log first 200 chars

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('❌ Failed to parse JSON response:', parseErr);
        console.error('📄 Full response text:', text);
        throw new Error('Server returned invalid JSON. Check browser console for details.');
      }

      // Check if response is OK
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `API Error: ${response.status}`);
      }

      // Check success flag
      if (!data.success) {
        throw new Error(data?.message || data?.error || 'API returned success: false');
      }

      // Validate data structure
      if (!data.data) {
        throw new Error('Invalid response structure from server - missing data field');
      }

      console.log('✅ Report data received:', data.data);
      setReport(data.data);
    } catch (err) {
      console.error('❌ Error fetching adherence report:', err);
      setError(err.message || 'Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // Refresh report every 5 minutes
    const interval = setInterval(fetchReport, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Report</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No data available yet. Add medications and start tracking to see your report.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Adherence Report" pageSubtitle="Your medication adherence analytics">
      <div className="space-y-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Adherence Circle */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <CircleProgress percentage={report?.summary?.adherence || 0} size={140} title="Adherence" />
              <p className="text-xs text-gray-600 mt-4 font-medium">Overall Adherence</p>
            </Card>
          </div>

          {/* Streak Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 h-full flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-4xl font-bold text-orange-900">{report?.streak?.current || 0}</p>
                  <p className="text-sm text-orange-700 font-medium mt-1">Current Streak</p>
                  <p className="text-xs text-orange-600 mt-3">Best: <span className="font-bold">{report?.streak?.longest || 0}</span> days</p>
                </div>
                <Award className="w-6 h-6 text-orange-500" />
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" 
                     style={{ width: `${Math.min(((report?.streak?.current || 0) / 30) * 100, 100)}%` }} />
              </div>
            </Card>
          </div>

          {/* Doses Taken Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 h-full flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-4xl font-bold text-green-900">{report?.summary?.taken || 0}</p>
                  <p className="text-sm text-green-700 font-medium mt-1">Doses Taken</p>
                  <p className="text-xs text-green-600 mt-3">Successfully completed</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Missed Doses Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 h-full flex flex-col justify-center">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-4xl font-bold text-red-900">{report?.summary?.missed || 0}</p>
                  <p className="text-sm text-red-700 font-medium mt-1">Doses Missed</p>
                  <p className="text-xs text-red-600 mt-3">Total count</p>
                </div>
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Monthly Trend Section */}
        <Card className="p-8 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Monthly Trend</h2>
          </div>
          
          {report?.monthly && report.monthly.length > 0 ? (
            <div className="space-y-5">
              {report.monthly.map((month, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 w-12 text-sm">{month?.month || 'N/A'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            {month?.taken || 0} / {month?.expected || 0} doses
                          </span>
                          <span className={`text-sm font-bold ${
                            (month?.percentage || 0) >= 80
                              ? 'text-green-600'
                              : (month?.percentage || 0) >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>{month?.percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (month?.percentage || 0) >= 80
                          ? 'bg-green-500'
                          : (month?.percentage || 0) >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(month?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">No monthly data available yet</p>
              <p className="text-gray-400 text-sm mt-1">Start logging doses to see trends</p>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-50 to-transparent">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Health Discipline Score</p>
            <p className="mt-3 text-4xl font-bold text-indigo-600">{report?.summary?.adherence || 0}<span className="text-xl">%</span></p>
            <p className="text-xs text-gray-500 mt-2">Overall consistency</p>
          </Card>

          <Card className="p-6 border-t-4 border-t-blue-500 bg-gradient-to-br from-blue-50 to-transparent">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Consistency Score</p>
            <p className="mt-3 text-4xl font-bold text-blue-600">{report?.streak?.current || 0}<span className="text-xl"> days</span></p>
            <p className="text-xs text-gray-500 mt-2">Current streak</p>
          </Card>

          <Card className="p-6 border-t-4 border-t-purple-500 bg-gradient-to-br from-purple-50 to-transparent">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Success Rate</p>
            <p className="mt-3 text-4xl font-bold text-purple-600">
              {(report?.summary?.taken || 0) + (report?.summary?.missed || 0) > 0 
                ? Math.round(((report?.summary?.taken || 0) / ((report?.summary?.taken || 0) + (report?.summary?.missed || 0))) * 100) 
                : 0}<span className="text-xl">%</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">Taken vs missed ratio</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
