import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { bookingService } from '../../services/api';
import {
  User, Calendar, Clock, MapPin, CreditCard, Edit, X, Save,
  RotateCcw, XCircle, TrendingUp, DollarSign, Star, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Cancel booking
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', company: user.company || '' });
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getMy();
      setBookings(response.bookings);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const completed = bookings.filter(b => b.status === 'completed').length;
    // Find most booked workspace
    const wsCounts = {};
    bookings.forEach(b => {
      const name = b.workspace?.name || 'Unknown';
      wsCounts[name] = (wsCounts[name] || 0) + 1;
    });
    const favoriteWs = Object.entries(wsCounts).sort((a, b) => b[1] - a[1])[0];
    return { total, totalSpent, completed, favoriteWorkspace: favoriteWs ? favoriteWs[0] : '-' };
  }, [bookings]);

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'default' };
    return colors[status] || 'default';
  };

  const filterBookings = (status) => {
    const now = new Date();
    switch (status) {
      case 'upcoming':
        return bookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.startTime) > now);
      case 'past':
        return bookings.filter(b => b.status === 'completed' || new Date(b.endTime) < now);
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(activeTab);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateProfile(profileForm);
      setEditingProfile(false);
      toast.success(t('profile.profileUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.cancel(cancelTarget._id, cancelReason);
      toast.success(t('profile.bookingCancelled'));
      setCancelTarget(null);
      setCancelReason('');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* User Info Card */}
            <Card className="mb-8 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 relative">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              <CardBody className="p-6 -mt-14 relative"> 
                {/* Changed -mt-12 to -mt-14 to raise content up */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white flex-shrink-0 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                      <User className="text-white" size={40} />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0 pl-0 md:pl-2">
                    {editingProfile ? (
                      <div className="space-y-3 max-w-md">
                        <Input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('auth.name')}
                        />
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t('auth.phone')}
                        />
                        <Input
                          value={profileForm.company}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                          placeholder={t('auth.company')}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                            <Save size={16} />
                            {savingProfile ? t('common.loading') : t('common.save')}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingProfile(false)}>
                            <X size={16} />
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center" style={{ minHeight: '4.5rem' }}>
                        {/* Added minHeight and flex layout to help center and align username higher */}
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">{user?.name}</h1>
                        <p className="text-gray-500">{user?.email}</p>
                        {user?.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
                        {user?.company && <p className="text-sm text-gray-400">{user.company}</p>}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="primary">{t(`dashboard.${user?.role || 'client'}`)}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-10">
                    {!editingProfile && (
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                        <Edit size={16} />
                        {t('profile.editProfile')}
                      </Button>
                    )}
                    {user?.role && ['admin', 'moderator', 'employee'].includes(user.role) && (
                      <Link to="/dashboard"><Button variant="secondary" size="sm">{t('nav.dashboard')}</Button></Link>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500">{t('profile.totalBookings')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₸{stats.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{t('profile.totalSpent')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-xs text-gray-500">{t('profile.completedBookings')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 truncate">{stats.favoriteWorkspace}</p>
                    <p className="text-xs text-gray-500">{t('profile.favoriteWorkspace')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">{t('booking.myBookings')}</h2>
                  <Link to="/booking"><Button>{t('workspace.bookNow')}</Button></Link>
                </div>
              </CardHeader>
              <CardBody>
                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                  {['upcoming', 'past', 'cancelled'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t(`booking.${tab}`)}
                    </button>
                  ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                  <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {booking.workspace?.name || t('booking.workspace')}
                            </h3>
                            <Badge variant={getStatusColor(booking.status)} className="mt-1">
                              {t(`booking.status.${booking.status}`)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary-600">₸{booking.totalPrice}</span>
                            {booking.discount > 0 && (
                              <p className="text-xs text-green-600">-{booking.discount}% {t('booking.discount')}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            <span>{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span>{format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{booking.workspace?.type ? t(`workspace.types.${booking.workspace.type}`) : t('booking.notAvailable')}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard size={16} className="mr-2 text-gray-400" />
                            <span>{booking.totalHours}h x ₸{booking.workspace?.pricePerHour || 0}/h</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">{booking.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                          {(booking.status === 'confirmed' || booking.status === 'pending') && new Date(booking.startTime) > new Date() && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setCancelTarget(booking)}
                            >
                              <XCircle size={14} />
                              {t('booking.cancel')}
                            </Button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && booking.workspace && (
                            <Link to={`/booking?workspace=${booking.workspace._id}`}>
                              <Button size="sm" variant="outline">
                                <RotateCcw size={14} />
                                {t('profile.rebookAgain')}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activeTab === 'upcoming' ? t('booking.noUpcomingBookings') : t('booking.noBookings')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {activeTab === 'upcoming' ? t('booking.noUpcomingBookingsMessage') : t('booking.noBookingsMessage')}
                    </p>
                    {activeTab === 'upcoming' && (
                      <Link to="/booking"><Button>{t('booking.bookWorkspace')}</Button></Link>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Cancel Booking Modal */}
        <Modal
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          title={t('profile.cancelBooking')}
          size="sm"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <p className="text-gray-600 mb-2">{t('booking.cancelConfirm')}</p>
            <p className="font-semibold text-gray-900">{cancelTarget?.workspace?.name}</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t('profile.cancelReasonPlaceholder')}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleCancelBooking} disabled={cancelling}>
              {cancelling ? t('common.loading') : t('booking.cancel')}
            </Button>
          </div>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
};
