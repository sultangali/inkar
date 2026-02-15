import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { bookingService } from '../../services/api';
import { format } from 'date-fns';
import { Calendar, User, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

export const DashboardBookings = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBookings();
  }, [filter, page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const filters = {
        page,
        limit: 20
      };
      if (filter !== 'all') {
        filters.status = filter;
      }
      const response = await bookingService.getAll(filters);
      setBookings(response.bookings);
      setTotalPages(response.pages);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await bookingService.confirm(bookingId);
      loadBookings();
    } catch (err) {
      console.error('Failed to confirm booking', err);
      alert(t('common.error'));
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm(t('booking.cancelConfirm'))) return;
    
    try {
      await bookingService.cancel(bookingId, t('booking.cancelConfirm'));
      loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking', err);
      alert(t('common.error'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'default'
    };
    return colors[status] || 'default';
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'moderator', 'employee']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.bookingsManagement')}</h1>
          </div>

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilter(status);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      filter === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? t('common.all') : t(`booking.status.${status}`)}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.allBookings')}</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.workspace')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.customer')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.dateTime')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.price')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <MapPin size={16} className="text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {booking.workspace?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.workspace?.type ? t(`workspace.types.${booking.workspace.type}`) : '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {booking.user?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {booking.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-start">
                              <Clock size={16} className="text-gray-400 mr-2 mt-1" />
                              <div>
                                <p className="text-sm text-gray-900">
                                  {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(booking.startTime), 'HH:mm')} - 
                                  {format(new Date(booking.endTime), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">₸{booking.totalPrice}</p>
                            <p className="text-sm text-gray-500">{booking.totalHours}h</p>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={getStatusColor(booking.status)}>
                              {t(`booking.status.${booking.status}`)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleConfirm(booking._id)}
                                  className="text-green-600 hover:text-green-700"
                                  title={t('dashboard.confirm')}
                                >
                                  <CheckCircle size={20} />
                                </button>
                              )}
                              {['pending', 'confirmed'].includes(booking.status) && (
                                <button
                                  onClick={() => handleCancel(booking._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title={t('dashboard.cancel')}
                                >
                                  <XCircle size={20} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {t('dashboard.previous')}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {t('dashboard.page')} {page} {t('dashboard.of')} {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        {t('dashboard.next')}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('dashboard.noBookingsFound')}
                  </h3>
                  <p className="text-gray-600">
                    {t('dashboard.noBookingsMatch')}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

