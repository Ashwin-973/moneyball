"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinOut } from "@/types/deal";

interface NearbyMapProps {
  pins: MapPinOut[];
  userLat: number;
  userLng: number;
  radius_km: number;
  onPinClick: (storeId: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  bakery: "🍞",
  grocery: "🛒",
  fmcg: "🧴",
};

function createUserIcon() {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="
      width: 16px; height: 16px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #3B82F6, 0 0 12px rgba(59,130,246,0.4);
      animation: userPulse 2s ease-in-out infinite;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createStoreIcon(pin: MapPinOut) {
  const emoji = CATEGORY_EMOJI[pin.category] || "🏬";
  return L.divIcon({
    className: "store-pin-marker",
    html: `
      <div style="position:relative; width:40px; height:48px;">
        <span style="position:absolute; top:-4px; left:-2px; font-size:12px;">${emoji}</span>
        <div style="
          width:36px; height:36px;
          background: #F4500B;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(244,80,11,0.3);
          margin-top: 4px;
        ">${pin.deal_count}</div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

export default function NearbyMap({
  pins,
  userLat,
  userLng,
  radius_km,
  onPinClick,
}: NearbyMapProps) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={14}
      className="w-full h-full z-0"
      style={{ minHeight: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url={tileUrl}
      />
      <RecenterMap lat={userLat} lng={userLng} />

      {/* User location */}
      <Marker position={[userLat, userLng]} icon={createUserIcon()}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Radius circle */}
      <Circle
        center={[userLat, userLng]}
        radius={radius_km * 1000}
        pathOptions={{
          color: "#F4500B",
          fillColor: "#F4500B",
          fillOpacity: 0.05,
          dashArray: "8 4",
          weight: 2,
        }}
      />

      {/* Store pins */}
      {pins.map((pin) => (
        <Marker
          key={pin.store_id}
          position={[pin.lat, pin.lng]}
          icon={createStoreIcon(pin)}
          eventHandlers={{
            click: () => onPinClick(pin.store_id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{pin.store_name}</p>
              <p className="text-gray-600">
                {pin.deal_count} deals · up to {pin.max_discount_pct}% off
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
