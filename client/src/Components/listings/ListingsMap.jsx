import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Gold marker
function createGoldIcon(available = true) {
  const color = available ? '#8A6924' : '#dc2626';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:28px;height:36px;position:relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.27 21.73 0 14 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
          <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

export default function ListingsMap({ listings, activeId, onMarkerClick }) {
  const center = [24.7136, 46.6753]; // Riyadh default

  const validListings = listings.filter(
    (l) => l.latitude && l.longitude && !isNaN(l.latitude) && !isNaN(l.longitude)
  );

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validListings.map((listing) => {
        const isAvailable = listing.status === 'متاح' || listing.status === 'available' || !listing.status;
        const isActive = listing._id === activeId;
        return (
          <Marker
            key={listing._id}
            position={[Number(listing.latitude), Number(listing.longitude)]}
            icon={createGoldIcon(isAvailable)}
            eventHandlers={{
              click: () => onMarkerClick?.(listing._id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] font-sans" dir="rtl">
                {listing.imageUrls?.[0] && (
                  <img
                    src={listing.imageUrls[0]}
                    alt={listing.name}
                    className="w-full h-24 object-cover mb-2 rounded-sm"
                  />
                )}
                <div
                  className="text-[10px] font-black px-2 py-0.5 inline-block mb-1"
                  style={{
                    background: isAvailable ? '#8A6924' : '#dc2626',
                    color: 'white',
                  }}
                >
                  {isAvailable ? 'متاح' : 'مباع'}
                </div>
                <div className="font-bold text-sm text-[#12283C] mb-0.5">{listing.name}</div>
                {listing.price && (
                  <div className="text-[#8A6924] font-black text-sm">
                    {Number(listing.price).toLocaleString('ar-SA')} ريال
                  </div>
                )}
                {listing.address && (
                  <div className="text-[#6b5e3e] text-xs mt-0.5">{listing.address}</div>
                )}
                <Link
                  to={`/listings/${listing.slug || listing._id}`}
                  className="block mt-2 text-center text-xs font-bold py-1 bg-[#12283C] text-[#DFBA6B] hover:bg-[#8A6924] hover:text-white transition-colors"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
