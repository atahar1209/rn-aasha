/* eslint-disable no-unreachable */
// screens/DataPrivacyScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {SectionCard, NavRow, getStepColor} from '../../components/FormUI';
import {colors} from '../../../../utils/styles/theme';
import {useFormCtx} from './FormContext';
import {hScale, wScale} from '../../../../utils/styles/dimensions';
import {toast} from './AadhaarPanVerification/types';
import {APP_URLS} from '../../../../utils/network/urls';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import {useNavigation} from '../../../../utils/navigation/NavigationService';
import ConfirmSubmitSheet from '../../components/ConfirmSubmitSheet';
import {translate} from '../../../../utils/languageUtils/I18n';

const STEP = 10; // apne step number se change karo

// ─── Data ────────────────────────────────────────────────

const SECTIONS = [
  {
    id: '1',
    icon: 'information-outline',
    title: translate('Background'),
    points: [
      'The Individual has approached the Company to on-board as a Retail Cash Executive (RCE) for providing necessary services, to support the Cash Management Services of the Company.',
      'The Individual understands that the Company to on-board the RCE, need to collect, store and process certain personal data of the Individual ("Data").',
    ],
  },
  {
    id: '2',
    icon: 'office-building-outline',
    title: translate('Data Controller Information'),
    points: [
      translate('Name: Radiant Cash Management Services Limited ("Company")'),
      translate(
        'Corporate Office: 4/3 Raju Nagar, 1st Street, Okkiyam, Thoraipakkam, OMR, Chennai - 600097',
      ),
      translate('Contact: AGM - HR'),
      translate('Email: hr@radiantcashservices.com'),
    ],
  },
  {
    id: '3',
    icon: 'target',
    title: translate('Purpose of Data Collection'),
    points: [
      translate(
        'The Company collects Data for background verification, risk assessment, operational requirements and comply with applicable laws and to ensure the security and integrity of our services.',
      ),
    ],
  },
  {
    id: '4',
    icon: 'database-outline',
    title: translate('Types of Data Collected'),
    points: [
      translate(
        'Identification information (e.g., name, date of birth, government-issued ID i.e., PAN, AADHAAR etc.)',
      ),
      translate('Contact information (e.g., email address, phone number)'),
      translate(
        'Financial information (e.g., GST, Udyam, bank account details, transaction history)',
      ),
      translate('Credit Score / Credit Information'),
    ],
  },
  {
    id: '5',
    icon: 'source-branch',
    title: translate('Sources of Data Collection'),
    points: [
      translate('Individual itself'),
      translate('NSDL, GSTIN, UDYAM, Digilocker'),
      translate('Banks with which you maintain your accounts'),
      translate(
        'Anti-Money Laundering and Countering the Financing of Terrorism databases',
      ),
      translate(
        'Registrar of Companies / Partnerships / Societies / Trusts etc.',
      ),
      translate('Credit Information Provider Companies'),
      translate('Income Tax Department & KYC databases'),
    ],
  },
  {
    id: '6',
    icon: 'cog-outline',
    title: translate('Data Processing Activities'),
    points: [
      translate('On-boarding'),
      translate('Conducting risk assessments and fraud prevention'),
      translate('Sending notifications, updates and correspondence'),
      translate('Improving our Services'),
    ],
  },
  {
    id: '7',
    icon: 'share-variant-outline',
    title: translate('Data Sharing'),
    points: [
      translate('Regulatory authorities'),
      translate('Insurers & other entities registered with the Company'),
      translate('Service providers (e.g., background verification providers)'),
      translate('Settlement partners (e.g., Banks)'),
    ],
  },
  {
    id: '8',
    icon: 'hand-back-left-outline',
    title: translate('Right to Withdraw Consent'),
    points: [
      translate(
        'The Individual has the right to withdraw consent at any time by contacting hr@radiantcashservices.com.',
      ),
      translate(
        'Data will be retained for the period prescribed under applicable laws including Prevention of Money Laundering Act 2002 and RBI guidelines.',
      ),
      translate(
        'Data will continue to be shared with the parties stated in Section 7 above even after withdrawal.',
      ),
    ],
  },
  {
    id: '9',
    icon: 'clock-outline',
    title: translate('Data Retention'),
    points: [
      translate(
        'Data will be retained for as long as necessary to fulfil the purposes outlined above or as required by law applicable to the Company.',
      ),
    ],
  },
];

// ─── Bullet Row ───────────────────────────────────────────
const Bullet = ({text, color}: {text: string; color: string}) => (
  <View style={b.row}>
    <View style={[b.dot, {backgroundColor: color}]} />
    <Text style={b.text}>{text}</Text>
  </View>
);

const b = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hScale(8),
  },
  dot: {
    width: wScale(5),
    height: wScale(5),
    borderRadius: wScale(3),
    marginTop: hScale(8),
    marginRight: wScale(10),
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: wScale(13),
    color: '#475569',
    lineHeight: hScale(20),
  },
});

// ─── Main Screen ──────────────────────────────────────────
const DataPrivacyScreen = ({onNext}: {onNext: () => void}) => {
  const {nextStep, updateStep} = useFormCtx();
  const stepColor = getStepColor(STEP);
  const [agreed, setAgreed] = useState(true);
  const {post} = useAxiosHook();
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNext = async () => {
    if (!agreed) {
      toast(translate('Please agree to the Data Privacy Notice to continue'));
      return;
    }
    setShowConfirm(true); // ← Alert ki jagah yeh
  };

  const processFinalSubmit = async () => {
    try {
      updateStep('dataPrivacy', {agreed: true});

      const res1 = await post({url: 'api/Radiant/FinalFormSubmit'});
      console.warn('✅ First API Response:', JSON.stringify(res1, null, 2));

      const res3 = await post({url: APP_URLS.CheckPendingForm});
      console.warn('✅ Status Response:', JSON.stringify(res3, null, 2));

      const status = (res3?.status || '').trim();

      if (status === 'Approved') {
        navigation.navigate('ApprovalStatusScreen');
      } else if (status === 'Pending') {
        navigation.replace('CheckPendingForm');
      } else {
        console.warn('⚠️ Unknown status:', status);
        navigation.navigate('RadiantStep');
      }

      ToastAndroid.show(
        status || translate('Submitted Successfully'),
        ToastAndroid.SHORT,
      );
    } catch (err) {
      console.log('❌ ERROR:', err);
      toast(translate('Something went wrong'));
    }
  };

  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP}
      /> */}

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ConfirmSubmitSheet
          visible={showConfirm}
          onClose={() => setShowConfirm(false)}
          onProceed={async () => {
            setShowConfirm(false);
            await processFinalSubmit();
          }}
        />
        {/* ── Header notice ── */}
        <View style={s.headerBox}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={wScale(20)}
            color={stepColor}
          />
          <View style={{flex: 1}}>
            <Text style={[s.headerTitle, {color: stepColor}]}>
              {translate(' ANNEXURE I – DATA PRIVACY NOTICE AND CONSENT (RCE)')}
            </Text>
            <Text style={s.headerSub}>
              {translate(
                'This Annexure forms an integral part of the RCE Onboarding Form',
              )}
            </Text>
          </View>
        </View>

        {/* ── Addressee ── */}
        <View style={s.addressBox}>
          <Text style={s.addressLabel}>To,</Text>
          <Text style={s.addressText}>
            {translate(' Radiant Cash Management Services Limited ("Company")')}
          </Text>
          <Text style={s.addressText}>
            #28,{' '}
            {translate('Vijay Building, Vijayaragava Road, T Nagar, Chennai')} -
            600 017
          </Text>
          <Text style={[s.addressSub, {marginTop: hScale(8)}]}>
            <Text style={{fontWeight: '700'}}>Sub: </Text>
            {translate(
              'Grant of explicit consent for the collection, use, and processing of personal data ("Data") in compliance with the RBI Master Directions  on KYC, Prevention of Money Laundering Act 2002, and Digital Personal Data Protection Act 2023, and other applicable laws.',
            )}
          </Text>
        </View>

        {/* ── Numbered Sections ── */}
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            title={`${section.id}. ${section.title}`}
            icon={section.icon}
            iconColor={stepColor}>
            {section.points.map((point, idx) => (
              <Bullet key={idx} text={point} color={stepColor} />
            ))}
          </SectionCard>
        ))}

        {/* ── Declaration of Consent ── */}
        <SectionCard
          title={translate('Declaration of Consent')}
          icon="file-sign"
          iconColor={stepColor}>
          <Text style={s.declText}>
            {translate(
              'I, the undersigned, explicitly consent to the collection, use, and processing of Data as described in this form.',
            )}
          </Text>
          <Text style={s.declText}>
            {translate(
              'I confirm that I have read and agreed to Annexure I forming part of this application.',
            )}
          </Text>

          {/* ── Single Checkbox ── */}
          <TouchableOpacity
            style={[s.checkRow, agreed && {backgroundColor: stepColor + '12'}]}
            onPress={() => setAgreed(p => !p)}
            activeOpacity={0.7}>
            <View
              style={[
                s.checkbox,
                {borderColor: stepColor},
                agreed && {backgroundColor: stepColor},
              ]}>
              {agreed && (
                <MaterialCommunityIcons
                  name="check"
                  size={wScale(14)}
                  color="#fff"
                />
              )}
            </View>
            <Text
              style={[
                s.checkLabel,
                agreed && {color: stepColor, fontWeight: '600'},
              ]}>
              {agreed
                ? translate(
                    'I agree to the terms and consent to Aadhaar-based e-Sign ✓',
                  )
                : translate(
                    'I agree to the terms and consent to Aadhaar-based e-Sign',
                  )}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Legal note ── */}
        <View style={s.noteBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={wScale(14)}
            color="#92400E"
          />
          <Text style={s.noteText}>
            {translate('By tapping')}{' '}
            <Text style={{fontWeight: '700'}}>{translate('Next')}</Text>,{' '}
            {translate(
              'you confirm your explicit consent to the Data Privacy Notice above. This is legally binding under the Digital Personal Data Protection Act 2023.',
            )}
          </Text>
        </View>

        <NavRow
          onNext={handleNext}
          stepColor={agreed ? stepColor : '#CBD5E1'}
        />
      </ScrollView>
    </View>
  );
};

export default DataPrivacyScreen;

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.light_blue},
  scroll: {padding: 16, paddingBottom: 40},

  // Header
  headerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wScale(10),
    backgroundColor: '#fff',
    borderRadius: wScale(12),
    padding: wScale(14),
    marginBottom: hScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: wScale(12),
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: hScale(4),
  },
  headerSub: {fontSize: wScale(11.5), color: '#64748B', lineHeight: hScale(17)},

  // Addressee
  addressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: wScale(12),
    padding: wScale(14),
    marginBottom: hScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressLabel: {
    fontSize: wScale(12),
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: hScale(4),
  },
  addressText: {
    fontSize: wScale(13),
    color: '#374151',
    fontWeight: '500',
    lineHeight: hScale(20),
  },
  addressSub: {
    fontSize: wScale(12.5),
    color: '#475569',
    lineHeight: hScale(19),
  },

  // Declaration
  declText: {
    fontSize: wScale(13),
    color: '#475569',
    lineHeight: hScale(20),
    marginBottom: hScale(10),
  },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: hScale(14),
    paddingHorizontal: wScale(4),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: wScale(12),
    marginTop: hScale(4),
  },
  checkbox: {
    width: wScale(24),
    height: wScale(24),
    borderRadius: wScale(6),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hScale(1),
    flexShrink: 0,
  },
  checkLabel: {
    fontSize: wScale(13),
    color: '#94A3B8',
    flex: 1,
    lineHeight: hScale(20),
  },

  // Note box
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: wScale(12),
    padding: wScale(14),
    marginBottom: hScale(16),
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: wScale(8),
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: wScale(12.5),
    color: '#92400E',
    lineHeight: hScale(19),
  },
});
