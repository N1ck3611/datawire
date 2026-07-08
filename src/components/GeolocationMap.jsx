import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon component
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
      box-shadow: 0 0 30px ${color}40;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: pulse 2s ease-in-out infinite;
    ">
      <i class='bx ${icon}' style='color: white; font-size: 20px;'></i>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0px ${color}40; }
        50% { box-shadow: 0 0 0 20px ${color}00; }
      }
    </style>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}

// Map view updater component
const MapViewUpdater = ({ locations }) => {
  const map = useMap()
  
  useEffect(() => {
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + (loc.lat || 0), 0) / locations.length
      const avgLng = locations.reduce((sum, loc) => sum + (loc.lng || 0), 0) / locations.length
      
      map.flyTo([avgLat || 40, avgLng || -100], 3, {
        duration: 1.5
      })
    }
  }, [locations, map])
  
  return null
}

const GeolocationMap = ({ locations = [], onLocationClick }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleMarkerClick = (location) => {
    setSelectedLocation(location)
    if (onLocationClick) onLocationClick(location)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 16, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <MapContainer
        center={[40, -100]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* Dark theme tiles using CartoDB Dark Matter (free) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        <MapViewUpdater locations={locations} />

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.color || '#ff6b6b', location.icon || 'bx-map')}
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
          >
            <Popup>
              <div className="min-w-[200px]" style={{ color: '#ffffff' }}>
                <div className="flex items-center gap-2 mb-2">
                  <i className={`bx ${location.icon || 'bx-map'} text-lg`} style={{ color: location.color || '#ff6b6b' }}></i>
                  <h3 className="font-semibold text-white">{location.title || 'Location'}</h3>
                </div>
                <p className="text-sm text-gray-300 mb-1">{location.address || 'Unknown address'}</p>
                <p className="text-xs text-gray-400">
                  {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                </p>
                {location.source && (
                  <p className="text-xs text-gray-500 mt-2">Source: {location.source}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 z-[1000]"
      >
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(10, 10, 16, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-gray-300">
              <span className="text-white font-semibold">{locations.length}</span> locations tracked
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default GeolocationMap
