import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import storageService from '@/services/storageService';

export default function StoryScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    try {
      const storyData = await storageService.getStoryById(id);
      if (storyData) {
        setStory(storyData);
      } else {
        Alert.alert('Error', 'Story not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading story:', error);
      Alert.alert('Error', 'Failed to load story');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <View
            style={{
              width: '100%',
              height: 200,
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginBottom: 16,
            }}
          />
          <View
            style={{
              height: 24,
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 16,
              backgroundColor: colors.surface,
              borderRadius: 8,
              width: '60%',
              marginBottom: 24,
            }}
          />
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={{
                height: 16,
                backgroundColor: colors.surface,
                borderRadius: 8,
                marginBottom: 8,
                width: index === 4 ? '80%' : '100%',
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!story) {
    return null;
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
          {story.category_name || 'Story'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Story Image */}
        <Image
          source={{ uri: story.poster_url }}
          style={{
            width: '100%',
            height: 250,
            backgroundColor: colors.surface,
          }}
          contentFit="cover"
          transition={200}
        />

        <View style={{ padding: 16 }}>
          {/* Story Title */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              lineHeight: 34,
              marginBottom: 12,
            }}
          >
            {story.title}
          </Text>

          {/* Story Meta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <User size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {story.author}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {formatDate(story.created_at)}
              </Text>
            </View>
          </View>

          {/* Featured Badge */}
          {story.is_featured && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                FEATURED STORY
              </Text>
            </View>
          )}

          {/* Story Content */}
          <MarkdownRenderer content={story.content} />
        </View>
      </ScrollView>
    </View>
  );
}