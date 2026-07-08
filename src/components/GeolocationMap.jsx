import { useState, useEffect, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion, AnimatePresence } from 'framer-motion'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGF0YXdpcmVjYyIsImEiOiJjbHh6eG5yZzAwMjZzMmpxb3Z4aHl6b3Z4In0.abc123def456' // Get free token at https://account.mapbox.com/

const GeolocationMap = ({ locations = [], onLocationClick }) => {
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 2
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const mapRef = useRef()

  useEffect(() => {
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + (loc.lat || 0), 0) / locations.length
      const avgLng = locations.reduce((sum, loc) => sum + (loc.lng || 0), 0) / locations.length
      setViewState({
        longitude: avgLng || -100,
        latitude: avgLat || 40,
        zoom: 3
      })
    }
  }, [locations])

  const handleMarkerClick = (location) => {
    setSelectedLocation(location)
    setViewState({
      longitude: location.lng,
      latitude: location.lat,
      zoom: 8
    })
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
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        projection="globe"
        pitch={60}
        bearing={0}
      >
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(10, 10, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <FullscreenControl
          position="top-right"
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(10, 10, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <NavigationControl
          position="top-right"
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(10, 10, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <ScaleControl
          position="bottom-left"
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(10, 10, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        />

        {locations.map((location, index) => (
          <Marker
            key={index}
            longitude={location.lng}
            latitude={location.lat}
            anchor="bottom"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMarkerClick(location)}
              className="cursor-pointer"
            >
              <div
                className="relative"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${location.color || '#ff6b6b'} 0%, ${location.color || '#ff6b6b'}dd 100%)`,
                  boxShadow: `0 0 30px ${location.color || '#ff6b6b'}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <i className={`bx ${location.icon || 'bx-map'} text-white text-xl`}></i>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      `0 0 0 0px ${location.color || '#ff6b6b'}40`,
                      `0 0 0 20px ${location.color || '#ff6b6b'}00`
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
              </div>
            </motion.div>
          </Marker>
        ))}

        <AnimatePresence>
          {selectedLocation && (
            <Popup
              longitude={selectedLocation.lng}
              latitude={selectedLocation.lat}
              anchor="top"
              onClose={() => setSelectedLocation(null)}
              closeOnClick={false}
              style={{
                background: 'rgba(10, 10, 16, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                color: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <i className={`bx ${selectedLocation.icon || 'bx-map'} text-lg`} style={{ color: selectedLocation.color || '#ff6b6b' }}></i>
                  <h3 className="font-semibold text-white">{selectedLocation.title || 'Location'}</h3>
                </div>
                <p className="text-sm text-gray-300 mb-1">{selectedLocation.address || 'Unknown address'}</p>
                <p className="text-xs text-gray-400">
                  {selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)}
                </p>
                {selectedLocation.source && (
                  <p className="text-xs text-gray-500 mt-2">Source: {selectedLocation.source}</p>
                )}
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Overlay Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 left-4 z-10"
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
