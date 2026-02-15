import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X, Plus } from 'lucide-react';

const WORKSPACE_TYPES = ['desk', 'meeting_room', 'private_office', 'hot_desk'];

const AMENITY_SUGGESTIONS = [
  'WiFi', 'Monitor', 'Keyboard', 'Mouse', 'Webcam', 'Headset',
  'Whiteboard', 'Projector', 'Coffee', 'Printer', 'Scanner',
  'Air Conditioning', 'Standing Desk', 'Locker', 'Phone Booth'
];

const emptyForm = {
  name: '',
  type: 'desk',
  pricePerHour: '',
  capacity: '',
  description: '',
  floor: '1',
  amenities: [],
  isActive: true
};

export const WorkspaceFormModal = ({ isOpen, onClose, onSubmit, workspace = null, loading = false }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [amenityInput, setAmenityInput] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = !!workspace;

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name || '',
        type: workspace.type || 'desk',
        pricePerHour: workspace.pricePerHour?.toString() || '',
        capacity: workspace.capacity?.toString() || '',
        description: workspace.description || '',
        floor: workspace.floor?.toString() || '1',
        amenities: workspace.amenities || [],
        isActive: workspace.isActive !== undefined ? workspace.isActive : true
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setAmenityInput('');
  }, [workspace, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addAmenity = (amenity) => {
    const trimmed = amenity.trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmed]
      }));
    }
    setAmenityInput('');
  };

  const removeAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleAmenityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAmenity(amenityInput);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = t('workspaceForm.nameRequired');
    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) newErrors.pricePerHour = t('workspaceForm.priceRequired');
    if (!form.capacity || Number(form.capacity) < 1) newErrors.capacity = t('workspaceForm.capacityRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      pricePerHour: Number(form.pricePerHour),
      capacity: Number(form.capacity),
      description: form.description.trim(),
      floor: Number(form.floor),
      amenities: form.amenities,
      isActive: form.isActive
    });
  };

  const suggestedAmenities = AMENITY_SUGGESTIONS.filter(
    a => !form.amenities.includes(a)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('workspaceForm.editTitle') : t('workspaceForm.createTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('workspaceForm.name')} <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t('workspaceForm.namePlaceholder')}
            error={errors.name}
          />
        </div>

        {/* Type & Active Toggle Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workspaceForm.type')} <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {WORKSPACE_TYPES.map(type => (
                <option key={type} value={type}>
                  {t(`workspace.types.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer pb-2">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.isActive ? t('workspace.available') : t('dashboard.inactive')}
              </span>
            </label>
          </div>
        </div>

        {/* Price, Capacity, Floor */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workspaceForm.price')} (₸) <span className="text-red-500">*</span>
            </label>
            <Input
              name="pricePerHour"
              type="number"
              min="0"
              step="100"
              value={form.pricePerHour}
              onChange={handleChange}
              placeholder="2000"
              error={errors.pricePerHour}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workspaceForm.capacity')} <span className="text-red-500">*</span>
            </label>
            <Input
              name="capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={handleChange}
              placeholder="1"
              error={errors.capacity}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workspaceForm.floor')}
            </label>
            <Input
              name="floor"
              type="number"
              min="1"
              value={form.floor}
              onChange={handleChange}
              placeholder="1"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('workspaceForm.description')}
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder={t('workspaceForm.descriptionPlaceholder')}
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('workspaceForm.amenities')}
          </label>
          {/* Current amenities */}
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {form.amenities.map(amenity => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                >
                  {t(`amenity.${amenity}`, { defaultValue: amenity })}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={handleAmenityKeyDown}
              placeholder={t('workspaceForm.amenityPlaceholder')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addAmenity(amenityInput)}
              disabled={!amenityInput.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>
          {/* Suggestions */}
          {suggestedAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestedAmenities.slice(0, 8).map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => addAmenity(amenity)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-colors"
                >
                  + {t(`amenity.${amenity}`, { defaultValue: amenity })}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
