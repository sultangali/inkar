import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MapPin, Monitor, Coffee, DoorOpen, Briefcase, Wifi, Zap } from 'lucide-react';

const WORKSPACE_ICONS = {
  desk: Monitor,
  meeting_room: Users,
  private_office: DoorOpen,
  hot_desk: Coffee
};

const WORKSPACE_COLORS = {
  desk: { available: '#3b82f6', booked: '#ef4444', selected: '#8b5cf6', inactive: '#9ca3af' },
  meeting_room: { available: '#8b5cf6', booked: '#ef4444', selected: '#3b82f6', inactive: '#9ca3af' },
  private_office: { available: '#10b981', booked: '#ef4444', selected: '#3b82f6', inactive: '#9ca3af' },
  hot_desk: { available: '#f59e0b', booked: '#ef4444', selected: '#3b82f6', inactive: '#9ca3af' }
};

// Generate floor plan layout positions based on workspace type
const generateLayout = (workspaces, floor) => {
  const floorWorkspaces = workspaces.filter(w => (w.floor || 1) === floor);
  
  const desks = floorWorkspaces.filter(w => w.type === 'desk');
  const meetingRooms = floorWorkspaces.filter(w => w.type === 'meeting_room');
  const privateOffices = floorWorkspaces.filter(w => w.type === 'private_office');
  const hotDesks = floorWorkspaces.filter(w => w.type === 'hot_desk');

  const positions = [];

  // Desks area (top-left grid, 4 columns)
  desks.forEach((ws, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    positions.push({
      workspace: ws,
      x: 60 + col * 120,
      y: 120 + row * 90,
      width: 100,
      height: 65,
      shape: 'rect'
    });
  });

  // Meeting rooms (right side, larger, 2 columns)
  meetingRooms.forEach((ws, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    positions.push({
      workspace: ws,
      x: 580 + col * 180,
      y: 120 + row * 140,
      width: 160,
      height: 110,
      shape: 'rect'
    });
  });

  // Private offices (bottom-left, 3 columns)
  privateOffices.forEach((ws, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    positions.push({
      workspace: ws,
      x: 60 + col * 160,
      y: 420 + row * 110,
      width: 140,
      height: 90,
      shape: 'rect'
    });
  });

  // Hot desks (bottom-right, circles in grid)
  hotDesks.forEach((ws, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    positions.push({
      workspace: ws,
      x: 580 + col * 75,
      y: 450 + row * 75,
      width: 55,
      height: 55,
      shape: 'circle'
    });
  });

  return positions;
};

const WorkspaceTooltip = ({ workspace, position }) => {
  const { t } = useTranslation();
  const Icon = WORKSPACE_ICONS[workspace.type] || Monitor;

  return (
    <div
      className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 pointer-events-none animate-scale-in"
      style={{
        left: `${Math.min(position.x + position.width + 10, 700)}px`,
        top: `${position.y}px`,
        transform: position.x > 600 ? 'translateX(-280px)' : 'none'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-primary-600" />
        </div>
        <h4 className="font-bold text-gray-900">{workspace.name}</h4>
      </div>
      <p className="text-xs text-gray-500 mb-3">{t(`workspace.types.${workspace.type}`)}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('booking.pricePerHour')}:</span>
          <span className="font-bold text-primary-600">₸{workspace.pricePerHour}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('booking.capacity')}:</span>
          <span className="font-semibold">{workspace.capacity} {t('booking.people')}</span>
        </div>
        {workspace.amenities?.length > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">{t('workspaceForm.amenities')}:</p>
            <div className="flex flex-wrap gap-1">
              {workspace.amenities.slice(0, 4).map(a => (
                <span key={a} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">{t(`amenity.${a}`, { defaultValue: a })}</span>
              ))}
              {workspace.amenities.length > 4 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-xs">+{workspace.amenities.length - 4}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile card view
const MobileWorkspaceCard = ({ workspace, isSelected, isBooked, onSelect }) => {
  const { t } = useTranslation();
  const Icon = WORKSPACE_ICONS[workspace.type] || Monitor;
  const isDisabled = !workspace.isActive || isBooked;
  const colors = WORKSPACE_COLORS[workspace.type];

  return (
    <button
      onClick={() => !isDisabled && onSelect(workspace._id)}
      disabled={isDisabled}
      className={`relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
          : isBooked
          ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
          : !workspace.isActive
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: isSelected ? colors.selected + '20' : isBooked ? colors.booked + '20' : colors.available + '20'
          }}
        >
          <Icon
            size={20}
            style={{
              color: isSelected ? colors.selected : isBooked ? colors.booked : !workspace.isActive ? colors.inactive : colors.available
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">{workspace.name}</h4>
          <p className="text-xs text-gray-500">{t(`workspace.types.${workspace.type}`)}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={12} /> {workspace.capacity}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {t('booking.floor')} {workspace.floor || 1}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary-600">₸{workspace.pricePerHour}</p>
          <p className="text-xs text-gray-400">/{t('workspace.perHour')}</p>
        </div>
      </div>
      {isBooked && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
          {t('floorPlan.booked')}
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full font-medium">
          {t('floorPlan.selected')}
        </div>
      )}
    </button>
  );
};

export const FloorPlanSelector = ({ workspaces, selectedId, onSelect, bookedIds = [] }) => {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState(null);
  const [activeFloor, setActiveFloor] = useState(1);

  const floors = useMemo(() => {
    const floorSet = new Set(workspaces.map(w => w.floor || 1));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [workspaces]);

  const layout = useMemo(
    () => generateLayout(workspaces, activeFloor),
    [workspaces, activeFloor]
  );

  const hoveredPosition = layout.find(p => p.workspace._id === hoveredId);

  // Calculate SVG viewBox based on layout
  const maxX = Math.max(...layout.map(p => p.x + p.width), 900) + 40;
  const maxY = Math.max(...layout.map(p => p.y + p.height), 600) + 40;

  const zones = [
    { label: t('workspace.types.desk'), x: 60, y: 80, width: 480, height: 300, icon: Monitor, color: 'rgba(59, 130, 246, 0.05)' },
    { label: t('workspace.types.meeting_room'), x: 580, y: 80, width: 360, height: 300, icon: Users, color: 'rgba(139, 92, 246, 0.05)' },
    { label: t('workspace.types.private_office'), x: 60, y: 390, width: 480, height: 180, icon: DoorOpen, color: 'rgba(16, 185, 129, 0.05)' },
    { label: t('workspace.types.hot_desk'), x: 580, y: 420, width: 240, height: 150, icon: Coffee, color: 'rgba(245, 158, 11, 0.05)' }
  ];

  return (
    <div>
      {/* Floor Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {floors.map(floor => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeFloor === floor
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t('booking.floor')} {floor}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-gray-700 font-medium">{t('floorPlan.available')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-700 font-medium">{t('floorPlan.booked')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-violet-500"></div>
          <span className="text-gray-700 font-medium">{t('floorPlan.selected')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span className="text-gray-700 font-medium">{t('floorPlan.inactive')}</span>
        </div>
      </div>

      {/* SVG Floor Plan - Desktop */}
      <div className="hidden md:block relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${maxX} ${maxY}`} className="w-full" style={{ minHeight: '500px' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zone Backgrounds */}
          {zones.map((zone, i) => (
            <g key={i}>
              <rect
                x={zone.x - 10}
                y={zone.y - 10}
                width={zone.width + 20}
                height={zone.height + 20}
                fill={zone.color}
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeDasharray="5,5"
                rx="12"
              />
            </g>
          ))}

          {/* Zone Labels with Icons */}
          {zones.map((zone, i) => {
            const ZoneIcon = zone.icon;
            return (
              <g key={`label-${i}`}>
                <rect
                  x={zone.x}
                  y={zone.y - 45}
                  width={zone.width}
                  height="30"
                  fill="white"
                  opacity="0.9"
                  rx="8"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y - 23}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-600 font-bold"
                  fontSize="13"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* Workspace Items */}
          {layout.map(({ workspace: ws, x, y, width, height, shape }) => {
            const isSelected = selectedId === ws._id;
            const isBooked = bookedIds.includes(ws._id);
            const isHovered = hoveredId === ws._id;
            const isDisabled = !ws.isActive;
            const colors = WORKSPACE_COLORS[ws.type];

            let fillColor = colors.available;
            if (isSelected) fillColor = colors.selected;
            else if (isBooked) fillColor = colors.booked;
            else if (isDisabled) fillColor = colors.inactive;

            const opacity = isHovered ? 0.95 : 0.85;
            const Icon = WORKSPACE_ICONS[ws.type] || Monitor;

            return (
              <g
                key={ws._id}
                onClick={() => !isDisabled && !isBooked && onSelect(ws._id)}
                onMouseEnter={() => setHoveredId(ws._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`${!isDisabled && !isBooked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{ transition: 'all 0.2s ease' }}
              >
                {shape === 'circle' ? (
                  <>
                    <circle
                      cx={x + width / 2}
                      cy={y + height / 2}
                      r={width / 2}
                      fill={fillColor}
                      opacity={opacity}
                      stroke={isSelected ? '#6366f1' : isHovered ? '#374151' : 'white'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                      filter={isHovered || isSelected ? 'url(#shadow)' : ''}
                    />
                    {/* Icon in center */}
                    <circle
                      cx={x + width / 2}
                      cy={y + height / 2 - 8}
                      r="10"
                      fill="white"
                      opacity="0.3"
                    />
                  </>
                ) : (
                  <>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fillColor}
                      opacity={opacity}
                      stroke={isSelected ? '#6366f1' : isHovered ? '#374151' : 'white'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                      rx="10"
                      filter={isHovered || isSelected ? 'url(#shadow)' : ''}
                    />
                    {/* Icon badge */}
                    <circle
                      cx={x + 20}
                      cy={y + 20}
                      r="12"
                      fill="white"
                      opacity="0.4"
                    />
                  </>
                )}
                
                {/* Workspace name */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 - (shape === 'circle' ? 0 : 6)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={shape === 'circle' ? '10' : '12'}
                  fontWeight="700"
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                >
                  {ws.name.length > (shape === 'circle' ? 8 : 14) ? ws.name.substring(0, shape === 'circle' ? 8 : 14) + '...' : ws.name}
                </text>
                
                {/* Price label for rects */}
                {shape !== 'circle' && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    opacity="0.9"
                    className="pointer-events-none select-none"
                  >
                    ₸{ws.pricePerHour}/h
                  </text>
                )}

                {/* Capacity badge */}
                {ws.capacity > 1 && (
                  <g>
                    <circle
                      cx={x + width - 15}
                      cy={y + 15}
                      r="10"
                      fill="rgba(255,255,255,0.3)"
                    />
                    <text
                      x={x + width - 15}
                      y={y + 15}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="700"
                    >
                      {ws.capacity}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Floor label */}
          <text
            x="30"
            y="40"
            className="fill-gray-400 font-bold"
            fontSize="20"
          >
            {t('booking.floor')} {activeFloor}
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredId && hoveredPosition && (
          <WorkspaceTooltip workspace={hoveredPosition.workspace} position={hoveredPosition} />
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        <p className="text-sm text-gray-500 mb-3">{t('floorPlan.tapToSelect')}</p>
        {workspaces
          .filter(w => (w.floor || 1) === activeFloor)
          .map(ws => (
            <MobileWorkspaceCard
              key={ws._id}
              workspace={ws}
              isSelected={selectedId === ws._id}
              isBooked={bookedIds.includes(ws._id)}
              onSelect={onSelect}
            />
          ))}
      </div>
    </div>
  );
};
