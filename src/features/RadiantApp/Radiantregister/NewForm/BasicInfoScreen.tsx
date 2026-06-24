// screens/BasicInfoScreen.tsx

import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet, ToastAndroid} from 'react-native';
import {useFormik} from 'formik';

import {
  AppInput,
  SelectPicker,
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';

import {colors} from '../../../../utils/styles/theme';
import {useFormCtx} from './FormContext';
import {BasicInfoSchema} from '../../../../utils/validationSchemas';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import {APP_URLS} from '../../../../utils/network/urls';
import ShowLoader from '../../../../components/ShowLoder';
import {translate} from '../../../../utils/languageUtils/I18n';

const STEP = 1;

const GENDER_OPTIONS = [
  translate('Male'),
  translate('Female'),
  translate('Other'),
];
const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  "Don't Know",
];
const RELIGION_OPTIONS = [
  translate('Hinduism'),
  translate('Islam'),
  translate('Christianity'),
  translate('Sikhism'),
  translate('Buddhism'),
  translate('Jainism'),
];
const MARITAL_STATUS_OPTIONS = [translate('Single'), translate('Married')];
const OPTIONAL_DOC_OPTIONS = [
  translate('Ration Card'),
  translate('Driving License'),
  translate('Voter ID'),
  translate('Passport'),
];

const BasicInfoScreen = ({onNext}: {onNext: () => void}) => {
  const {post} = useAxiosHook();
  const {formData, updateStep, nextStep} = useFormCtx();
  const stepColor = getStepColor(STEP);
  const formatToYYYYMMDD = (dateStr: string) => {
    if (!dateStr) {
      return '';
    }

    try {
      // DD/MM/YYYY
      if (dateStr.includes('/')) {
        const [dd, mm, yyyy] = dateStr.split('/');
        if (!dd || !mm || !yyyy) {
          return '';
        }
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }

      // YYYY-MM-DD
      if (dateStr.includes('-')) {
        return dateStr;
      }

      return '';
    } catch (e) {
      console.log('❌ Date convert error:', e);
      return '';
    }
  };

  const isAgeValid = (dateStr: string) => {
    const formatted = formatToYYYYMMDD(dateStr);
    if (!formatted) {
      return false;
    }

    const dob = new Date(formatted);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 18;
  };
  const showToast = (msg: string) => ToastAndroid.show(msg, ToastAndroid.SHORT);

  const formik = useFormik({
    initialValues: formData.basicInfo || {
      fullName: '',
      dob: '',
      age: '',
      gender: '',
      alternateNo: '',
      religion: '',
      bloodGroup: '',
      maritalStatus: '',
      noOfChildren: '',
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      motherOccupation: '',
      spouseName: '',
      spouseOccupation: '',
      optionalDoc: '',
      optionalDocId: '',
    },

    validationSchema: BasicInfoSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async values => {
      try {
        const formattedDOB = formatToYYYYMMDD(values.dob);

        console.log('📅 Original:', values.dob);
        console.log('✅ Converted:', formattedDOB);

        if (!formattedDOB) {
          showToast(translate('Invalid DOB format'));
          return;
        }

        if (!isAgeValid(values.dob)) {
          showToast(translate('Minimum age should be 18'));
          return;
        }

        const payload = {
          FullName: values.fullName,
          DOB: formattedDOB,
          Gender: values.gender,
          AlternativeMobile: values.alternateNo,
          Religion: values.religion,
          BloodGroup: values.bloodGroup,
          MaritalStatus: values.maritalStatus,
          NoofChildren: values.noOfChildren,
          Fathername: values.fatherName,
          FatherOccupation: values.fatherOccupation,
          Mothername: values.motherName,
          MotherOccupation: values.motherOccupation,
          Spousename: values.spouseName,
          SpouseOccupation: values.spouseOccupation,
          OptionalDoc: values.optionalDoc,
          OptionalDocID: values.optionalDocId,
        };

        console.log('📦 FINAL PAYLOAD:', payload);

        const res = await post({
          url: APP_URLS.InsertForm1UpdateJson,
          data: payload,
        });
        console.log('====================================');
        console.log();
        console.log('====================================');
        console.log('📥 InsertForm1 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          showToast(translate('Basic info saved!'));
          updateStep(translate('basicInfo'), values);
          nextStep();
          onNext();
        } else {
          showToast(translate('Submit failed'));
        }
      } catch (err) {
        console.log('❌ ERROR:', err);
        showToast(translate('Something went wrong'));
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = formik;

  const f = (name: keyof typeof values) => ({
    value: values[name],
    error: errors[name] as string | undefined,
    touched: !!touched[name],
    onBlur: () => setFieldTouched(name, true),
    onChangeText: (t: string) => setFieldValue(name, t),
  });
  const formatApiDOB = (dob: string) => {
    if (!dob) {
      return '';
    }

    try {
      // 👉 "12-10-1979 12:00:00 AM" → "12-10-1979"
      const datePart = dob.split(' ')[0];

      // DD-MM-YYYY → YYYY-MM-DD
      if (datePart.includes('-')) {
        const parts = datePart.split('-');

        if (parts[0].length === 2) {
          const [dd, mm, yyyy] = parts;
          return `${yyyy}-${mm}-${dd}`;
        }

        // already correct
        return datePart;
      }

      return '';
    } catch (e) {
      console.log('❌ DOB error:', e);
      return '';
    }
  };
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📡 ShowForm1 URL:', APP_URLS.ShowForm1);
        const res = await post({url: APP_URLS.ShowForm1});
        console.log('✅ ShowForm1 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          setLoading(false);

          const c = res.Content;

          // ✅ Pehle prefill karo — isvalid pe auto-navigate NAHI
          formik.setValues(
            {
              fullName: c.FullName ?? '',
              dob: formatApiDOB(c.DOB),
              age: '',
              gender: c.Gender ?? '',
              alternateNo: c.AlternativeMobile ?? '',
              religion: c.Religion ?? '',
              bloodGroup: c.BloodGroup ?? '',
              maritalStatus: c.MaritalStatus ?? '',
              noOfChildren:
                c.NoofChildren != null ? String(c.NoofChildren) : '',
              fatherName: c.Fathername ?? '',
              fatherOccupation: c.FatherOccupation ?? '',
              motherName: c.Mothername ?? '',
              motherOccupation: c.MotherOccupation ?? '',
              spouseName: c.Spousename ?? '',
              spouseOccupation: c.SpouseOccupation ?? '',
              optionalDoc: c.OptionalDoc ?? '',
              optionalDocId: c.OptionalDocID ?? '',
            },
            false,
          ); // false = validation trigger mat karo prefill pe
        }
      } catch (e) {
        console.log('❌ ShowForm1 ERROR:', e);
      }
    };

    fetchData();
  }, []);

  const onPressNext = async () => {
    const errs = await formik.validateForm();
    if (Object.keys(errs).length > 0) {
      const firstError = Object.values(errs)[0] as string;
      showToast(firstError);
      return;
    }
    handleSubmit();
  };

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled">
        {loading && <ShowLoader />}

        {/* Personal Details */}
        <SectionCard
          title={translate('Personal Details')}
          icon="account"
          iconColor={stepColor}>
          <AppInput
            label={translate('Full Name')}
            placeholder={translate('Enter full name')}
            {...f('fullName')}
            editable={false}
          />
          <AppInput
            label={translate('Date of Birth')}
            placeholder="DD/MM/YYYY or YYYY-MM-DD"
            {...f('dob')}
            editable={false}
          />

          {/* <SelectPicker
            label="Gender"
            options={GENDER_OPTIONS}
            value={values.gender}
            onChange={(v) => setFieldValue('gender', v)}
            error={errors.gender}
            touched={!!touched.gender}

          /> */}
          <AppInput
            label={translate('Gender')}
            placeholder={translate('Gender')}
            {...f('gender')}
            editable={false}
          />

          <AppInput
            label={translate('Alternate Mobile')}
            placeholder={translate('Enter alternate number')}
            keyboardType="phone-pad"
            maxLength={10}
            {...f('alternateNo')}
          />
          <SelectPicker
            label={translate('Religion')}
            options={RELIGION_OPTIONS}
            value={values.religion}
            onChange={v => setFieldValue('religion', v)}
            error={errors.religion}
            touched={!!touched.religion}
          />
          <SelectPicker
            label={translate('Blood Group')}
            options={BLOOD_GROUP_OPTIONS}
            value={values.bloodGroup}
            onChange={v => setFieldValue('bloodGroup', v)}
            error={errors.bloodGroup}
            touched={!!touched.bloodGroup}
          />
        </SectionCard>

        {/* Marital Details */}
        <SectionCard
          title={translate('Marital Details')}
          icon="heart-outline"
          iconColor={stepColor}>
          <SelectPicker
            label={translate('Marital Status')}
            options={MARITAL_STATUS_OPTIONS}
            value={values.maritalStatus}
            onChange={v => {
              setFieldValue(translate('maritalStatus'), v);
              if (v === translate('Single')) {
                setFieldValue(translate('spouseName'), '');
                setFieldValue(translate('spouseOccupation'), '');
                setFieldValue(translate('noOfChildren'), '');
              }
            }}
            error={errors.maritalStatus}
            touched={!!touched.maritalStatus}
          />
          {values.maritalStatus === 'Married' && (
            <>
              <AppInput
                label={translate('Spouse Name')}
                placeholder={translate('Enter spouse name')}
                {...f('spouseName')}
              />
              <AppInput
                label={translate('Spouse Occupation')}
                placeholder={translate('Enter spouse occupation')}
                {...f('spouseOccupation')}
              />
              <AppInput
                label={translate('No. of Children')}
                placeholder={translate('Enter number')}
                keyboardType="numeric"
                {...f('noOfChildren')}
              />
            </>
          )}
        </SectionCard>

        {/* Family Details */}
        <SectionCard
          title={translate('Family Details')}
          icon="account-group-outline"
          iconColor={stepColor}>
          <AppInput
            label={translate('Father Name')}
            placeholder={translate('Enter father name')}
            {...f('fatherName')}
          />
          <AppInput
            label={translate('Father Occupation')}
            placeholder={translate('Enter fathers occupation')}
            {...f('fatherOccupation')}
          />
          <AppInput
            label={translate('Mother Name')}
            placeholder={translate('Enter mother name')}
            {...f('motherName')}
          />
          <AppInput
            label={translate('Mother Occupation')}
            placeholder={translate('Enter mother occupation')}
            {...f('motherOccupation')}
          />
        </SectionCard>

        {/* Optional Document */}
        <SectionCard
          title={translate('Optional Document')}
          icon="file-document-outline"
          iconColor={stepColor}>
          <SelectPicker
            label={translate('Document Type')}
            options={OPTIONAL_DOC_OPTIONS}
            value={values.optionalDoc}
            onChange={v => {
              setFieldValue('optionalDoc', v);
              setFieldValue('optionalDocId', ''); // clear ID when doc type changes
            }}
            error={errors.optionalDoc}
            touched={!!touched.optionalDoc}
          />
          {!!values.optionalDoc && (
            <AppInput
              label={`${values.optionalDoc} ${translate('Number')}`}
              placeholder={`Enter ${values.optionalDoc} ${translate('Number')}`}
              {...f('optionalDocId')}
            />
          )}
        </SectionCard>

        <NavRow onNext={onPressNext} stepColor={stepColor} />
      </ScrollView>
    </View>
  );
};

export default BasicInfoScreen;

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.light_blue},
  scroll: {padding: 16, paddingBottom: 40},
});
