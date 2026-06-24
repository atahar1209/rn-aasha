import React from 'react';
import {View} from 'react-native';
import {hScale} from '../../utils/styles/dimensions';
import {useSelector} from 'react-redux';
import {RootState} from '../../reduxUtils/store';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import WalletCard from './RadiantTrxn/WalletCard';
import CmsTab from './CmsTab';
import AllBalance from '../../components/AllBalance';
import {commonStyles} from '../../utils/styles/commonStyles';
import {useNavigation} from '../../utils/navigation/NavigationService';

const RadiantTransactionScreen = () => {
  const {colorConfig, rctype} = useSelector(
    (state: RootState) => state.userInfo,
  );
  const navigation = useNavigation();

  return (
    <View style={commonStyles.screenContainer}>
      <AppBarSecond
        title={'R A D I A N T   C M S'}
        onPressBack={() => navigation.navigate('DashboardScreen')}
      />
      {rctype === 'PrePay' && <AllBalance />}

      {rctype === 'PostPay' && (
        <View>
          <WalletCard />
        </View>
      )}
      <View style={{marginTop: hScale(15), flex: 1}}>
        <CmsTab />
      </View>
    </View>
  );
};

export default RadiantTransactionScreen;
