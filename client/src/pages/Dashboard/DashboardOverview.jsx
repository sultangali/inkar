import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { analyticsService } from '../../services/api';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DashboardOverview = () => {
  const { t } = useTranslation();
  const [kpi, setKpi] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [workspaceData, setWorkspaceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load KPI
      const kpiResponse = await analyticsService.getKPI();
      setKpi(kpiResponse.kpi);

      // Load revenue data (last 30 days)
      const revenueResponse = await analyticsService.getRevenue({
        groupBy: 'day'
      });
      setRevenueData(revenueResponse.data);

      // Load workspace popularity
      const workspaceResponse = await analyticsService.getWorkspacePopularity();
      setWorkspaceData(workspaceResponse.data.slice(0, 5)); // Top 5

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2196f3', '#1976d2', '#64b5f6', '#42a5f5', '#90caf9'];

  const KPICard = ({ title, value, icon: Icon, change, prefix = '', suffix = '' }) => (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </h3>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span className="ml-1">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon className="text-primary-600" size={24} />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'moderator', 'employee']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'moderator', 'employee']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('dashboard.overview')}
            </h1>
            <p className="text-gray-600">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={t('dashboard.kpi.totalRevenue')}
              value={kpi?.totalRevenue || 0}
              icon={DollarSign}
              prefix="₸"
            />
            <KPICard
              title={t('dashboard.kpi.monthlyRevenue')}
              value={kpi?.monthlyRevenue || 0}
              icon={TrendingUp}
              prefix="₸"
            />
            <KPICard
              title={t('dashboard.kpi.totalBookings')}
              value={kpi?.totalBookings || 0}
              icon={Calendar}
            />
            <KPICard
              title={t('dashboard.kpi.utilizationRate')}
              value={kpi?.utilizationRate || 0}
              icon={Users}
              suffix="%"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.revenueTrend')} ({t('dashboard.last30Days')})</h2>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2196f3" 
                      strokeWidth={2}
                      name="Revenue (₸)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Workspace Popularity */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.topWorkspaces')}</h2>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workspaceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="workspaceName" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookingCount" fill="#2196f3" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Workspace Type */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.revenueByType')}</h2>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workspaceData}
                      dataKey="totalRevenue"
                      nameKey="workspaceName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {workspaceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.quickStatistics')}</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.activeBookings')}</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {kpi?.activeBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.monthlyBookings')}</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {kpi?.monthlyBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.averageBookingValue')}</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₸{kpi?.avgBookingValue?.toFixed(2) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{t('dashboard.totalCustomers')}</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {kpi?.totalCustomers || 0}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

