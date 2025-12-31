import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MapPicker({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation || { lat: 31.9539, lng: 35.9106 }); // Amman, Jordan
  const { t, language } = useLanguage();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation && !initialLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [initialLocation]);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [currentLocation]);

  function initMap() {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    const marker = new window.google.maps.Marker({
      position: currentLocation,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    markerRef.current = marker;
    setMap(mapInstance);

    // Update location when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const location = {
        lat: position.lat(),
        lng: position.lng()
      };
      setCurrentLocation(location);
      onLocationSelect(location);
    });

    // Update location when map is clicked
    mapInstance.addListener('click', (e) => {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      marker.setPosition(location);
      setCurrentLocation(location);
      onLocationSelect(location);
    });

    // Initial location callback
    onLocationSelect(currentLocation);
  }

  function centerOnCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          if (map) {
            map.setCenter(location);
            if (markerRef.current) {
              markerRef.current.setPosition(location);
            }
          }
          onLocationSelect(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert(language === 'ar' ? 'لا يمكن الوصول إلى موقعك الحالي' : 'Cannot access your current location');
        }
      );
    }
  }

  return (
    <div className="space-y-4">
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
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-sm"
        style={{ minHeight: '400px' }}
      />
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
