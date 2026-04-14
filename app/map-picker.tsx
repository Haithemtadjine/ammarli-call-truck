import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, UrlTile } from '../components/MapComponent';
import { useAppStore } from '../src/store/useAppStore';

const COLORS = {
    navy: '#003366',
    yellow: '#F3CD0D',
    white: '#FFFFFF',
    textGray: '#6B7280',
    borderGray: '#E5E7EB',
    iconGray: '#9CA3AF',
    lightGray: '#F9FAFB',
};

export default function MapPickerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    // Which screen to return to after confirming a location (defaults to tank-details for backward compat)
    const returnTo = (params.returnTo as string) || '/tank-details';

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [region, setRegion] = useState<any>(null); // Null until GPS loads
    const [loading, setLoading] = useState(true); // Default to loading
    const [isDragging, setIsDragging] = useState(false);

    const { updateDraftOrder } = useAppStore();

    // Geocoding States
    const [addressText, setAddressText] = useState(t('Locating...'));
    const [searchText, setSearchText] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    // Search Overlay State
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const searchTimeout = useRef<number | null>(null);



    useEffect(() => {
      let isMounted = true;
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('يجب تفعيل الـ GPS لتحديد موقعك بدقة');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        
        const exactUserLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005, // Zoomed in completely to street level
          longitudeDelta: 0.005,
        };

        if (isMounted) {
          // Fly the camera to the exact GPS location
          mapRef.current?.animateToRegion(exactUserLocation, 1000);
          setRegion(exactUserLocation);
          fetchAddress(exactUserLocation.latitude, exactUserLocation.longitude);
          setLoading(false);
        }
      })();
      return () => { isMounted = false; };
    }, []);

    const handleRecenter = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let currentLocation;
            try {
                currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            } catch (err) {
                console.warn('GPS recenter failed, using fallback');
                currentLocation = {
                    coords: { latitude: 36.7538, longitude: 3.0588 }
                };
            }

            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };

            mapRef.current?.animateToRegion(newRegion, 600);
            setRegion(newRegion);
            setLocation(currentLocation as any);
            fetchAddress(newRegion.latitude, newRegion.longitude);
        } catch (error) {
            console.warn('Recenter error:', error);
        }
    };

    const fetchAddress = async (lat: number, lng: number) => {
        setIsFetchingAddress(true);
        try {
            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (result.length > 0) {
                const place = result[0];
                // Construct a readable address snippet
                const streetInfo = place.street || place.name || '';
                const formatAddress = [streetInfo, place.district, place.city]
                    .filter(Boolean)
                    .join(', ');

                const finalAddress = formatAddress || t('Unmapped Location');
                setAddressText(finalAddress);
                updateDraftOrder({
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address: finalAddress,
                    }
                });
            } else {
                setAddressText(t('Unknown Location'));
                updateDraftOrder({
                    location: {
                        latitude: lat,
                        longitude: lng,
                        address: t('Unknown Location'),
                    }
                });
            }
        } catch (error) {
            console.warn(error);
            setAddressText(t('Failed to fetch address'));
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const onSearchChange = (text: string) => {
        setSearchText(text);

        if (searchTimeout.current) {
            window.clearTimeout(searchTimeout.current);
        }

        if (!text.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeout.current = window.setTimeout(() => {
            fetchSuggestions(text);
        }, 500);
    };

    const fetchSuggestions = async (query: string) => {
        setIsFetchingAddress(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=dz`;
            const response = await fetch(url);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.warn('Error fetching suggestions:', error);
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const handleSelectResult = (latStr: string, lonStr: string) => {
        Keyboard.dismiss();
        setIsSearchActive(false);
        setSearchText(''); // Optional: clear search after selection

        const lat = parseFloat(latStr);
        const lng = parseFloat(lonStr);

        if (isNaN(lat) || isNaN(lng)) return;

        const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
        setRegion(newRegion);
        // Call reverse geocode to get formal formatted address string for bottom card
        fetchAddress(lat, lng);
    };

    const handleConfirm = () => {
        if (region && addressText) {
            updateDraftOrder({
                location: {
                    latitude: region.latitude,
                    longitude: region.longitude,
                    address: addressText,
                }
            });
            router.back();
        } else {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Top Search Bar with Inline Dropdown */}
            <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top, 20) }]}>
                <View style={styles.searchBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('Search neighborhood or street...')}
                        placeholderTextColor={COLORS.textGray}
                        value={searchText}
                        onChangeText={onSearchChange}
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                    />
                    {searchText.length > 0 ? (
                        <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults([]); setIsSearchActive(false); }} style={styles.searchIcon}>
                            <Ionicons name="close-circle" size={20} color={COLORS.iconGray} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.searchIcon}>
                            <Ionicons name="search" size={24} color={COLORS.navy} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Inline Dropdown */}
                {isSearchActive && (searchResults.length > 0 || isFetchingAddress) && (
                    <View style={[styles.searchResultsContainer, { marginTop: 10 }]}>
                        {isFetchingAddress && searchResults.length === 0 ? (
                            <View style={[styles.searchResultItem, { justifyContent: 'center', paddingVertical: 20 }]}>
                                <ActivityIndicator size="small" color={COLORS.navy} />
                            </View>
                        ) : (
                            searchResults.map((result, index) => (
                                <React.Fragment key={index}>
                                    <TouchableOpacity
                                        style={styles.searchResultItem}
                                        onPress={() => handleSelectResult(result.lat, result.lon)}
                                    >
                                        <View style={styles.resultIconBgPin}>
                                            <Ionicons name="location" size={20} color={COLORS.textGray} />
                                        </View>
                                        <View style={styles.resultTextContainer}>
                                            <Text style={styles.resultTextNormal} numberOfLines={2}>
                                                {result.display_name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    {index < searchResults.length - 1 && <View style={styles.resultDivider} />}
                                </React.Fragment>
                            ))
                        )}
                    </View>
                )}
            </View>

            <View style={styles.mapContainer}>
                {region ? (
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFillObject}
                        mapType="none"
                        initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    onRegionChange={() => setIsDragging(true)}
                    onRegionChangeComplete={(newRegion: any) => {
                        setIsDragging(false);
                        setRegion(newRegion);
                        fetchAddress(newRegion.latitude, newRegion.longitude);
                    }}
                >
                    <UrlTile
                        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                        flipY={false}
                    />
                </MapView>
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color={COLORS.yellow} />
                        <Text style={{ marginTop: 10, color: COLORS.navy }}>{t('Locating GPS...')}</Text>
                    </View>
                )}
                
                {region && (
                    <View style={styles.centerPinContainer} pointerEvents="none">
                        <View style={[styles.centerPin, isDragging && styles.centerPinDragging]}>
                            <Ionicons name="location" size={40} color={COLORS.navy} style={styles.pinIcon} />
                            {/* The yellow dot inside */}
                            <View style={styles.pinDot} />
                        </View>
                        {!isDragging && <View style={styles.pinShadow} />}
                    </View>
                )}

                {/* GPS FAB */}
                <TouchableOpacity style={styles.gpsFab} onPress={handleRecenter}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.navy} />
                </TouchableOpacity>

                {/* Loading state indicator over the map */}
                {loading && (
                    <View style={styles.innerLoadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.yellow} />
                    </View>
                )}
            </View>

            {/* Bottom Card */}
            <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.handleBar} />

                <View style={styles.addressRow}>
                    <View style={styles.addressIconBg}>
                        {isFetchingAddress ? (
                            <ActivityIndicator size="small" color={COLORS.navy} />
                        ) : (
                            <Ionicons name="location-outline" size={20} color={COLORS.textGray} />
                        )}
                    </View>
                    <View style={styles.addressTextContainer}>
                        <Text style={styles.addressTitle} numberOfLines={1}>
                            {isFetchingAddress ? t('Fetching address...') : addressText}
                        </Text>
                        <Text style={styles.addressSubtitle}>{t('Drag map to adjust pin position')}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>{t('Confirm Location')}</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
    },
    innerLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 20,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    backButton: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.navy,
    },
    searchIcon: {
        marginLeft: 10,
    },
    centerPinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20, // half of pin width
        marginTop: -40, // height of pin
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    centerPin: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerPinDragging: {
        transform: [{ translateY: -10 }],
    },
    pinIcon: {
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 2,
    },
    pinDot: {
        position: 'absolute',
        top: 10,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.yellow,
    },
    pinShadow: {
        width: 14,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginTop: 2,
    },
    gpsFab: {
        position: 'absolute',
        right: 20,
        bottom: 20, // above the bottom of map container
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        zIndex: 10,
    },
    bottomCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
        zIndex: 20,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.borderGray,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: COLORS.lightGray,
        padding: 15,
        borderRadius: 12,
    },
    addressIconBg: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.navy,
        marginBottom: 4,
    },
    addressSubtitle: {
        fontSize: 13,
        color: COLORS.textGray,
    },
    confirmButton: {
        backgroundColor: COLORS.yellow,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.navy,
    },
    // Search Overlay Styles
    searchOverlayContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchOverlayHeaderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 10,
    },
    searchOverlayBackBtn: {
        marginRight: 10,
    },
    searchOverlayInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.navy,
        fontWeight: 'bold',
    },
    searchOverlayClearBtn: {
        paddingLeft: 10,
    },
    searchResultsContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    resultIconBgPin: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    resultTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    resultTextNormal: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    highlightText: {
        color: COLORS.navy,
        fontWeight: 'bold',
    },
    resultDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 66,
    },
});
