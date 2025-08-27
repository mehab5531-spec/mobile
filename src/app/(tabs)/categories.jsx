import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import CategoryCard from '@/components/CategoryCard';
import storageService from '@/services/storageService';
import syncService from '@/services/syncService';
import { WifiOff } from 'lucide-react-native';

export default function CategoriesScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const categoriesData = await storageService.getCategories();
      setCategories(categoriesData);

      // Check offline status
      const offline = await storageService.getOfflineMode();
      setIsOffline(offline);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await syncService.manualSync();
      if (result.success) {
        await loadData();
        if (result.updatesFound) {
          Alert.alert('Success', 'Categories updated successfully');
        }
      } else {
        Alert.alert('Sync Failed', result.message);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh categories');
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderCategory = ({ item }) => (
    <CategoryCard category={item} />
  );

  const renderLoadingItem = ({ item }) => (
    <CategoryCard loading={true} />
  );

  const renderEmptyComponent = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
        }}
      >
        No categories available.{'\n'}Pull down to refresh.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
            }}
          >
            Categories
          </Text>
          {isOffline && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <WifiOff size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                Offline
              </Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={loading ? Array.from({ length: 6 }).map((_, i) => ({ id: i })) : categories}
        renderItem={loading ? renderLoadingItem : renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
      />
    </View>
  );
}