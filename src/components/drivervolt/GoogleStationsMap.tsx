import { useEffect, useRef } from "react";

type Status = "available" | "occupied" | "maintenance";

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: Status;
}

declare global {
  interface Window {
    google: any;
    __initDriverVoltMap?: () => void;
  }
}

const SCRIPT_ID = "google-maps-js";

const loadGoogleMaps = (): Promise<void> => {
  if (window.google?.maps) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing && (existing as any)._loadingPromise) {
    return (existing as any)._loadingPromise;
  }
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  const promise = new Promise<void>((resolve, reject) => {
    window.__initDriverVoltMap = () => resolve();
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initDriverVoltMap&channel=${channel}`;
    script.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(script);
    (script as any)._loadingPromise = promise;
  });
  return promise;
};

const statusColor: Record<Status, string> = {
  available: "#22c55e",
  occupied: "#f59e0b",
  maintenance: "#ef4444",
};

// Estilo escuro tipo "midnight" para combinar com o tema do app
const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b0f1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7895" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9aa7c7" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2235" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b0f1a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#525e7a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#243049" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050810" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a4666" }] },
];

interface Props {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation?: { lat: number; lng: number };
}

export const GoogleStationsMap = ({ pins, selectedId, onSelect, userLocation }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  // init
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const center = userLocation ?? { lat: -23.5631, lng: -46.6544 }; // Paulista, SP
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          styles: darkStyle,
          backgroundColor: "#0b0f1a",
        });
      })
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
    };
  }, []);

  // markers
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    const seen = new Set<string>();
    pins.forEach((pin) => {
      seen.add(pin.id);
      const existing = markersRef.current.get(pin.id);
      const isSelected = selectedId === pin.id;
      const color = statusColor[pin.status];
      const scale = isSelected ? 11 : 8;
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#0b0f1a",
        strokeWeight: 2,
        scale,
      };
      if (existing) {
        existing.setIcon(icon);
        existing.setPosition({ lat: pin.lat, lng: pin.lng });
      } else {
        const marker = new window.google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map: mapRef.current,
          title: pin.name,
          icon,
        });
        marker.addListener("click", () => onSelect(pin.id));
        markersRef.current.set(pin.id, marker);
      }
    });
    // remove stale
    markersRef.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });
  }, [pins, selectedId, onSelect]);

  // user marker + recenter on selection
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 6,
          },
          zIndex: 999,
        });
      } else {
        userMarkerRef.current.setPosition(userLocation);
      }
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const pin = pins.find((p) => p.id === selectedId);
    if (pin) mapRef.current.panTo({ lat: pin.lat, lng: pin.lng });
  }, [selectedId, pins]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Mapa de estações" />;
};