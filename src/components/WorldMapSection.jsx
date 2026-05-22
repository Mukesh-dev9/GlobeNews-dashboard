import { useState, useEffect, memo, forwardRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe2, ArrowDown } from 'lucide-react';
import L from 'leaflet';

// Fix for leaflet default icon missing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data for specific countries
const economicData = {
  "United States of America": { gdp: "$25.4T", inflation: "3.2%", currency: "USD" },
  "China": { gdp: "$17.9T", inflation: "0.1%", currency: "CNY" },
  "India": { gdp: "$3.4T", inflation: "4.7%", currency: "INR" },
  "Russia": { gdp: "$2.2T", inflation: "7.5%", currency: "RUB" },
  "Ukraine": { gdp: "$0.16T", inflation: "15%", currency: "UAH" },
  "Israel": { gdp: "$0.52T", inflation: "4.1%", currency: "ILS" },
  "United Kingdom": { gdp: "$3.1T", inflation: "6.7%", currency: "GBP" },
  "Japan": { gdp: "$4.2T", inflation: "3.3%", currency: "JPY" },
  "Germany": { gdp: "$4.0T", inflation: "4.5%", currency: "EUR" },
  "France": { gdp: "$2.7T", inflation: "4.9%", currency: "EUR" },
  "Brazil": { gdp: "$1.9T", inflation: "4.8%", currency: "BRL" },
};

const geopoliticalLines = [
  { from: [55.7558, 37.6173], to: [50.4501, 30.5234], name: "Russia-Ukraine Conflict" }, // Lat, Lng
  { from: [31.7683, 35.2137], to: [31.5017, 34.4668], name: "Israel-Gaza Conflict" },
];

const MapChart = memo(({ setTooltipContent }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Fetch low-res GeoJSON for country boundaries
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Could not load GeoJSON", err));
  }, []);

  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.name || feature.properties.ADMIN || "Unknown Country";
    const data = economicData[countryName] || { 
      gdp: `$${(Math.random() * 2 + 0.1).toFixed(2)}T`, 
      inflation: `${(Math.random() * 10).toFixed(1)}%`, 
      currency: "Local" 
    };

    layer.bindTooltip(`
      <div style="text-align: left; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; padding: 10px; font-family: sans-serif; min-width: 120px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);">
        <strong style="color: #67e8f9; font-size: 14px; display: block; margin-bottom: 4px;">${countryName}</strong>
        <div style="font-size: 12px; line-height: 1.4;">
          <span style="color: #94a3b8;">GDP:</span> <span style="color: #f8fafc; font-weight: 600;">${data.gdp}</span><br/>
          <span style="color: #94a3b8;">Inflation:</span> <span style="color: #f8fafc; font-weight: 600;">${data.inflation}</span><br/>
          <span style="color: #94a3b8;">Currency:</span> <span style="color: #f8fafc; font-weight: 600;">${data.currency}</span>
        </div>
      </div>
    `, { sticky: true, className: 'custom-leaflet-tooltip' });
    
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.3,
          fillColor: '#38bdf8',
          weight: 1,
          color: '#38bdf8'
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0,
          weight: 0.5,
          color: 'transparent'
        });
      }
    });
  };

  return (
    <div className="h-[400px] w-full relative group">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#020817' }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        {/* Highly realistic satellite map */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={8}
        />
        {/* Country boundaries and names overlay */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={8}
        />

        {geoData && (
          <GeoJSON 
            data={geoData} 
            onEachFeature={onEachFeature}
            style={() => ({
              color: 'transparent',
              weight: 0.5,
              fillOpacity: 0,
            })}
          />
        )}

        {geopoliticalLines.map((line, idx) => (
          <Polyline 
            key={idx} 
            positions={[line.from, line.to]} 
            pathOptions={{ color: '#f43f5e', weight: 2, dashArray: '5, 5' }} 
          />
        ))}

        {geopoliticalLines.map((line, idx) => (
          <Marker 
            key={`marker-${idx}`} 
            position={line.to}
            icon={L.divIcon({
              className: 'bg-transparent',
              html: `<div class="relative w-3 h-3"><div class="absolute inset-0 rounded-full bg-rose-500 animate-ping"></div><div class="absolute inset-0.5 rounded-full bg-white"></div></div>`
            })}
          >
            <Popup className="text-xs font-semibold text-slate-800">
              {line.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

MapChart.displayName = 'MapChart';

const WorldMapSection = forwardRef(({
  kpis,
  lastUpdated,
  triggerRefresh
}, ref) => {

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#020817]/90 p-5 shadow-[0_0_80px_rgba(6,182,212,0.12)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,0.15),transparent_38%),radial-gradient(circle_at_10%_90%,rgba(59,130,246,0.12),transparent_40%)]" />
      <div className="relative z-10 text-center">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-cyan-200">
          <Globe2 size={12} /> AI POWERED GLOBAL NEWS ANALYZER
        </p>
        <h1 className="text-2xl font-semibold tracking-wide text-cyan-100 md:text-4xl">
          Global Intelligence Grid
        </h1>
        <p className="mt-2 text-xs tracking-[0.14em] text-cyan-300/80 md:text-sm">
          Geopolitics • Economics • Real-Time Metrics
        </p>
        
        <div 
          className="mx-auto mt-6 w-full max-w-[800px] overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-950/70 shadow-inner"
          id="map-container-area"
        >
          <style>{`
            .custom-leaflet-tooltip {
              background: transparent;
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .custom-leaflet-tooltip::before {
              display: none;
            }
          `}</style>
          <MapChart />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <span className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span> Conflict Zones
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Latency {kpis.latency}</span>
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">Zones {kpis.zones}</span>
          
          <button
            type="button"
            onClick={triggerRefresh}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Refresh Live
          </button>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Awaiting first sync'}
        </div>
      </div>
    </section>
  );
});

WorldMapSection.displayName = 'WorldMapSection';

export default WorldMapSection;
