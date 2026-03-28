import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { analyticsService } from '../../services/api';
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

export const DashboardAnalytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [workspaceData, setWorkspaceData] = useState([]);
  const [revenueByType, setRevenueByType] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load revenue data
      const revenueResponse = await analyticsService.getRevenue({ groupBy: 'day' });
      setRevenueData(revenueResponse.data);

      // Load workspace popularity
      const workspaceResponse = await analyticsService.getWorkspacePopularity();
      setWorkspaceData(workspaceResponse.data);

      // Load revenue by type
      const revenueTypeResponse = await analyticsService.getRevenueByType();
      setRevenueByType(revenueTypeResponse.data);

      // Load payment methods
      const paymentResponse = await analyticsService.getPaymentMethods();
      setPaymentMethods(paymentResponse.data);

      // Load booking trends
      const trendsResponse = await analyticsService.getBookingTrends(30);
      setBookingTrends(trendsResponse.data);

    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2196f3', '#1976d2', '#64b5f6', '#42a5f5', '#90caf9', '#bbdefb'];

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'moderator', 'employee']}>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.analytics')}</h1>
            <p className="text-gray-600 mt-2">{t('dashboard.analyticsDescription')}</p>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.kpi.totalRevenue')}</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Workspace Popularity */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.workspacePopularity')}</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workspaceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workspaceName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookingCount" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Revenue by Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.revenueByType')}</h2>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByType}
                      dataKey="totalRevenue"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {revenueByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('dashboard.paymentMethodsDistribution')}</h2>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      dataKey="count"
                      nameKey="paymentMethod"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Booking Trends */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.bookingTrends')} ({t('dashboard.last30Days')})</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#2196f3" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

