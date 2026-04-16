import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0084FF', // لون زر المتابعة
  customerBlue: '#00ADEF', // لون بطاقة اطلب ماء
  driverNavy: '#001D3D', // لون بطاقة اعمل كسائق
  textDark: '#002D58',
  textGray: '#64748B',
  white: '#FFFFFF',
  background: '#FFFFFF',
};

type Role = 'customer' | 'driver' | null;

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<Role>('customer'); // Default to customer as per snippet

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === 'customer') {
      router.push('/login');
    } else {
      router.push('/driver-login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Logo */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Ammarli</Text>
      </View>

      <View style={styles.content}>
        {/* Titles */}
        <Text style={styles.mainTitle}>{t('Choose Your\nExperience')}</Text>
        <Text style={styles.subTitle}>{t('How would you like to use Ammarli today?')}</Text>

        {/* Role Cards Container */}
        <View style={styles.cardsContainer}>
          
          {/* Customer Card (اطلب ماء) */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setSelectedRole('customer')}
            style={[
              styles.roleCard, 
              { backgroundColor: COLORS.customerBlue },
              selectedRole === 'customer' && styles.selectedCard
            ]}
          >
            <MaterialCommunityIcons name="water-outline" size={40} color={COLORS.white} style={styles.cardIcon} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t('Order Water')}</Text>
              <Text style={styles.cardDesc}>{t('Get premium hydration delivered.')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            
            {/* Wave Decoration (Simplified) */}
            <View style={styles.waveOverlay}>
               <Text style={styles.waveText}>~~~~~~</Text>
            </View>
          </TouchableOpacity>

          {/* Driver Card (اعمل كسائق) */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setSelectedRole('driver')}
            style={[
              styles.roleCard, 
              { backgroundColor: COLORS.driverNavy },
              selectedRole === 'driver' && styles.selectedCard
            ]}
          >
            <MaterialCommunityIcons name="truck-delivery-outline" size={40} color={COLORS.white} style={styles.cardIcon} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t('Work as a Driver')}</Text>
              <Text style={styles.cardDesc}>{t('Join our elite delivery fleet.')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>

        </View>
      </View>

      {/* Footer Section */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={[styles.continueBtn, !selectedRole && { opacity: 0.5 }]} 
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueBtnText}>{t('CONTINUE')}</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          {t('BY CONTINUING, YOU AGREE TO OUR TERMS OF SERVICE AND PRIVACY POLICY.')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00ADEF',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    width: '100%',
  },
  roleCard: {
    width: '100%',
    height: 110,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'flex-start', // Because layout is RTL, flex-start will be on the right in RTL, but we need to ensure it matches the image. Actually, with 'row', React Native automatically flips.
    marginHorizontal: 15,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // will be flipped to right in RTL
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'left',
  },
  cardIcon: {
    opacity: 0.9,
  },
  waveOverlay: {
    position: 'absolute',
    bottom: -10,
    right: 0,
    opacity: 0.2,
  },
  waveText: {
    color: COLORS.white,
    fontSize: 40,
    letterSpacing: 2,
  },
  footer: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 20,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 18,
  },
});
