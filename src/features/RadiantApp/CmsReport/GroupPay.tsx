import {translate} from '../../../utils/languageUtils/I18n';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import {hScale, wScale} from '../../../utils/styles/dimensions';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const paymentOptions = [
  translate('Barer Cash Deposit'),
  translate('Client Cash Deposit'),
  translate('Online Transfer'),
  translate('Wallet Transfer'),
];

const GroupPay = () => {
  const [totalAmount, setTotalAmount] = useState('₹15,000');
  // const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState(paymentOptions[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDropdownSelect = value => {
    setPaymentType(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.main}>
      {/* Header stays fixed at the top */}
      <AppBarSecond title={'Group Pay'} />

      <KeyboardAwareScrollView
        style={{flex: 1}}
        enableOnAndroid={true}
        extraScrollHeight={100} // कीबोर्ड और इनपुट के बीच की दूरी
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.label}>{translate('Total_Amount')}</Text>

          <FlotingInput
            label={translate('Total Amount')}
            value={totalAmount}
            editable={false}
            inputstyle={undefined}
            labelinputstyle={undefined}
            onChangeTextCallback={undefined}
          />

          <FlotingInput
            value={amount}
            onChangeTextCallback={text => setAmount(text)} // सुनिश्चित करें कि स्टेट अपडेट हो रही है
            keyboardType="number-pad"
            label={translate('Enter amount')}
            inputstyle={undefined}
            labelinputstyle={undefined}
          />

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}>
            <View pointerEvents="none">
              <FlotingInput
                label={translate('Select Mode')}
                value={paymentType}
                editable={false}
                inputstyle={undefined}
                labelinputstyle={undefined}
                onChangeTextCallback={undefined}
              />
            </View>
          </TouchableOpacity>

          <FlotingInput
            label={translate('Radiant Account')}
            value={''}
            editable={false}
            inputstyle={undefined}
            labelinputstyle={undefined}
            onChangeTextCallback={undefined}
          />

          <TouchableOpacity
            onPress={() => {
              /* Handle file upload */
            }}
            activeOpacity={0.7}>
            <View pointerEvents="none">
              <FlotingInput
                label={translate('Upload Slip')}
                editable={false}
                inputstyle={undefined}
                labelinputstyle={undefined}
                onChangeTextCallback={undefined}
              />
            </View>
          </TouchableOpacity>

          <View style={{marginTop: 20}}>
            <DynamicButton
              title={'Submit'}
              onPress={function (): void {
                throw new Error(translate('Function not implemented.'));
              }}
            />
          </View>

          {/* एक्स्ट्रा स्पेस ताकि आखरी बटन कीबोर्ड के ऊपर साफ़ दिखे */}
          <View style={{height: 50}} />
        </View>
      </KeyboardAwareScrollView>

      {/* Modal को ScrollView के बाहर रखा है ताकि ये पूरी स्क्रीन पर ओवरले हो */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}>
          <View style={styles.modalContent}>
            <FlatList
              data={paymentOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleDropdownSelect(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default GroupPay;

const styles = StyleSheet.create({
  main: {flex: 1, backgroundColor: '#fff'},
  container: {
    padding: wScale(16),
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  readonly: {
    backgroundColor: '#f2f2f2',
    color: '#555',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 6,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
});
