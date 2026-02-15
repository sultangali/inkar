import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { FloorPlanSelector } from '../../components/FloorPlanSelector';
import { useToast } from '../../components/ui/Toast';
import { workspaceService, bookingService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, CreditCard, MapPin, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const BookingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: select workspace, 2: details, 3: confirm

  const [bookingData, setBookingData] = useState({
    workspace: searchParams.get('workspace') || '',
    startTime: '',
    endTime: '',
    notes: '',
    paymentMethod: 'kaspi',
    discount: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/booking');
      return;
    }
    loadWorkspaces();
  }, [isAuthenticated]);

  useEffect(() => {
    if (bookingData.workspace) {
      loadWorkspaceDetails(bookingData.workspace);
      if (step === 1) setStep(2);
    }
  }, [bookingData.workspace]);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceService.getAll({ isActive: true });
      setWorkspaces(response.workspaces);
      
      if (searchParams.get('workspace')) {
        setBookingData(prev => ({ ...prev, workspace: searchParams.get('workspace') }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceDetails = async (workspaceId) => {
    try {
      const response = await workspaceService.getById(workspaceId);
      setSelectedWorkspace(response.workspace);
    } catch (err) {
      console.error('Failed to load workspace details', err);
    }
  };

  const handleWorkspaceSelect = (wsId) => {
    setBookingData(prev => ({ ...prev, workspace: wsId }));
  };

  const formatDateTimeLocal = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const parseDateTimeLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    const match = dateTimeString.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!match) return new Date(dateTimeString);
    const [, day, month, year, hours, minutes] = match;
    const hour24 = parseInt(hours, 10);
    if (hour24 < 0 || hour24 > 23) return null;
    const min = parseInt(minutes, 10);
    if (min < 0 || min > 59) return null;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), hour24, min);
  };

  const calculateDuration = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    const start = parseDateTimeLocal(bookingData.startTime);
    const end = parseDateTimeLocal(bookingData.endTime);
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : 0;
  };

  const calculateTotalPrice = () => {
    if (!selectedWorkspace) return 0;
    const duration = calculateDuration();
    const basePrice = duration * selectedWorkspace.pricePerHour;
    const discountAmount = (basePrice * bookingData.discount) / 100;
    return basePrice - discountAmount;
  };

  const getDiscountForPeriod = (months) => {
    const discounts = { 0.25: 3, 1: 5, 3: 20, 6: 30 };
    return discounts[months] || 0;
  };

  const handleQuickSelect = (months) => {
    let start;
    if (bookingData.startTime) {
      start = parseDateTimeLocal(bookingData.startTime);
      if (!start || isNaN(start.getTime())) {
        start = new Date();
        start.setMinutes(0); start.setSeconds(0); start.setMilliseconds(0);
      }
    } else {
      start = new Date();
      start.setMinutes(0); start.setSeconds(0); start.setMilliseconds(0);
    }
    const end = new Date(start);
    if (months === 0.25) end.setDate(end.getDate() + 7);
    else if (months === 1) end.setDate(end.getDate() + 30);
    else if (months === 3) end.setDate(end.getDate() + 90);
    else if (months === 6) end.setDate(end.getDate() + 180);
    else end.setDate(end.getDate() + (months * 30));
    const discount = getDiscountForPeriod(months);
    setBookingData(prev => ({ ...prev, startTime: formatDateTimeLocal(start), endTime: formatDateTimeLocal(end), discount }));
  };

  const handleExtendBooking = (hours) => {
    if (!bookingData.endTime || !bookingData.startTime) return;
    const currentEnd = parseDateTimeLocal(bookingData.endTime);
    if (!currentEnd || isNaN(currentEnd.getTime())) return;
    const newEnd = new Date(currentEnd.getTime() + hours * 60 * 60 * 1000);
    const start = parseDateTimeLocal(bookingData.startTime);
    if (!start || isNaN(start.getTime())) return;
    const totalMonths = (newEnd - start) / (1000 * 60 * 60 * 24 * 30);
    let discount = 0;
    if (totalMonths >= 6) discount = 30;
    else if (totalMonths >= 3) discount = 20;
    else if (totalMonths >= 1) discount = 5;
    else if (totalMonths >= 0.25) discount = 3;
    setBookingData(prev => ({ ...prev, endTime: formatDateTimeLocal(newEnd), discount }));
  };

  useEffect(() => {
    if (bookingData.startTime && bookingData.endTime) {
      const start = parseDateTimeLocal(bookingData.startTime);
      const end = parseDateTimeLocal(bookingData.endTime);
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return;
      const totalMonths = (end - start) / (1000 * 60 * 60 * 24 * 30);
      let discount = 0;
      if (totalMonths >= 6) discount = 30;
      else if (totalMonths >= 3) discount = 20;
      else if (totalMonths >= 1) discount = 5;
      else if (totalMonths >= 0.25) discount = 3;
      setBookingData(prev => {
        if (prev.discount === discount) return prev;
        return { ...prev, discount };
      });
    }
  }, [bookingData.startTime, bookingData.endTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const startDate = parseDateTimeLocal(bookingData.startTime);
      const endDate = parseDateTimeLocal(bookingData.endTime);
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(t('booking.dateFormat'));
      }
      const duration = calculateDuration();
      if (duration < 1) throw new Error('Minimum booking duration is 1 hour');
      const maxHours = 6 * 30 * 24;
      if (duration > maxHours) throw new Error(`Maximum booking duration is ${maxHours} hours (6 months)`);
      const bookingDataForServer = { ...bookingData, startTime: startDate.toISOString(), endTime: endDate.toISOString() };
      await bookingService.create(bookingDataForServer);
      setSuccess(true);
      toast.success(t('booking.bookingSuccess'));
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('booking.title')}
            </h1>
            <p className="text-gray-500">{t('floorPlan.selectFromPlan')}</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step >= s
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-1 rounded-full transition-all duration-300 ${
                    step > s ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              {t('booking.bookingSuccess')}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Step 1: Select Workspace */}
          {step === 1 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <MapPin size={24} className="text-primary-500" />
                  {t('booking.selectWorkspace')}
                </h2>
              </CardHeader>
              <CardBody>
                <FloorPlanSelector
                  workspaces={workspaces}
                  selectedId={bookingData.workspace}
                  onSelect={handleWorkspaceSelect}
                  bookedIds={[]}
                />
              </CardBody>
            </Card>
          )}

          {/* Step 2: Booking Details */}
          {step >= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Selected Workspace Info */}
                {selectedWorkspace && (
                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <MapPin size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{selectedWorkspace.name}</h3>
                            <p className="text-sm text-gray-500">{t(`workspace.types.${selectedWorkspace.type}`)} -- {t('booking.floor')} {selectedWorkspace.floor || 1}</p>
                            <div className="flex gap-2 mt-1">
                              {(selectedWorkspace.amenities || []).slice(0, 4).map(a => (
                                <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{t(`amenity.${a}`, { defaultValue: a })}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setStep(1); setBookingData(prev => ({ ...prev, workspace: '' })); setSelectedWorkspace(null); }}>
                          {t('floorPlan.changeWorkspace')}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Booking Form */}
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Calendar size={20} className="text-primary-500" />
                      {t('booking.bookingDetails')}
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Quick Select Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('booking.quickSelect')}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { months: 0.25, label: t('booking.week'), discount: '3%' },
                            { months: 1, label: `1 ${t('booking.month')}`, discount: '5%' },
                            { months: 3, label: `3 ${t('booking.months')}`, discount: '20%' },
                            { months: 6, label: `6 ${t('booking.months')}`, discount: '30%' }
                          ].map(({ months, label, discount }) => (
                            <button
                              key={months}
                              type="button"
                              onClick={() => handleQuickSelect(months)}
                              className="px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl text-sm font-medium text-blue-700 transition-all duration-200 hover:shadow-md"
                            >
                              {label}
                              <br />
                              <span className="text-xs text-green-600 font-semibold">-{discount}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock size={14} className="inline mr-1" />
                            {t('booking.startTime')}
                          </label>
                          <Input
                            name="startTime"
                            type="text"
                            value={bookingData.startTime}
                            onChange={handleInputChange}
                            placeholder="dd/mm/yyyy HH:mm"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">{t('booking.dateFormat')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock size={14} className="inline mr-1" />
                            {t('booking.endTime')}
                          </label>
                          <Input
                            name="endTime"
                            type="text"
                            value={bookingData.endTime}
                            onChange={handleInputChange}
                            placeholder="dd/mm/yyyy HH:mm"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">{t('booking.dateFormat')}</p>
                          {bookingData.endTime && (
                            <div className="mt-2 flex gap-2">
                              {[
                                { hours: 24, label: t('booking.extendDay') },
                                { hours: 168, label: t('booking.extendWeek') },
                                { hours: 720, label: t('booking.extendMonth') }
                              ].map(({ hours, label }) => (
                                <button
                                  key={hours}
                                  type="button"
                                  onClick={() => handleExtendBooking(hours)}
                                  className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <CreditCard size={14} className="inline mr-1" />
                          {t('booking.paymentMethod')}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'kaspi', label: t('booking.paymentMethods.kaspi'), color: 'from-red-400 to-red-500' },
                            { value: 'card', label: t('booking.paymentMethods.card'), color: 'from-blue-400 to-blue-500' },
                            { value: 'cash', label: t('booking.paymentMethods.cash'), color: 'from-green-400 to-green-500' }
                          ].map(({ value, label, color }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: value }))}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                bookingData.paymentMethod === value
                                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('booking.notes')}
                        </label>
                        <textarea
                          name="notes"
                          value={bookingData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          placeholder={t('booking.notesPlaceholder')}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full py-4 text-lg"
                        disabled={submitting || !selectedWorkspace || !bookingData.startTime || !bookingData.endTime}
                      >
                        {submitting ? t('common.loading') : t('booking.confirmBooking')}
                        {!submitting && <ArrowRight className="inline ml-2" size={20} />}
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-semibold">{t('booking.summary')}</h2>
                    </CardHeader>
                    <CardBody>
                      {selectedWorkspace ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{selectedWorkspace.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{selectedWorkspace.description}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Users size={16} className="mr-2" />
                                <span>{t('booking.capacity')}: {selectedWorkspace.capacity} {t('booking.people')}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin size={16} className="mr-2" />
                                <span>{t('booking.floor')} {selectedWorkspace.floor || 1}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">{t('booking.pricePerHour')}:</span>
                              <span className="font-medium">₸{selectedWorkspace.pricePerHour}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">{t('booking.duration')}:</span>
                              <span className="font-medium">{calculateDuration().toFixed(1)} {t('booking.hours')}</span>
                            </div>
                            {bookingData.discount > 0 && (
                              <>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-600">{t('booking.basePrice')}:</span>
                                  <span className="font-medium">
                                    ₸{(calculateDuration() * selectedWorkspace.pricePerHour).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-green-600">{t('booking.discount')} ({bookingData.discount}%):</span>
                                  <span className="font-medium text-green-600">
                                    -₸{((calculateDuration() * selectedWorkspace.pricePerHour * bookingData.discount) / 100).toFixed(2)}
                                  </span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                              <span>{t('booking.total')}:</span>
                              <span className="text-primary-600">₸{calculateTotalPrice().toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            {t('booking.selectWorkspaceMessage')}
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
