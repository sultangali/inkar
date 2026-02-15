import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { workspaceService } from '../../services/api';
import {
  Users, MapPin, Search, SlidersHorizontal, Eye, Heart, HeartOff,
  Wifi, Monitor, Coffee, Printer, Armchair, X, Building2, DoorOpen,
  ChevronDown
} from 'lucide-react';

const AMENITY_ICONS = {
  'WiFi': Wifi, 'Monitor': Monitor, 'Coffee': Coffee, 'Printer': Printer,
  'Standing Desk': Armchair, 'Locker': DoorOpen
};

const TYPE_GRADIENTS = {
  desk: 'from-blue-400 to-blue-600',
  meeting_room: 'from-purple-400 to-purple-600',
  private_office: 'from-emerald-400 to-emerald-600',
  hot_desk: 'from-orange-400 to-orange-600'
};

const TYPE_ICONS = {
  desk: Monitor, meeting_room: Users, private_office: Building2, hot_desk: Coffee
};

export const WorkspacesPage = () => {
  const { t } = useTranslation();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [capacityFilter, setCapacityFilter] = useState(0);
  const [quickViewWorkspace, setQuickViewWorkspace] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('workspace_favorites') || '[]');
    } catch { return []; }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceService.getAll();
      setWorkspaces(response.workspaces);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (wsId) => {
    setFavorites(prev => {
      const next = prev.includes(wsId) ? prev.filter(id => id !== wsId) : [...prev, wsId];
      localStorage.setItem('workspace_favorites', JSON.stringify(next));
      return next;
    });
  };

  const filteredWorkspaces = useMemo(() => {
    let result = workspaces;
    
    if (filter !== 'all') result = result.filter(w => w.type === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.amenities || []).some(a => a.toLowerCase().includes(q))
      );
    }
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      result = result.filter(w => w.pricePerHour >= priceRange[0] && w.pricePerHour <= priceRange[1]);
    }
    if (capacityFilter > 0) {
      result = result.filter(w => w.capacity >= capacityFilter);
    }
    if (showFavorites) {
      result = result.filter(w => favorites.includes(w._id));
    }
    
    return result;
  }, [workspaces, filter, searchQuery, priceRange, capacityFilter, showFavorites, favorites]);

  const workspaceTypes = [
    { value: 'all', label: t('common.all') },
    { value: 'desk', label: t('workspace.types.desk') },
    { value: 'meeting_room', label: t('workspace.types.meeting_room') },
    { value: 'private_office', label: t('workspace.types.private_office') },
    { value: 'hot_desk', label: t('workspace.types.hot_desk') }
  ];

  return (
    <MainLayout>
      <div className="py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {t('nav.workspaces')}
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {t('workspacesPage.subtitle')}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('workspacesPage.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
              </div>
              {/* Toggle Filters */}
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={18} />
                {t('common.filter')}
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {/* Favorites Toggle */}
              <Button
                variant={showFavorites ? 'primary' : 'secondary'}
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex items-center gap-2"
              >
                <Heart size={18} className={showFavorites ? 'fill-white' : ''} />
                {t('workspacesPage.favorites')} ({favorites.length})
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspacesPage.priceRange')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="0"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('workspacesPage.minCapacity')}</label>
                    <input
                      type="number"
                      value={capacityFilter || ''}
                      onChange={(e) => setCapacityFilter(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="1"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setPriceRange([0, 50000]); setCapacityFilter(0); }}
                    >
                      {t('workspacesPage.resetFilters')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {workspaceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    filter === type.value
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            {t('workspacesPage.showingResults', { count: filteredWorkspaces.length })}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Workspaces Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => {
                const TypeIcon = TYPE_ICONS[workspace.type] || Monitor;
                const isFav = favorites.includes(workspace._id);
                
                return (
                  <Card key={workspace._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                    {/* Image */}
                    <div className={`h-48 bg-gradient-to-br ${TYPE_GRADIENTS[workspace.type] || 'from-gray-400 to-gray-600'} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TypeIcon size={80} className="text-white opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500" />
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleFavorite(workspace._id); }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
                        >
                          <Heart size={18} className={`${isFav ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setQuickViewWorkspace(workspace); }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
                        >
                          <Eye size={18} className="text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="info">{t(`workspace.types.${workspace.type}`)}</Badge>
                      </div>
                    </div>

                    <CardBody>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{workspace.name}</h3>
                      </div>

                      <p className="text-gray-500 mb-4 line-clamp-2 text-sm">
                        {workspace.description || t('home.featured.modernWorkspace')}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Users size={16} className="mr-2 text-gray-400" />
                          <span>{t('workspace.capacity')}: {workspace.capacity} {t('workspace.people')}</span>
                        </div>
                        {workspace.floor && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{t('booking.floor')} {workspace.floor}</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {(workspace.amenities || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {workspace.amenities.slice(0, 4).map(amenity => {
                            const AmenityIcon = AMENITY_ICONS[amenity];
                            return (
                              <span key={amenity} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {AmenityIcon && <AmenityIcon size={12} />}
                                {t(`amenity.${amenity}`, { defaultValue: amenity })}
                              </span>
                            );
                          })}
                          {workspace.amenities.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                              +{workspace.amenities.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </CardBody>

                    <CardFooter className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <div>
                        <span className="text-2xl font-bold text-primary-600">₸{workspace.pricePerHour}</span>
                        <span className="text-gray-500 text-sm ml-1">/ {t('workspace.perHour')}</span>
                      </div>
                      <Link to={`/booking?workspace=${workspace._id}`}>
                        <Button>{t('workspace.bookNow')}</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredWorkspaces.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.noResults')}</h3>
              <p className="text-gray-500 mb-4">{t('workspacesPage.noWorkspacesFound')}</p>
              <Button variant="outline" onClick={() => { setFilter('all'); setSearchQuery(''); setShowFavorites(false); setPriceRange([0, 50000]); setCapacityFilter(0); }}>
                {t('workspacesPage.resetFilters')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={!!quickViewWorkspace}
        onClose={() => setQuickViewWorkspace(null)}
        title={quickViewWorkspace?.name}
        size="lg"
      >
        {quickViewWorkspace && (
          <div className="space-y-4">
            <div className={`h-48 bg-gradient-to-br ${TYPE_GRADIENTS[quickViewWorkspace.type]} rounded-xl flex items-center justify-center`}>
              {(() => { const Icon = TYPE_ICONS[quickViewWorkspace.type] || Monitor; return <Icon size={60} className="text-white opacity-30" />; })()}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">{t('dashboard.type')}</p>
                <p className="font-semibold">{t(`workspace.types.${quickViewWorkspace.type}`)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">{t('booking.pricePerHour')}</p>
                <p className="font-semibold text-primary-600">₸{quickViewWorkspace.pricePerHour}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">{t('workspace.capacity')}</p>
                <p className="font-semibold">{quickViewWorkspace.capacity} {t('workspace.people')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">{t('booking.floor')}</p>
                <p className="font-semibold">{quickViewWorkspace.floor || 1}</p>
              </div>
            </div>
            {quickViewWorkspace.description && (
              <p className="text-gray-600">{quickViewWorkspace.description}</p>
            )}
            {(quickViewWorkspace.amenities || []).length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('workspaceForm.amenities')}</p>
                <div className="flex flex-wrap gap-2">
                  {quickViewWorkspace.amenities.map(a => (
                    <span key={a} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">{t(`amenity.${a}`, { defaultValue: a })}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link to={`/booking?workspace=${quickViewWorkspace._id}`} className="flex-1">
                <Button className="w-full">{t('workspace.bookNow')}</Button>
              </Link>
              <Button variant="secondary" onClick={() => setQuickViewWorkspace(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};
