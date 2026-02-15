import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { WorkspaceFormModal } from '../../components/WorkspaceFormModal';
import { useToast } from '../../components/ui/Toast';
import { workspaceService } from '../../services/api';
import { MapPin, Users, Edit, Trash2, Plus, AlertTriangle, Wifi, Monitor, Coffee } from 'lucide-react';

export const DashboardWorkspaces = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, [filter]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { type: filter } : {};
      const response = await workspaceService.getAll(filters);
      setWorkspaces(response.workspaces);
    } catch (err) {
      console.error('Failed to load workspaces', err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorkspace(null);
    setShowFormModal(true);
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingWorkspace) {
        await workspaceService.update(editingWorkspace._id, formData);
        toast.success(t('workspaceForm.updateSuccess'));
      } else {
        await workspaceService.create(formData);
        toast.success(t('workspaceForm.createSuccess'));
      }
      setShowFormModal(false);
      setEditingWorkspace(null);
      loadWorkspaces();
    } catch (err) {
      console.error('Failed to save workspace', err);
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await workspaceService.delete(deleteTarget._id);
      toast.success(t('workspaceForm.deleteSuccess'));
      setDeleteTarget(null);
      loadWorkspaces();
    } catch (err) {
      console.error('Failed to delete workspace', err);
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await workspaceService.update(id, { isActive: !currentStatus });
      toast.success(!currentStatus ? t('workspaceForm.activated') : t('workspaceForm.deactivated'));
      loadWorkspaces();
    } catch (err) {
      console.error('Failed to update workspace', err);
      toast.error(t('common.error'));
    }
  };

  const workspaceTypes = [
    { value: 'all', label: t('common.all') },
    { value: 'desk', label: t('workspace.types.desk') },
    { value: 'meeting_room', label: t('workspace.types.meeting_room') },
    { value: 'private_office', label: t('workspace.types.private_office') },
    { value: 'hot_desk', label: t('workspace.types.hot_desk') }
  ];

  const getTypeColor = (type) => {
    const colors = {
      desk: 'from-blue-400 to-blue-600',
      meeting_room: 'from-purple-400 to-purple-600',
      private_office: 'from-emerald-400 to-emerald-600',
      hot_desk: 'from-orange-400 to-orange-600'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'moderator', 'employee']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.workspaces')}</h1>
              <p className="text-gray-500 mt-1">{t('workspaceForm.manageDescription')}</p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus size={20} />
              {t('common.create')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t('common.all')}</p>
              <p className="text-2xl font-bold text-gray-900">{workspaces.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t('workspace.available')}</p>
              <p className="text-2xl font-bold text-green-600">{workspaces.filter(w => w.isActive).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t('dashboard.inactive')}</p>
              <p className="text-2xl font-bold text-red-500">{workspaces.filter(w => !w.isActive).length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{t('workspaceForm.avgPrice')}</p>
              <p className="text-2xl font-bold text-primary-600">
                ₸{workspaces.length > 0 ? Math.round(workspaces.reduce((sum, w) => sum + w.pricePerHour, 0) / workspaces.length) : 0}
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {workspaceTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFilter(type.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === type.value
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Workspaces Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.workspaces')}</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : workspaces.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.name')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.type')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('booking.pricePerHour')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('booking.capacity')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('booking.floor')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('workspaceForm.amenities')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.status')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaces.map((workspace) => (
                        <tr key={workspace._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(workspace.type)} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-xs font-bold">
                                  {workspace.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{workspace.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{workspace.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="primary">{t(`workspace.types.${workspace.type}`)}</Badge>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-primary-600">₸{workspace.pricePerHour}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Users size={16} className="mr-1 text-gray-400" />
                              <span>{workspace.capacity}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-1 text-gray-400" />
                              <span>{workspace.floor || 1}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {(workspace.amenities || []).slice(0, 3).map(a => (
                                <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {t(`amenity.${a}`, { defaultValue: a })}
                                </span>
                              ))}
                              {(workspace.amenities || []).length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                  +{workspace.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={workspace.isActive ? 'success' : 'danger'}>
                              {workspace.isActive ? t('workspace.available') : t('dashboard.inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleToggleActive(workspace._id, workspace.isActive)}
                                className="!px-2 !py-1.5"
                              >
                                {workspace.isActive ? t('dashboard.deactivate') : t('dashboard.activate')}
                              </Button>
                              <button
                                onClick={() => handleEdit(workspace)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title={t('common.edit')}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(workspace)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('common.delete')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.noResults')}</h3>
                  <p className="text-gray-500 mb-4">{t('workspaceForm.noWorkspacesMessage')}</p>
                  <Button onClick={handleCreate}>
                    <Plus size={16} className="mr-2" />
                    {t('workspaceForm.createFirst')}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Create/Edit Modal */}
        <WorkspaceFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingWorkspace(null);
          }}
          onSubmit={handleFormSubmit}
          workspace={editingWorkspace}
          loading={submitting}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={t('workspaceForm.deleteTitle')}
          size="sm"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <p className="text-gray-600 mb-2">{t('workspaceForm.deleteConfirm')}</p>
            <p className="font-semibold text-gray-900 text-lg">{deleteTarget?.name}</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? t('common.loading') : t('common.delete')}
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
};
