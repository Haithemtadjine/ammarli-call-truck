import React, { useState } from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore, PastTrip } from '../../src/store/useAppStore';

const TripCard = ({ trip }: { trip: PastTrip }) => {
  const isCompleted = trip.status === 'Completed';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.dateText}>{trip.date} • {trip.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#DEF7EC' : '#FDE8E8' }]}>
          <Text style={[styles.statusText, { color: isCompleted ? '#03543F' : '#9B1C1C' }]}>
            {trip.status}
          </Text>
        </View>
      </View>

      <Text style={styles.orderSummary}>{trip.orderSummary}</Text>

      <View style={styles.cardRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{trip.customerName}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Delivery Type</Text>
          <Text style={styles.infoValue}>{trip.deliveryType}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>{trip.amount.toFixed(2)} DA</Text>
      </View>
    </View>
  );
};

export default function DriverTripsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Past' | 'Scheduled'>('Past');
  const pastTrips = useAppStore((state: any) => state.pastTrips);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trips History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]} 
          onPress={() => setActiveTab('Past')}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Scheduled' && styles.activeTab]} 
          onPress={() => setActiveTab('Scheduled')}
        >
          <Text style={[styles.tabText, activeTab === 'Scheduled' && styles.activeTabText]}>Scheduled</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Past' ? (
          pastTrips.length > 0 ? (
            pastTrips.map((trip: PastTrip) => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No past trips found</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No scheduled trips</Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#003366',
  },
  tabText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderSummary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
});
