/**
 * components/RouteLayer.jsx
 * Renders the ORS route as a GeoJSON layer on the Leaflet map.
 *
 * - Draws blue route line (weight 5, opacity 0.8)
 * - Removes previous route before drawing a new one
 * - Auto-fits map bounds to show the full route with padding
 * - Uses L.geoJSON directly (not polyline decoding)
 */

import { useEffect, useRef } from 'react';

const ROUTE_STYLE = {
  color: '#1565C0',
  weight: 5,
  opacity: 0.8,
};

const BOUNDS_PADDING = [40, 40];

export default function RouteLayer({ map, geometry }) {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !geometry) return;

    const L = window.L;
    if (!L) return;

    // Remove previous route layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // Draw new route using L.geoJSON (ORS already returns GeoJSON geometry)
    const routeFeature = { type: 'Feature', geometry };
    const layer = L.geoJSON(routeFeature, {
      style: () => ROUTE_STYLE,
    }).addTo(map);

    layerRef.current = layer;

    // Fit map bounds to show the full route
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: BOUNDS_PADDING, maxZoom: 16 });
    }

    // Cleanup on unmount or when geometry changes
    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, geometry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerRef.current && map?.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null; // Pure layer effect — no DOM output
}
