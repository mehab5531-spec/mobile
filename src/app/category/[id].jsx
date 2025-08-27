import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, WifiOff } from 'lucide-react-native';
import StoryCard from '@/components/StoryCard';
import storageService from '@/services/storageService';
import syncService from '@/services/syncService';

export default function CategoryScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [category, setCategory] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Load category
      const categories = await storageService.getCategories();
      const categoryData = categories.find(cat => cat.id === id);
      
      if (!categoryData) {
        Alert.alert('Error', 'Category not found');
        router.back();
        return;
      }
      
      setCategory(categoryData);

      // Load stories for this category
      const categoryStories = await storageService.getStoriesByCategory(id);
      const sortedStories = categoryStories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setStories(sortedStories);

      // Check offline status
      const offline = await storageService.getOfflineMode();
      setIsOffline(offline);
    } catch (error) {
      console.error('Error loading category data:', error);
      Alert.alert('Error', 'Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
  }, [loadData]);

  const renderStory = ({ item }) => (
    <StoryCard story={item} />
  );

  const renderLoadingItem = ({ item }) => (
    <StoryCard loading={true} />
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Category Image */}
      <Image
        source={{ uri: category?.poster_url }}
        style={{
          width: '100%',
          height: 200,
          backgroundColor: colors.surface,
        }}
        contentFit="cover"
        transition={200}
      />
      
      {/* Category Info */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {category?.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 16,
          }}
        >
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </Text>
      </View>
    </View>
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
        No stories in this category yet.{'\n'}Pull down to refresh.
      </Text>
    </View>
  );

  if (loading) {
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
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Loading Content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: '100%',
              height: 200,
              backgroundColor: colors.surface,
            }}
          />
          <View style={{ padding: 16 }}>
            <View
              style={{
                height: 28,
                backgroundColor: colors.surface,
                borderRadius: 14,
                marginBottom: 8,
                width: '60%',
              }}
            />
            <View
              style={{
                height: 16,
                backgroundColor: colors.surface,
                borderRadius: 8,
                width: '40%',
                marginBottom: 16,
              }}
            />
          </View>
          
          {Array.from({ length: 5 }).map((_, index) => (
            <StoryCard key={index} loading={true} />
          ))}
        </View>
      </View>
    );
  }

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
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginLeft: 16,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {category?.name || 'Category'}
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

      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={{
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
      />
    </View>
  );
}