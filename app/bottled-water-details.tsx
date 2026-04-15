import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../src/store/useAppStore';

const { width } = Dimensions.get('window');

// Ammarli Premium Palette
const COLORS = {
  primary: '#002D58', // كحلي غامق جداً
  secondary: '#FFD700', // أصفر ذهبي
  white: '#FFFFFF',
  background: '#F1F5F9',
  textMain: '#002D58',
  textGray: '#64748B',
  priceColor: '#003366',
};

const PRICES = {
  small: 220,
  medium: 180,
  large: 120,
};

export default function BottledWaterDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { activeOrder, updateOrder, draftOrder, updateDraftOrder } = useAppStore();

  const [selectedBrand, setSelectedBrand] = useState('Ifri');
  const [cart, setCart] = useState<Record<string, { small: number, medium: number, large: number }>>(
      draftOrder.bottledWaterCart || {}
  );
  
  const [finalAddress, setFinalAddress] = useState<string>(
      draftOrder.location?.address || (params.address as string) || ''
  );

  useEffect(() => {
      if (params.lockedAddress) {
          setFinalAddress(params.lockedAddress as string);
      }
      if (params.lockedLat && params.lockedLng) {
          updateDraftOrder({
              location: {
                  latitude: Number(params.lockedLat),
                  longitude: Number(params.lockedLng),
                  address: params.lockedAddress as string,
              }
          });
      }
  }, [params.lockedAddress, params.lockedLat, params.lockedLng]);

  useEffect(() => {
      updateDraftOrder({ bottledWaterCart: cart });
  }, [cart]);

  const brands = [
    { id: 'Ifri', name: 'Ifri', logo: 'IF' },
    { id: 'Guedila', name: 'Guedila', logo: 'GU' },
    { id: 'Saida', name: 'Saida', logo: 'SA' },
  ];

  const updateQty = (size: 'small' | 'medium' | 'large', delta: number) => {
    setCart(prev => {
        const currentBrandCart = prev[selectedBrand] || { small: 0, medium: 0, large: 0 };
        return {
            ...prev,
            [selectedBrand]: {
                ...currentBrandCart,
                [size]: Math.max(0, currentBrandCart[size] + delta)
            }
        };
    });
  };

  const totalPrice = Object.values(cart).reduce((acc, counts) => {
      return acc + 
          (counts.small * PRICES.small) + 
          (counts.medium * PRICES.medium) + 
          (counts.large * PRICES.large);
  }, 0);

  const currentBrandCart = cart[selectedBrand] || { small: 0, medium: 0, large: 0 };

  const handleOrderNow = () => {
      const currentLat = params.lockedLat || draftOrder.location?.latitude;
      const currentLng = params.lockedLng || draftOrder.location?.longitude;

      if (!currentLat || !currentLng) {
          Alert.alert(t('Location Required'), t('Please select your location first'));
          return;
      }

      if (totalPrice === 0) {
          Alert.alert(t('Cart Empty'), t('Please add items to your cart first'));
          return;
      }

      const orderParts: string[] = [];
      Object.entries(cart).forEach(([brand, counts]) => {
          const brandParts: string[] = [];
          if (counts.small > 0) brandParts.push(`${counts.small}x 0.5L`);
          if (counts.medium > 0) brandParts.push(`${counts.medium}x 1.5L`);
          if (counts.large > 0) brandParts.push(`${counts.large}x 5L`);
          if (brandParts.length > 0) {
              orderParts.push(`${brand}: ${brandParts.join(', ')}`);
          }
      });
      
      const quantitySummary = orderParts.join(' | ');
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      updateOrder({
          ...(activeOrder as any),
          id: Date.now(),
          type: 'Bottled Water',
          waterType: 'Bottled Water',
          status: 'searching',
          quantity: quantitySummary,
          price: totalPrice,
          locationName: finalAddress || 'Unknown Location',
          orderTime: currentTime,
          location: {
              latitude: Number(currentLat),
              longitude: Number(currentLng),
          },
          bottledWaterCart: cart,
          orderSummary: quantitySummary,
      } as any);

      router.push({
          pathname: '/searching-driver',
          params: {
              waterType: 'Bottled Water',
              qty: quantitySummary,
              price: totalPrice,
              address: finalAddress,
          } as any,
      });
  };

  const handleSchedule = () => {
      const currentLat = params.lockedLat || draftOrder.location?.latitude;
      if (totalPrice === 0 || !currentLat) {
          Alert.alert(t('Alert'), t('Please select quantity and location first'));
          return;
      }
      router.push('/schedule-delivery');
  };

  const mapPress = () => {
      router.push({
          pathname: '/map-picker',
          params: { returnTo: '/bottled-water-details' },
      } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 15 : 0) }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ORDER BOTTLED WATER')}</Text>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100' }} 
            style={styles.avatar} 
          />
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 }]}>
          
          {/* Map Section */}
          <TouchableOpacity style={styles.mapWrapper} activeOpacity={0.9} onPress={mapPress}>
            <Image 
              source={{ uri: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3B4Njg0MzA3LWltYWdlLWt3eHlyeXo3LmpwZw.jpg' }}
              style={styles.mapPlaceholder}
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={40} color={COLORS.secondary} />
              <View style={styles.addressPill}>
                 <View style={styles.truckIconCircle}>
                    <MaterialCommunityIcons name="truck-delivery" size={18} color={COLORS.primary} />
                 </View>
                 <Text style={styles.addressText}>
                    {t('DELIVERING TO')} {"\n"}
                    <Text style={styles.addressBold} numberOfLines={1}>
                       {finalAddress || t('Select delivery location')}
                    </Text>
                 </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Section: Choose Brand */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Choose Brand')}</Text>
            <Text style={styles.sectionSubtitle}>{t('PREMIUM SELECTION')}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandContainer}>
            {brands.map((brand) => (
              <TouchableOpacity 
                key={brand.id}
                onPress={() => setSelectedBrand(brand.id)}
                style={[styles.brandCard, selectedBrand === brand.id && styles.brandCardActive]}
              >
                <View style={styles.brandCircle}>
                  <Text style={styles.brandInitial}>{brand.logo}</Text>
                </View>
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section: Select Sizes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Select Sizes')}</Text>
            <Text style={styles.sectionSubtitle}>{t('AVAILABLE NOW')}</Text>
          </View>

          <View style={styles.productList}>
            <ProductItem 
              title={t('1.5L Classic Pack')} subtitle={t('Pack of 6 bottles')} price={`${PRICES.medium} DA`} 
              qty={currentBrandCart.medium} onAdd={() => updateQty('medium', 1)} onSub={() => updateQty('medium', -1)} 
              imageUri="https://images.unsplash.com/photo-1605548230624-8d2d0419c517?q=80&w=200"
            />
            <ProductItem 
              title={t('5L Family Size')} subtitle={t('Single container')} price={`${PRICES.large} DA`} 
              qty={currentBrandCart.large} onAdd={() => updateQty('large', 1)} onSub={() => updateQty('large', -1)} 
              imageUri="https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=200"
            />
             <ProductItem 
              title={t('0.5L Pocket Pack')} subtitle={t('Pack of 12 bottles')} price={`${PRICES.small} DA`} 
              qty={currentBrandCart.small} onAdd={() => updateQty('small', 1)} onSub={() => updateQty('small', -1)} 
              imageUri="https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=200"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: 25 + insets.bottom }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
            <Text style={styles.totalAmount}>{totalPrice} DA</Text>
          </View>
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.btnSchedule} onPress={handleSchedule}>
              <Text style={styles.btnScheduleText}>{t('SCHEDULE')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOrder} onPress={handleOrderNow}>
              <Text style={styles.btnOrderText}>{t('ORDER NOW')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const ProductItem = ({ title, subtitle, price, qty, onAdd, onSub, imageUri }: any) => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
       {imageUri ? (
         <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
       ) : (
         <MaterialCommunityIcons name="water" size={40} color={COLORS.primary} opacity={0.2} />
       )}
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{title}</Text>
      <Text style={styles.productSubtitle}>{subtitle}</Text>
      <Text style={styles.productPriceText}>{price}</Text>
    </View>
    <View style={styles.stepperContainer}>
      <TouchableOpacity onPress={onAdd} style={styles.stepBtn}><Ionicons name="add" size={20} color={COLORS.primary}/></TouchableOpacity>
      <Text style={styles.qtyValue}>{qty}</Text>
      <TouchableOpacity onPress={onSub} style={styles.stepBtn} disabled={qty===0}><Ionicons name="remove" size={20} color={qty===0 ? '#CCC' : COLORS.primary}/></TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.secondary, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 150 },
  mapWrapper: {
    height: 180,
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#DDD',
    elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
  },
  mapPlaceholder: { width: '100%', height: '100%', opacity: 0.6 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  addressPill: {
    position: 'absolute', bottom: 15, backgroundColor: 'white',
    width: '90%', borderRadius: 50, flexDirection: 'row', alignItems: 'center', padding: 8,
  },
  truckIconCircle: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  addressText: { marginLeft: 10, fontSize: 10, color: COLORS.textGray, flex: 1 },
  addressBold: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 25, marginTop: 10 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  sectionSubtitle: { fontSize: 10, fontWeight: 'bold', color: COLORS.textGray },
  brandContainer: { paddingLeft: 20, marginVertical: 15 },
  brandCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', 
    padding: 8, paddingRight: 20, borderRadius: 40, marginRight: 15, borderWidth: 2, borderColor: 'transparent'
  },
  brandCardActive: { backgroundColor: 'white', borderColor: COLORS.secondary },
  brandCircle: { width: 35, height: 35, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  brandInitial: { fontWeight: 'bold', fontSize: 12, color: COLORS.textGray },
  brandName: { marginLeft: 10, fontWeight: 'bold', color: COLORS.primary },
  productList: { paddingHorizontal: 20 },
  productCard: {
    backgroundColor: 'white', borderRadius: 25, padding: 15, flexDirection: 'row', 
    alignItems: 'center', marginBottom: 15, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
  productImageContainer: { width: 70, height: 70, backgroundColor: '#F8FAFC', borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, marginLeft: 15 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  productSubtitle: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
  productPriceText: { fontSize: 18, fontWeight: '900', color: COLORS.primary, marginTop: 5 },
  stepperContainer: { backgroundColor: '#F8FAFC', borderRadius: 25, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: '#EEF2F6' },
  stepBtn: { width: 32, height: 32, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginVertical: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  qtyValue: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary, marginVertical: 4 },
  footer: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white',
    padding: 25, borderTopLeftRadius: 35, borderTopRightRadius: 35, elevation: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  totalLabel: { color: COLORS.textGray, fontWeight: '700', fontSize: 14 },
  totalAmount: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSchedule: { flex: 1, height: 55, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  btnScheduleText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  btnOrder: { flex: 1.5, height: 55, backgroundColor: COLORS.secondary, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  btnOrderText: { color: COLORS.primary, fontWeight: '900', fontSize: 15 },
});
