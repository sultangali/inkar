import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { contactService } from '../../services/api';
import { format } from 'date-fns';
import { Mail, User, Phone, MessageSquare, Clock, CheckCircle, Archive, Trash2, Eye } from 'lucide-react';

export const DashboardMessages = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filter, page]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const filters = {
        page,
        limit: 20
      };
      if (filter !== 'all') {
        filters.status = filter;
      }
      const response = await contactService.getMessages(filters);
      setMessages(response.data || []);
      setTotalPages(response.pages || 1);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contactService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const response = await contactService.getMessage(messageId);
      setSelectedMessage(response.data);
      setShowModal(true);
      loadMessages(); // Reload to update status
    } catch (err) {
      console.error('Failed to load message', err);
    }
  };

  const handleUpdateStatus = async (messageId, status) => {
    try {
      await contactService.updateMessage(messageId, status);
      loadMessages();
      loadStats();
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (err) {
      console.error('Failed to update message status', err);
      alert(t('common.error'));
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm(t('dashboard.messagesPage.deleteConfirm'))) return;
    
    try {
      await contactService.deleteMessage(messageId);
      loadMessages();
      loadStats();
      if (selectedMessage && selectedMessage._id === messageId) {
        setShowModal(false);
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message', err);
      alert(t('common.error'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'warning',
      read: 'info',
      replied: 'success',
      archived: 'default'
    };
    return colors[status] || 'default';
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'moderator']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.messagesPage.title')}</h1>
              <p className="text-gray-600 mt-1">{t('dashboard.messagesPage.subtitle')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('dashboard.messagesPage.stats.total')}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Mail className="w-8 h-8 text-primary-500" />
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('dashboard.messagesPage.stats.new')}</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('dashboard.messagesPage.stats.read')}</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('dashboard.messagesPage.stats.replied')}</p>
                      <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
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
                    {status === 'all' ? t('common.all') : t(`dashboard.messagesPage.status.${status}`)}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.messagesPage.allMessages')}</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : messages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.messagesPage.from')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.messagesPage.subject')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('dashboard.messagesPage.date')}
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
                      {messages.map((message) => (
                        <tr 
                          key={message._id} 
                          className={`hover:bg-gray-50 ${message.status === 'new' ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {message.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {message.email}
                                </p>
                                {message.phone && (
                                  <p className="text-xs text-gray-400 flex items-center mt-1">
                                    <Phone size={12} className="mr-1" />
                                    {message.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="max-w-xs">
                              <p className="font-medium text-gray-900 truncate">
                                {message.subject}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {message.message.substring(0, 60)}...
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-start">
                              <Clock size={16} className="text-gray-400 mr-2 mt-1" />
                              <div>
                                <p className="text-sm text-gray-900">
                                  {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(message.createdAt), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={getStatusColor(message.status)}>
                              {t(`dashboard.messagesPage.status.${message.status}`)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewMessage(message._id)}
                                className="text-primary-600 hover:text-primary-700"
                                title={t('dashboard.messagesPage.view')}
                              >
                                <Eye size={20} />
                              </button>
                              {message.status !== 'replied' && (
                                <button
                                  onClick={() => handleUpdateStatus(message._id, 'replied')}
                                  className="text-green-600 hover:text-green-700"
                                  title={t('dashboard.messagesPage.markReplied')}
                                >
                                  <CheckCircle size={20} />
                                </button>
                              )}
                              {message.status !== 'archived' && (
                                <button
                                  onClick={() => handleUpdateStatus(message._id, 'archived')}
                                  className="text-gray-600 hover:text-gray-700"
                                  title={t('dashboard.messagesPage.archive')}
                                >
                                  <Archive size={20} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(message._id)}
                                className="text-red-600 hover:text-red-700"
                                title={t('common.delete')}
                              >
                                <Trash2 size={20} />
                              </button>
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
                  <Mail size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('dashboard.messagesPage.noMessages')}
                  </h3>
                  <p className="text-gray-600">
                    {t('dashboard.messagesPage.noMessagesDescription')}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Message Detail Modal */}
        {showModal && selectedMessage && (
          <Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedMessage(null);
            }}
            title={selectedMessage.subject}
          >
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.messagesPage.from')}</p>
                    <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone size={14} className="mr-1" />
                        {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.messagesPage.date')}</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedMessage.createdAt), 'PPpp')}
                    </p>
                    <Badge variant={getStatusColor(selectedMessage.status)} className="mt-2">
                      {t(`dashboard.messagesPage.status.${selectedMessage.status}`)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">{t('dashboard.messagesPage.message')}</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                {selectedMessage.status !== 'replied' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedMessage._id, 'replied');
                    }}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    {t('dashboard.messagesPage.markReplied')}
                  </Button>
                )}
                {selectedMessage.status !== 'archived' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedMessage._id, 'archived');
                    }}
                  >
                    <Archive size={16} className="mr-2" />
                    {t('dashboard.messagesPage.archive')}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

