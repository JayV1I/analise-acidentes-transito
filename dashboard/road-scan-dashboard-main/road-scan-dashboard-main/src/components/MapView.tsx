import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { fmt } from "@/lib/format";

// markercluster augments the global L instance — make L global, then load it.
let clusterReady: Promise<void> | null = null;
function ensureMarkerCluster(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!clusterReady) {
    (window as unknown as { L: typeof L }).L = L;
    clusterReady = import("leaflet.markercluster").then(() => undefined);
  }
  return clusterReady;
}

export interface MapPoint {
  lat: number;
  lng: number;
  municipio: string;
  uf: string;
  br: number | null;
  km: string | null;
  tipo: string;
  sev: string;
  vitimas: number;
  grave: number;
}

export default function MapView({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-15.78, -52.5],
      zoom: 4,
      preferCanvas: true,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      },
    ).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    ensureMarkerCluster().then(() => {
      if (cancelled || !mapRef.current) return;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      const cluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 55,
        spiderfyOnMaxZoom: true,
      });
      points.forEach((p) => {
        const color = p.grave === 1 ? "#dc2626" : "#2563eb";
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          color,
          weight: 1,
          fillColor: color,
          fillOpacity: 0.7,
        });
        marker.bindTooltip(
          `<div style="font-size:12px;line-height:1.5">
            <b>${p.municipio} / ${p.uf}</b><br/>
            ${p.br ? "BR-" + p.br : "—"} · KM ${p.km ?? "—"}<br/>
            ${p.tipo}<br/>
            Severidade: <b>${p.sev}</b><br/>
            Vítimas: <b>${fmt(p.vitimas)}</b>
          </div>`,
          { direction: "top", sticky: true },
        );
        cluster.addLayer(marker);
      });
      map.addLayer(cluster);
      layerRef.current = cluster;
      if (points.length) {
        try {
          const bounds = cluster.getBounds();
          if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
        } catch {
          /* ignore */
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [points]);


  return (
    <div
      ref={containerRef}
      className="h-[520px] w-full overflow-hidden rounded-xl"
      style={{ background: "#0b1220" }}
    />
  );
}
