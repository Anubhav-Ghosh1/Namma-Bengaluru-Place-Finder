"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { IPlace } from "@/types";
import { BANGALORE_CENTER, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import type { PlaceCategory } from "@/types";

interface MapProps {
  places: IPlace[];
  selectedPlace: IPlace | null;
  onSelectPlace: (place: IPlace) => void;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  addMode: boolean;
}

export default function MapView({
  places,
  selectedPlace,
  onSelectPlace,
  onMapClick,
  addMode,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(BANGALORE_CENTER, 12);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Handle map clicks
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (addMode && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });

        // Show pin marker
        if (clickMarkerRef.current) clickMarkerRef.current.remove();
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 0 4px rgba(239,68,68,0.3);border:3px solid #fff;">📌</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        clickMarkerRef.current = L.marker(e.latlng, { icon }).addTo(map);
      }
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }
    };
  }, [addMode, onMapClick]);

  // Render place markers
  const renderMarkers = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((p) => {
      const isSelected = selectedPlace?._id === p._id;
      const color = CATEGORY_COLORS[p.category as PlaceCategory] || CATEGORY_COLORS.other;
      const emoji = CATEGORY_ICONS[p.category as PlaceCategory] || "📍";
      const size = isSelected ? 42 : 32;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:${isSelected ? 22 : 16}px;
          box-shadow:0 3px 12px rgba(0,0,0,0.4);
          border:3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.5)"};
          transition:all 0.2s;cursor:pointer;
          ${isSelected ? "animation:pulse-marker 2s infinite;" : ""}
        ">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      marker.on("click", () => onSelectPlace(p));
      markersRef.current.push(marker);
    });
  }, [places, selectedPlace, onSelectPlace]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Fly to selected
  useEffect(() => {
    if (selectedPlace && mapInstance.current) {
      mapInstance.current.flyTo([selectedPlace.lat, selectedPlace.lng], 15, {
        duration: 0.8,
      });
    }
  }, [selectedPlace]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-none md:rounded-xl"
      style={{ minHeight: "400px" }}
    />
  );
}
