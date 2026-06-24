import React from 'react';
import {View, Text} from 'react-native';
import AppBar from './headerAppbar/AppBar';

const Administrator = () => {
  return (
    <View>
      <AppBar
        title={'Manage Important Security'}
        actionButton={undefined}
        onActionPress={undefined}
      />
    </View>
  );
};
export default Administrator;
