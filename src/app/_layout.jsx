import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import syncService from "@/services/syncService";
import storageService from "@/services/storageService";
import { Toaster } from 'sonner-native';
import SyncIndicator from "@/components/SyncIndicator";
import Onboarding from "@/components/Onboarding";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Check onboarding status
      const onboardingStatus = await storageService.getOnboardingStatus();
      setOnboardingCompleted(onboardingStatus);

      // Run sync in the background without blocking the UI.
      syncService.autoSync().catch(error => {
        console.error('Auto-sync failed in background:', error);
      });

      // Set ready status
      setIsReady(true);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  const handleOnboardingComplete = async () => {
    await storageService.setOnboardingStatus(true);
    setOnboardingCompleted(true);
  };

  if (!isReady) {
    return null; // Show splash screen until ready
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Toaster position="bottom-right" richColors />
            {onboardingCompleted ? (
              <>
                <SyncIndicator />
                <Stack
                  screenOptions={{ headerShown: false }}
                  initialRouteName="(tabs)"
                  defaultOptions={{
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="story/[id]" />
                  <Stack.Screen name="category/[id]" />
                  <Stack.Screen name="about" />
                </Stack>
              </>
            ) : (
              <Onboarding onComplete={handleOnboardingComplete} />
            )}
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
