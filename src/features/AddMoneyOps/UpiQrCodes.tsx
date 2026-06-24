import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  AsyncStorage,
  ToastAndroid,
} from 'react-native';
import {hScale, wScale} from '../../utils/styles/dimensions';
import {APP_URLS} from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {useSelector} from 'react-redux';
import {RootState} from '../../reduxUtils/store';
import PaymentQR from './PaymentQR';
import {useNavigation} from '../../utils/navigation/NavigationService';
import {translate} from '../../utils/languageUtils/I18n';

const UpiQrCodes = ({route}) => {
  const {colorConfig} = useSelector((state: RootState) => state.userInfo);
  const {qrcode1Data, amnt, response} = route.params;
  const [hideqr, setHideqr] = useState(true);
  const {post} = useAxiosHook();
  const [code, setCode] = useState('');
  const [Txnid, setTxnId] = useState('');
  const [UtrNumber, setUtrNumber] = useState('');
  const [intervalId, setIntervalId] = useState(null);
  const [bharatPeResponse, setBharatPeResponse] = useState(null);

  const navigation = useNavigation<any>();

  useEffect(() => {
    createqr(amnt, response.name);
  }, []);
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const start = (tx, type) => {
    if (intervalId) return;

    const id = setInterval(() => {
      paymentresponse(tx, type);
    }, 5000);

    setIntervalId(id);
  };
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    navigation.navigate('HomeScreen');
  };
  const createqr = useCallback(
    async (amnt, type) => {
      let url = '';

      switch (type) {
        case translate('PAYTM'):
          url = `${APP_URLS.PaytmQrGenerate}${amnt}`;
          break;

        case translate('PHONE PE'):
          url = `${APP_URLS.PhonePeQrGenerate}${amnt}`;
          break;

        case translate('BHARAT PE'):
          url = `${APP_URLS.BharatPeQrGenerate}${amnt}`;
          break;

        case translate('VASTBAZAAR'):
          url = `${APP_URLS.VastbazzarUPIQRGenerate}${amnt}&Type=QR`;
          break;

        default:
          console.warn('Invalid QR Type:', type);
          Alert.alert(translate('Invalid QR Type Selected!'));
          return;
      }

      console.log('QR TYPE:', type, 'URL:', url);

      try {
        const Response = await post({url});

        const image = Response?.image;
        const tx = Response?.txnid;
        console.log('QR RESPONSE:', Response, type, tx);

        if (!tx) {
          Alert.alert(translate('Transaction ID missing!'));
          return;
        }

        setTxnId(tx);

        // If QR image exists
        if (image) {
          setCode(`data:image/png;base64,${image}`);

          // BharatPe does NOT auto-trigger start()
          if (type !== translate('BHARAT PE')) {
            start(tx, type);
            paymentresponse(tx, type);
          }
        } else {
          Alert.alert(Response?.message || translate('Failed to generate QR'));
        }
      } catch (error) {
        console.error('Error in createqr:', error);
        Alert.alert(translate('Something went wrong while generating QR!'));
      }
    },
    [post],
  );

  const paymentresponse = useCallback(
    async (txnid, type) => {
      let url = '';

      switch (type) {
        case translate('PAYTM'):
          url = `${APP_URLS.getPaytmResponse}${txnid}`;
          break;
        case translate('PHONE PE'):
          url = `${APP_URLS.getPhonePeResponse}${txnid}`;
          break;
        case translate('BHARAT PE'):
          url = `${APP_URLS.getBharatPeResponse}txnid=${txnid}&Utr=${UtrNumber}`;
          break;
        case translate('VASTBAZAAR'):
          url = `${APP_URLS.VastbazaarResponse}${txnid}`;
          break;
        default:
          break;
      }

      try {
        const Response = await post({url: url});
        console.log(url);
        console.log(Response, '***************');

        if (Response.toUpperCase() === translate('YES')) {
          stop();
          setHideqr(false);
          setCode('');

          if (Response.toUpperCase() === translate('YES')) {
            stop();
            setHideqr(false);
            setCode('');
            const result = {
              pa: '',
              pn: '',
              mc: '',
              mode: '',
              orgid: '',
              tid: '',
              tr: Txnid,
              am: amnt,
              cu: 'INR',
              tn: '',
              refUrl: '',
            };

            await AsyncStorage.setItem(
              translate('upi_intent_params'),
              JSON.stringify({result}), // <-- wrap inside result
            );

            await AsyncStorage.setItem(
              translate('upi_intent_params'),
              JSON.stringify(result),
            );
            navigation.navigate('AddMoneyPayResponse');

            //             Alert.alert(
            //                 'Payment Successful',
            //                 'Your payment was completed successfully. Thank you for your transaction!',
            //                 [
            //                     {
            //                         text: 'OK',
            //                         onPress: async () => {

            //                        await dispatch(clearLastScreen());
            // navigation.navigate("DashboardScreen");

            //                          },
            //                     },
            //                 ],
            //                 { cancelable: false }
            //             );
          }
        }
        console.log(txnid);
      } catch (error) {
        console.error('Error fetching QR code status:', error);
      }
    },
    [UtrNumber, post, stop, Txnid, amnt, navigation],
  );

  const paymentResponseForBharatPe = useCallback(
    async (txnid, utrNumber) => {
      console.log(utrNumber, Txnid, txnid, '---1ttt');

      let url = `${APP_URLS.getBharatPeResponse}txnid=${txnid}&Utr=${utrNumber}`;

      try {
        const response = await post({url: url});
        console.log(url);
        console.log(response, '***************');

        setBharatPeResponse(response);
        if (response.toUpperCase() === translate('YES')) {
          stop();
          setHideqr(false);
          setCode('');

          const result = {
            pa: '',
            pn: '',
            mc: '',
            mode: '',
            orgid: '',
            tid: '',
            tr: Txnid,
            am: amnt,
            cu: 'INR',
            tn: utrNumber,
            refUrl: '',
          };
          await AsyncStorage.setItem(
            translate('upi_intent_params'),
            JSON.stringify(result),
          );
          navigation.navigate('AddMoneyPayResponse');
        } else {
          ToastAndroid.show(
            translate('Payment status is NO. Please submit again.'),
            ToastAndroid.SHORT,
          );
        }
        console.log(txnid);
      } catch (error) {
        console.error('Error fetching BharatPe payment status:', error);
      }
    },
    [Txnid, post, stop, amnt, navigation],
  );

  const downloadQRCode = async () => {
    if (code) {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/qrcode-${APP_URLS.AppName}-${Txnid}-₹${amnt}.png`;
      try {
        await RNFS.writeFile(
          downloadDest,
          code.split('data:image/png;base64,')[1],
          'base64',
        );
        Alert.alert(
          translate('Download Successful'),
          translate('QR code has been downloaded successfully.'),
        );
      } catch (error) {
        console.error('Error downloading QR code:', error);
        Alert.alert(
          translate('Download Failed'),
          translate('Unable to download the QR code.'),
        );
      }
    }
  };
  const shareQRCode = async () => {
    if (code) {
      try {
        const shareOptions = {
          title: translate('Share QR Code'),
          url: code, // QR code URL or image path
          type: 'image/png',
          message: `${APP_URLS.AppName}\n ${translate(
            'Amount',
          )}: ₹${amnt}\n  ${translate(
            'Transaction ID',
          )}: ${Txnid}\n ${translate(
            'Hi, I am sharing the transaction details using',
          )} '${APP_URLS.AppName}' ${translate('App')}.`,
        };

        // Attempt to open the share dialog
        await Share.open(shareOptions);
      } catch (error) {
        console.error('Error sharing QR code:', error);
        Alert.alert(
          translate('Share Failed'),
          translate('Unable to share the QR code.'),
        );
      }
    }
  };
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        translate('Confirmation'),
        translate('Do you want to cancel txn or go back?'),
        [
          {
            text: translate('Go Back'),
            onPress: () => {
              navigation.navigate('DashboardScreen');
            },
          },

          {
            text: translate('Cancel'),
            style: 'cancel',
          },
        ],
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  return (
    <View style={styles.container}>
      <AppBarSecond title={translate('Scan & Pay')} />

      <View style={styles.container}>
        <PaymentQR
          bharatPeResponse={bharatPeResponse} // ✅ PASS HERE
          QrImg={code}
          amnt={amnt}
          name={response.name}
          Txnid={Txnid}
          onBharatpayresponse={paymentResponseForBharatPe}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    marginHorizontal: wScale(5),
    marginTop: hScale(20),
  },
  contentContainer: {
    alignItems: 'center',
  },
  qrImageContainer: {
    alignItems: 'center',
  },
  titleContainer: {
    marginTop: hScale(20),
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  option: {
    height: hScale(40),
    backgroundColor: '#fff',
    borderRadius: wScale(0),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wScale(10),
    marginBottom: hScale(20),
  },
  qrContainer: {},
  qrImage: {
    width: wScale(300),
    height: hScale(300),
    resizeMode: 'contain',
  },
  qrText: {
    fontSize: 16,
    marginTop: hScale(10),
    color: '#666',
  },
  timerText: {
    marginTop: hScale(10),
    fontSize: 16,
    color: '#333',
  },
  btn2: {
    paddingVertical: hScale(8),
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    paddingHorizontal: wScale(4),
  },
  btnborder: {
    borderRightWidth: wScale(0.5),
    height: '100%',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btntext: {
    color: '#fff',
    fontSize: wScale(22),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  homebtn: {
    flex: 1,
    alignItems: 'center',
  },
});

export default UpiQrCodes;
