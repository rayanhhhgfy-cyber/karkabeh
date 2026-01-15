import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

export default function MapPicker({ onLocationSelect, initialLocation }) {
  const [currentLocation, setCurrentLocation] = useState(initialLocation || { lat: 31.9539, lng: 35.9106 }); // Amman, Jordan
  const [isClient, setIsClient] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    setIsClient(true);
    // Get user's current location
    if (navigator.geolocation && !initialLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          onLocationSelect(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else if (initialLocation) {
      onLocationSelect(initialLocation);
    } else {
      onLocationSelect(currentLocation);
    }
  }, []);

  function centerOnCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          onLocationSelect(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(language === 'ar' ? 'لا يمكن الوصول إلى موقعك الحالي' : 'Cannot access your current location');
        }
      );
    }
  }

  function MapEvents() {
    useMapEvents({
      click(e) {
        const location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        setCurrentLocation(location);
        onLocationSelect(location);
      },
    });
    return null;
  }

  function DraggableMarker() {
    const markerRef = useRef(null);
    
    const eventHandlers = {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          const location = {
            lat: position.lat,
            lng: position.lng
          };
          setCurrentLocation(location);
          onLocationSelect(location);
        }
      },
    };

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[currentLocation.lat, currentLocation.lng]}
        ref={markerRef}
      />
    );
  }

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-sm flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container {
          height: 400px;
          border-radius: 0.5rem;
          border: 2px solid #d1d5db;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {t('selectLocation')}
        </label>
        <button
          type="button"
          onClick={centerOnCurrentLocation}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {language === 'ar' ? 'موقعي الحالي' : 'My Location'}
        </button>
      </div>
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
        key={`${currentLocation.lat}-${currentLocation.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker />
        <MapEvents />
      </MapContainer>
      <p className="text-sm text-gray-600">
        {language === 'ar' 
          ? 'اسحب العلامة أو انقر على الخريطة لتحديد موقع التوصيل'
          : 'Drag the marker or click on the map to set delivery location'
        }
      </p>
      <div className="bg-gray-50 p-3 rounded-lg text-sm">
        <p className="text-gray-600">
          {language === 'ar' ? 'الإحداثيات' : 'Coordinates'}: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}
