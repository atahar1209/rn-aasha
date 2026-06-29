import React, {useContext, useState} from 'react';
import {View, StyleSheet, ToastAndroid} from 'react-native';
import {hScale, wScale} from '../../utils/styles/dimensions';
import {SignUpContext} from './SignUpContext';
import DynamicButton from '../drawer/button/DynamicButton';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import {SvgUri} from 'react-native-svg';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {translate} from '../../utils/languageUtils/I18n';

const SignUpKyc = () => {
  const {
    businessName,
    setBusinessName,
    businessType,
    setBusinessType,
    personalAadhar,
    setPersonalAadhar,
    personalPAN,
    setPersonalPAN,
    gst,
    setGST,
    setCurrentPage,
    svg,
    Radius2,
  } = useContext(SignUpContext);
  const KycStep = () => {
    // Trim values (extra spaces remove)
    const name = businessName?.trim();
    const type = businessType?.trim();
    const aadhar = personalAadhar?.trim();
    const pan = personalPAN?.trim();

    // 🔴 Empty validation
    if (!name || !type || !aadhar || !pan) {
      showToast(translate('All fields must be filled'));
      return;
    }

    // 🔢 Aadhar validation (12 digits)
    if (!/^\d{12}$/.test(aadhar)) {
      showToast(translate('Enter valid 12 digit Aadhar number'));
      return;
    }

    // 🆔 PAN validation (10 characters standard)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      showToast(translate('Enter valid PAN (e.g. ABCDE1234F)'));
      return;
    }

    // ✅ All good → Next step
    setCurrentPage(prev => prev + 1);
  };

  // 🔔 Reusable Toast
  const showToast = msg => {
    ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  const [aadharf, setAdharf] = useState<any>(null);
  const [aadharb, setAdharb] = useState<any>(null);
  const [PanImage, setPanImage] = useState<any>(null);
  const [gstImage, setgstImage] = useState<any>(null);

  return (
    <KeyboardAwareScrollView
      style={{flex: 1, backgroundColor: 'white'}}
      contentContainerStyle={{flexGrow: 1, paddingBottom: 50}}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.inputview}>
          <FlotingInput
            label={translate('Business Name')}
            placeholderTextColor="#000"
            value={businessName}
            onChangeTextCallback={setBusinessName}
            labelinputstyle={{left: wScale(68)}}
            inputstyle={[styles.inputstyle, {borderRadius: Radius2}]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}
              uri={svg.BussinessName}
            />
          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput
            label={translate('Business Type')}
            placeholderTextColor="#000"
            value={businessType}
            onChangeTextCallback={setBusinessType}
            labelinputstyle={{left: wScale(68)}}
            inputstyle={[styles.inputstyle, {borderRadius: Radius2}]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}
              uri={svg.BusinessType}
            />
          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput
            label={translate('Personal Aadhar')}
            placeholderTextColor="#000"
            keyboardType="number-pad"
            value={personalAadhar}
            maxLength={12}
            onChangeTextCallback={setPersonalAadhar}
            labelinputstyle={{left: wScale(68)}}
            inputstyle={[styles.inputstyle, {borderRadius: Radius2}]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}
              uri={svg.AadharCard}
            />
          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput
            label={translate('Personal PAN')}
            placeholderTextColor="#000"
            keyboardType="ascii-capable"
            value={personalPAN}
            maxLength={12}
            onChangeTextCallback={setPersonalPAN}
            labelinputstyle={{left: wScale(68)}}
            inputstyle={[styles.inputstyle, {borderRadius: Radius2}]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.PanCard} />
          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput
            label={translate('GST (optional)')}
            placeholderTextColor="#000"
            value={gst}
            maxLength={15}
            onChangeTextCallback={setGST}
            labelinputstyle={{left: wScale(68)}}
            inputstyle={[styles.inputstyle, {borderRadius: Radius2}]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.GST} />
          </View>
        </View>

        <DynamicButton
          title={'Next'}
          onPress={KycStep}
          styleoveride={{marginTop: 10}}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(20),
    backgroundColor: '#fff',
  },

  inputstyle: {
    marginBottom: 0,
    paddingLeft: wScale(63),
  },
  inputview: {
    marginBottom: hScale(18),
  },
  IconStyle: {
    width: hScale(48),
    justifyContent: 'center',
    position: 'absolute',
    height: '100%',
    top: hScale(4.3),
  },
  labelinputstyle: {left: wScale(63)},
});

export default SignUpKyc;
