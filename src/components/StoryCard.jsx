import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

const StoryCard = ({ story, loading = false }) => {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 16,
          backgroundColor: colors.card,
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 12,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            backgroundColor: colors.border,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <View
              style={{
                height: 16,
                backgroundColor: colors.border,
                borderRadius: 8,
                marginBottom: 8,
                width: '90%',
              }}
            />
            <View
              style={{
                height: 12,
                backgroundColor: colors.border,
                borderRadius: 6,
                marginBottom: 8,
                width: '60%',
              }}
            />
          </View>
          <View
            style={{
              height: 12,
              backgroundColor: colors.border,
              borderRadius: 6,
              width: '40%',
            }}
          />
        </View>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => router.push(`/story/${story.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: story.poster_url }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          backgroundColor: colors.surface,
          marginRight: 12,
        }}
        contentFit="cover"
        transition={200}
      />
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {story.title}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginBottom: 8,
            }}
            numberOfLines={1}
          >
            by {story.author}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
            }}
          >
            {formatDate(story.created_at)}
          </Text>
          {story.is_featured && (
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '600',
                }}
              >
                FEATURED
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoryCard;