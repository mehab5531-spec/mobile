import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Smartphone, RefreshCw, Trash2, Info } from 'lucide-react-native';
import storageService from '@/services/storageService';
import syncService from '@/services/syncService';

export default function SettingsScreen() {
  const { colors, isDark, theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [syncing, setSyncing] = useState(false);

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await syncService.manualSync();
      if (result.success) {
        Alert.alert('Sync Complete', result.message);
      } else {
        Alert.alert('Sync Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all downloaded stories and categories. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const ThemeOption = ({ themeValue, icon: Icon, label, selected, onPress }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: selected ? colors.primary + '20' : colors.surface,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
      onPress={() => onPress(themeValue)}
    >
      <Icon size={20} color={selected ? colors.primary : colors.textSecondary} />
      <Text
        style={{
          fontSize: 16,
          color: selected ? colors.primary : colors.text,
          marginLeft: 12,
          fontWeight: selected ? '600' : 'normal',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            Appearance
          </Text>
          
          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 16,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Theme
            </Text>
            
            <ThemeOption
              themeValue="light"
              icon={Sun}
              label="Light"
              selected={theme === 'light'}
              onPress={handleThemeChange}
            />
            
            <ThemeOption
              themeValue="dark"
              icon={Moon}
              label="Dark"
              selected={theme === 'dark'}
              onPress={handleThemeChange}
            />
            
            <ThemeOption
              themeValue="system"
              icon={Smartphone}
              label="System"
              selected={theme === 'system'}
              onPress={handleThemeChange}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            Data Management
          </Text>
          
          <SettingItem
            icon={RefreshCw}
            title="Sync Now"
            subtitle="Check for new stories and updates"
            onPress={handleManualSync}
            rightElement={
              syncing && (
                <Text style={{ color: colors.primary, fontSize: 14 }}>
                  Syncing...
                </Text>
              )
            }
          />
          
          <SettingItem
            icon={Trash2}
            title="Clear All Data"
            subtitle="Remove all downloaded stories and categories"
            onPress={handleClearData}
          />
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            About
          </Text>
          
          <SettingItem
            icon={Info}
            title="Stories App"
            subtitle="Version 1.0.0 • Offline-first reading experience"
          />
        </View>

        {/* Footer */}
        <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Stories are automatically synced weekly.{'\n'}
            Pull down to refresh on any screen for manual sync.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}