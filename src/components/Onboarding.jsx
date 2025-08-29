import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRightCircleIcon, CheckCircle2Icon } from 'lucide-react-native';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // Start at step 0 for language selection
  const { colors } = useTheme();
  const { t, changeLanguage, language } = useLanguage();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    setStep(1);
  };

  const steps = [
    {
      title: t('language'),
      description: t('select_your_language'),
    },
    {
      title: t('onboarding_step1_title'),
      description: t('onboarding_step1_desc'),
    },
    {
      title: t('onboarding_step2_title'),
      description: t('onboarding_step2_desc'),
    },
    {
      title: t('onboarding_step3_title'),
      description: t('onboarding_step3_desc'),
    },
  ];

  if (step === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{steps[0].title}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => handleLanguageSelect('en')}>
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => handleLanguageSelect('ar')}>
            <Text style={styles.buttonText}>العربية</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{steps[step].title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{steps[step].description}</Text>
      </View>
      <View style={styles.footer}>
        <Button
          title={step < 3 ? t('next') : t('finish')}
          onPress={handleNext}
          color={colors.primary}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Onboarding;