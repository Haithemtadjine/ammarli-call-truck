import React, { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';



// Only load leaflet on the client side
let MapContainer: any, TileLayer: any, LeafletMarker: any, LeafletPolyline: any, useMap: any;
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reactLeaflet = require('react-leaflet');
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    LeafletMarker = reactLeaflet.Marker;
    LeafletPolyline = reactLeaflet.Polyline;
    useMap = reactLeaflet.useMap;
}

// Helper to handle animation requests from parent
const MapController = ({ region, animateTo }: any) => {
    const map = useMap();
    useEffect(() => {
        if (animateTo) {
            map.flyTo([animateTo.latitude, animateTo.longitude], map.getZoom(), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [animateTo, map]);
    return null;
};

export const MapView = forwardRef((props: any, ref) => {
    const [animateRegion, setAnimateRegion] = useState<any>(null);

    React.useImperativeHandle(ref, () => ({
        animateToRegion: (region: any) => {
            setAnimateRegion(region);
        },
    }));

    if (typeof window === 'undefined') {
        return <View style={[styles.container, props.style]} />;
    }

    const initialCenter = props.initialRegion
        ? [props.initialRegion.latitude, props.initialRegion.longitude]
        : [25.2048, 55.2708];

    return (
        <View style={[styles.container, props.style]}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <MapContainer
                center={initialCenter}
                zoom={13}
                style={{ width: '100%', height: '100%', zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {props.showsUserLocation && animateRegion && (
                    <LeafletMarker position={[animateRegion.latitude, animateRegion.longitude]} />
                )}
                <MapController region={props.initialRegion} animateTo={animateRegion} />
                {props.children}
            </MapContainer>
        </View>
    );
});

MapView.displayName = 'MapView';

export const Marker = (props: any) => {
    if (typeof window === 'undefined' || !LeafletMarker) return null;
    
    const [icon, setIcon] = useState<any>(null);

    useEffect(() => {
        if (props.children) {
            // Lazy load Leaflet and ReactDOMServer for web custom markers
            const L = require('leaflet');
            const ReactDOMServer = require('react-dom/server');
            
            try {
                // Ensure icons are centered accurately on the geographic point
                const htmlString = ReactDOMServer.renderToString(
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {props.children}
                    </div>
                );
                
                const customIcon = L.divIcon({
                    html: htmlString,
                    className: 'custom-rn-leaflet-marker',
                    iconSize: [0, 0], // CSS dictates exact dimensions
                    iconAnchor: [0, 0], // Center it relative to container
                });
                
                setIcon(customIcon);
            } catch (e) {
                console.warn("Failed to render Marker children to divIcon:", e);
            }
        }
    }, [props.children]);

    // Apply icon only if successfully minted from children, else fallback to standard marker
    return (
        <LeafletMarker 
            position={[props.coordinate.latitude, props.coordinate.longitude]}
            {...(icon ? { icon } : {})}
        />
    );
};

export const Polyline = (props: any) => {
    if (typeof window === 'undefined' || !LeafletPolyline) return null;
    const positions = props.coordinates.map((c: any) => [c.latitude, c.longitude]);
    return (
        <LeafletPolyline
            positions={positions}
            pathOptions={{
                color: props.strokeColor || '#000',
                weight: props.strokeWidth || 3,
                dashArray: props.lineDashPattern ? props.lineDashPattern.join(',') : undefined
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e5e5e5',
        zIndex: 0,
    },
});

// UrlTile is not needed on web — Leaflet's TileLayer is already baked into MapView above
export const UrlTile = () => null;

export default MapView;
