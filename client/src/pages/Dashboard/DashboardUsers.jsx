import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { adminService } from '../../services/api';
import { User, Mail, Phone, Building } from 'lucide-react';

export const DashboardUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { role: filter } : {};
      const response = await adminService.getUsers(filters);
      setUsers(response.users);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers();
    } catch (err) {
      console.error('Failed to update user role', err);
      alert(t('common.error'));
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'danger',
      moderator: 'warning',
      employee: 'primary',
      client: 'default'
    };
    return colors[role] || 'default';
  };

  const roles = [
    { value: 'all', label: t('common.all') },
    { value: 'client', label: t('dashboard.client') },
    { value: 'employee', label: t('dashboard.employee') },
    { value: 'moderator', label: t('dashboard.moderator') },
    { value: 'admin', label: t('dashboard.admin') }
  ];

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.users')}</h1>
          </div>

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setFilter(role.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === role.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('dashboard.users')}</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.name')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.email')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.phone')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.company')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.role')}</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('dashboard.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <User size={16} className="mr-2 text-gray-400" />
                              <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Mail size={16} className="mr-2 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Phone size={16} className="mr-2 text-gray-400" />
                              <span>{user.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Building size={16} className="mr-2 text-gray-400" />
                              <span>{user.company || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={getRoleColor(user.role)}>
                              {t(`dashboard.${user.role}`)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="client">{t('dashboard.client')}</option>
                              <option value="employee">{t('dashboard.employee')}</option>
                              <option value="moderator">{t('dashboard.moderator')}</option>
                              <option value="admin">{t('dashboard.admin')}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {t('common.noResults')}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

