import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import StoryCard from '@/components/StoryCard';
import storageService from '@/services/storageService';
import syncService from '@/services/syncService';
import { WifiOff } from 'lucide-react-native';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Load featured stories
      const featured = await storageService.getFeaturedStories();
      setFeaturedStories(featured);

      // Load recent stories (limit to 10)
      const allStories = await storageService.getStories();
      const recent = allStories
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setRecentStories(recent);

      // Check offline status
      const offline = await storageService.getOfflineMode();
      setIsOffline(offline);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load stories');
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
          Alert.alert('Success', 'Stories updated successfully');
        }
      } else {
        Alert.alert('Sync Failed', result.message);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh stories');
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();

    // Auto sync on app start
    const performAutoSync = async () => {
      try {
        const result = await syncService.autoSync();
        if (result.success && result.data) {
          await loadData();
        }
      } catch (error) {
        console.error('Auto sync error:', error);
      }
    };

    performAutoSync();
  }, [loadData]);

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
            Stories
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

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Featured Stories Section */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            Featured Stories
          </Text>
          <FeaturedCarousel stories={featuredStories} loading={loading} />
        </View>

        {/* Recent Stories Section */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 16,
            }}
          >
            Recent Stories
          </Text>
          
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <StoryCard key={index} loading={true} />
            ))
          ) : recentStories.length > 0 ? (
            recentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                No stories available.{'\n'}Pull down to refresh.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}