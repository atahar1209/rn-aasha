import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AppBarSecond from '../headerAppbar/AppBarSecond';
import LenguageSvg from '../svgimgcomponents/Lenguageimg';
import {hScale, wScale} from '../../../utils/styles/dimensions';
import {useSelector} from 'react-redux';
import {RootState} from '../../../reduxUtils/store';
import {Dialog, ALERT_TYPE} from 'react-native-alert-notification';
import {useDispatch} from 'react-redux';
import CheckSvg from '../svgimgcomponents/CheckSvg';
import {setLocale, translate} from '../../../utils/languageUtils/I18n';
import {setAppLanguage} from '../../../reduxUtils/store/userInfoSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLAG_EMOJIS = {
  en: '🇬🇧',
  hi: '🇮🇳',
  bn: '🇧🇩',
  gj: '🇮🇳',
  kn: '🇮🇳',
  mh: '🇮🇳',
  tn: '🇮🇳',
  tl: '🇮🇳',
};

const LanguageSettings = () => {
  const {colorConfig, appLanguage} = useSelector(
    (state: RootState) => state.userInfo,
  );
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const dispatch = useDispatch();
  const saveRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(false);

  const languages = [
    {title: translate('English (India)'), code: 'en'},
    {title: translate('Hindi (हिंदी)'), code: 'hi'},
    {title: translate('Bengali (বাংলা)'), code: 'bn'},
    {title: translate('Gujarati (ગુજરાતી)'), code: 'gj'},
    {title: translate('Kannada (ಕನ್ನಡ)'), code: 'kn'},
    {title: translate('Marathi (मराठी)'), code: 'mh'},
    {title: translate('Tamil (தமிழ்)'), code: 'tn'},
    {title: translate('Telugu (తెలుగు)'), code: 'tl'},
  ];

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@app_language');
        if (savedLang) {
          const index = languages.findIndex(lang => lang.code === savedLang);
          if (index !== -1) setSelectedLanguageIndex(index);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    if (appLanguage) {
      const index = languages.findIndex(
        language => language.code === appLanguage,
      );
      if (index !== -1) {
        setSelectedLanguageIndex(index);
      }
    }
  }, [appLanguage]);

  const changeLanguage = (index: number) => {
    setTimeout(() => {
      if (saveRef.current) {
        saveRef.current.scrollToEnd({animated: true});
      }
    }, 100);
    setSelectedLanguageIndex(index);
  };

  const BtnPress = async () => {
    setLoading(true);
    try {
      const selectedLang = languages[selectedLanguageIndex].code;
      await AsyncStorage.setItem('@app_language', selectedLang);
      await setLocale(selectedLang);
      dispatch(setAppLanguage(selectedLang));
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: translate('SUCCESS'),
        textBody: translate('Your Language Is Changed Successfully'),
        button: translate('OK'),
        onPressButton: () => {
          Dialog.hide();
        },
      });
    } catch (error) {
      console.error('Error changing language:', error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: translate('ERROR'),
        textBody: translate('Failed to change language'),
        button: translate('OK'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.main}>
      <AppBarSecond
        title="Application {App} Language"
        actionButton={undefined}
        onActionPress={undefined}
        onPressBack={undefined}
        titlestyle={undefined}
      />

      <ScrollView
        ref={saveRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header illustration + selected badge */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.iconCircle,
              {backgroundColor: `${colorConfig.secondaryColor}18`},
            ]}>
            <LenguageSvg />
          </View>
          <Text style={styles.heroTitle}>{translate('Choose Language')}</Text>
          <Text style={styles.heroSub}>{translate('Selected Language')}</Text>

          {/* Active language badge */}
          <View
            style={[
              styles.activeBadge,
              {backgroundColor: colorConfig.secondaryColor},
            ]}>
            <Text style={styles.activeBadgeFlag}>
              {FLAG_EMOJIS[languages[selectedLanguageIndex].code]}
            </Text>
            <Text style={styles.activeBadgeText}>
              {languages[selectedLanguageIndex].title}
            </Text>
          </View>
        </View>

        {/* Language list card */}
        <View style={styles.card}>
          {languages.map((language, index) => {
            const isSelected = index === selectedLanguageIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => changeLanguage(index)}
                activeOpacity={0.75}
                style={[
                  styles.langRow,
                  isSelected && [
                    styles.langRowActive,
                    {
                      backgroundColor: `${colorConfig.secondaryColor}12`,
                      borderColor: colorConfig.secondaryColor,
                    },
                  ],
                  index === languages.length - 1 && {borderBottomWidth: 0},
                ]}>
                {/* Flag */}
                <View style={styles.flagBox}>
                  <Text style={styles.flagEmoji}>
                    {FLAG_EMOJIS[language.code]}
                  </Text>
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.langText,
                    isSelected && {
                      color: colorConfig.secondaryColor,
                      fontWeight: '700',
                    },
                  ]}>
                  {language.title}
                </Text>

                {/* Check indicator */}
                <View
                  style={[
                    styles.checkCircle,
                    isSelected
                      ? {
                          backgroundColor: colorConfig.secondaryColor,
                          borderColor: colorConfig.secondaryColor,
                        }
                      : {borderColor: '#D1D5DB'},
                  ]}>
                  {isSelected && <CheckSvg />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {backgroundColor: colorConfig.secondaryColor},
          ]}
          onPress={BtnPress}
          activeOpacity={0.85}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.saveBtnInner}>
              <Text style={styles.saveBtnText}>{translate('Save')}</Text>
              <Text style={styles.saveBtnArrow}>→</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{height: hScale(32)}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {flex: 1, backgroundColor: '#F5F6FA'},

  scrollContent: {
    paddingHorizontal: wScale(16),
    paddingBottom: hScale(20),
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: hScale(20),
    paddingBottom: hScale(20),
  },
  iconCircle: {
    width: wScale(80),
    height: wScale(80),
    borderRadius: wScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(12),
  },
  heroTitle: {
    fontSize: wScale(22),
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
    marginBottom: hScale(4),
  },
  heroSub: {
    fontSize: wScale(13),
    color: '#9CA3AF',
    marginBottom: hScale(14),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(18),
    paddingVertical: hScale(8),
    borderRadius: wScale(30),
    gap: wScale(8),
  },
  activeBadgeFlag: {
    fontSize: wScale(18),
  },
  activeBadgeText: {
    fontSize: wScale(14),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: wScale(18),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    marginBottom: hScale(20),
  },

  // Language row
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: wScale(6),
    marginVertical: hScale(2),
    borderRadius: wScale(12),
  },
  langRowActive: {
    borderWidth: 1.5,
  },
  flagBox: {
    width: wScale(38),
    height: wScale(38),
    borderRadius: wScale(19),
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(14),
  },
  flagEmoji: {
    fontSize: wScale(20),
  },
  langText: {
    flex: 1,
    fontSize: wScale(15),
    color: '#374151',
    fontWeight: '500',
  },
  checkCircle: {
    width: wScale(26),
    height: wScale(26),
    borderRadius: wScale(13),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Save button
  saveBtn: {
    borderRadius: wScale(14),
    height: hScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(8),
  },
  saveBtnText: {
    fontSize: wScale(16),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  saveBtnArrow: {
    fontSize: wScale(18),
    color: '#fff',
    fontWeight: '700',
  },
});

export default LanguageSettings;
