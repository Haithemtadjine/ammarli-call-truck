try {
    const { useAppStore } = require('./src/store/useAppStore');
    console.log('Store imported successfully');
    const state = useAppStore.getState();
    console.log('Initial state retrieved');
    console.log('Total Earnings:', state.totalEarnings);
} catch (e) {
    console.error('Error in store:', e);
}
