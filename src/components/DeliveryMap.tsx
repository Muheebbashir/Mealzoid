import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix default Leaflet marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  riderPosition: [number, number] | null;
  deliveryPosition: [number, number];
  riderLabel?: string;
}

// LRM attaches itself to L.Routing when imported
type RoutingControl = L.Control & L.Evented & { setWaypoints: (wps: L.LatLng[]) => void };
const LRouting = (L as unknown as { Routing: { control: (opts: unknown) => RoutingControl } }).Routing;

const riderIcon = L.divIcon({
  html: `<div style="background:#4F46E5;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.35)">🚴</div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const deliveryIcon = L.divIcon({
  html: `<div style="background:#E23744;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.35)">📍</div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DeliveryMap = ({ riderPosition, deliveryPosition, riderLabel = "🚴 Rider" }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<RoutingControl | null>(null);
  // Track last position used for route calc — only re-route after 30 m movement
  const lastRoutedPosRef = useRef<[number, number] | null>(null);

  /* ── initialise map once ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = riderPosition ?? deliveryPosition;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Always show delivery pin
    L.marker(deliveryPosition, { icon: deliveryIcon })
      .addTo(map)
      .bindPopup("<b>📍 Delivery Address</b>");

    return () => {
      routingControlRef.current?.remove();
      routingControlRef.current = null;
      map.remove();
      mapRef.current = null;
      riderMarkerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── update rider marker + draw/update route on every GPS tick ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !riderPosition) return;

    // Always move the rider marker smoothly on every GPS ping
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(riderPosition);
    } else {
      riderMarkerRef.current = L.marker(riderPosition, { icon: riderIcon })
        .addTo(map)
        .bindPopup(`<b>${riderLabel}</b>`);
    }

    // Only recalculate the route when rider has moved > 30 m — avoids hammering OSRM
    const lastPos = lastRoutedPosRef.current;
    const movedFar = !lastPos ||
      map.distance(L.latLng(lastPos), L.latLng(riderPosition)) > 30;

    if (movedFar) {
      lastRoutedPosRef.current = riderPosition;

      if (routingControlRef.current) {
        routingControlRef.current.setWaypoints([
          L.latLng(riderPosition),
          L.latLng(deliveryPosition),
        ]);
      } else {
        const control = LRouting.control({
          waypoints: [L.latLng(riderPosition), L.latLng(deliveryPosition)],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: "#E23744", weight: 6, opacity: 0.92 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          createMarker: () => null,
        });

        control.addTo(map);
        routingControlRef.current = control;

        control.on("routesfound", () => {
          document.querySelectorAll<HTMLElement>(".leaflet-routing-container").forEach(el => {
            el.style.cssText += ";display:none!important";
          });
        });
      }

      // Re-fit bounds to keep both points visible after a significant move
      map.fitBounds([riderPosition, deliveryPosition], { padding: [55, 55], maxZoom: 16 });
    }
  }, [riderPosition, deliveryPosition, riderLabel]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{ height: "320px", width: "100%", borderRadius: "0 0 12px 12px", overflow: "hidden", zIndex: 0 }}
      />
      {!riderPosition && (
        <div style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 20,
          padding: "5px 16px", fontSize: 12, pointerEvents: "none", zIndex: 999,
          whiteSpace: "nowrap",
        }}>
          ⏳ Waiting for rider GPS…
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
