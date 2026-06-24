import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

interface BorderLineProps {
  height?: number;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
}

const BorderLine: React.FC<BorderLineProps> = ({
  height = 1,
  width = '100%',
  style,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const lineStyle: ViewStyle = {
    height,
    width: width as any,
    backgroundColor: colorConfig.secondaryColor,
  };

  return (
    <View
      style={[
        styles.line,
        lineStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  line: {
  },
});

export default BorderLine;
