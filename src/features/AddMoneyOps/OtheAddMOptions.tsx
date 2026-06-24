import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {hScale, wScale} from '../../utils/styles/dimensions';
import BorderLine from '../../components/BorderLine';
import {useSelector} from 'react-redux';
import {RootState} from '../../reduxUtils/store';
import {translate} from '../../utils/languageUtils/I18n';
type Props = {
  onSelect: (type: string) => void;
};
const OtheAddMOptions = ({onSelect}: Props) => {
  const {colorConfig} = useSelector((state: RootState) => state.userInfo);
  return (
    <View style={[styles.main, {}]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.btn} onPress={() => onSelect('IMPS')}>
          <Text style={styles.btnText}>{translate('IMPS')}</Text>
        </TouchableOpacity>
        <BorderLine
          style={{backgroundColor: '#FFF'}}
          height={'100%'}
          width={wScale(0.5)}
        />
        <TouchableOpacity style={styles.btn} onPress={() => onSelect('NEFT')}>
          <Text style={styles.btnText}>{translate('NEFT')}</Text>
        </TouchableOpacity>
        <BorderLine
          style={{backgroundColor: '#FFF'}}
          height={'100%'}
          width={wScale(0.5)}
        />
        <TouchableOpacity style={styles.btn} onPress={() => onSelect('RTGS')}>
          <Text style={styles.btnText}>{translate('RTGS')}</Text>
        </TouchableOpacity>
        <BorderLine
          style={{backgroundColor: '#FFF'}}
          height={'100%'}
          width={wScale(0.5)}
        />
        <TouchableOpacity
          style={[styles.btn]}
          onPress={() => onSelect('ATM Cash Deposit')}>
          <Text style={styles.btnText}>{translate('CDMA')}</Text>
        </TouchableOpacity>
        <BorderLine
          style={{backgroundColor: '#FFF'}}
          height={'100%'}
          width={wScale(0.5)}
        />

        <TouchableOpacity
          style={[styles.btn, styles.btnExtra]}
          onPress={() => onSelect('Branch Cash Deposit')}>
          <Text style={styles.btnText}>{translate('Branch Deposit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingVertical: hScale(10),
    marginTop: hScale(10),
    borderRadius: 5,
  },
  container: {
    paddingHorizontal: wScale(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hScale(4),
  },
  btnText: {
    fontSize: wScale(15),
    color: '#fff',
    fontWeight: '400',
    textAlign: 'center',
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  btnExtra: {
    width: '38%',
    flex: 0,
  },
});

export default OtheAddMOptions;
