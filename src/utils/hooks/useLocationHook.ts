import {useCallback, useEffect, useState} from 'react';
import {
  PERMISSIONS,
  RESULTS,
  openSettings,
  requestMultiple,
  type PermissionStatus,
} from 'react-native-permissions';
import GetLocation from 'react-native-get-location';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Linking} from 'react-native'; // Import Keyboard here
import {translate} from '../languageUtils/I18n';

type PermissionStatuses = Record<string, PermissionStatus>;

export const useLocationHook = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] =
    useState<boolean | null>(null);
  const saveLatLongToStorage = async (lat: string, long: string) => {
    try {
      const locationData = JSON.stringify({latitude: lat, longitude: long});
      await AsyncStorage.setItem('locationData', locationData);
    } catch (error) {
      console.error('Failed to save location data:', error);
    }
  };
  const getLocationData = useCallback(
    async (statuses: PermissionStatuses) => {
      // Hide keyboard if it's open

      if (
        statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED
      ) {
        setIsLocationPermissionGranted(true);
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
        });
        if (location) {
          console.log(location, '!@#$%^&*()_+');
          setLatitude(location.latitude.toString());
          setLongitude(location.longitude.toString());
          dispatch(setLatitude(location.latitude.toString())); // Setting latitude to 40.7128
          dispatch(setLongitude(location.longitude.toString()));
          await saveLatLongToStorage(
            location.latitude.toString(),
            location.longitude.toString(),
          ); // Save to AsyncStorage
        }
      } else if (
        statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] ===
          RESULTS.GRANTED &&
        latitude === '' &&
        longitude === ''
      ) {
        setIsLocationPermissionGranted(true);
        const locationData = await GetLocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 60000,
        });

        if (locationData) {
          setLatitude(locationData.latitude.toString());
          setLongitude(locationData.longitude.toString());
          await saveLatLongToStorage(
            locationData.latitude.toString(),
            locationData.longitude.toString(),
          ); // Save to AsyncStorage
        }
      } else {
        setIsLocationPermissionGranted(false);
      }
    },
    [latitude, longitude],
  );

  const showPermissionDialog = useCallback(() => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: translate('Permission Required'),
      textBody: translate(
        'Please grant the location permission from settings.',
      ),
      closeOnOverlayTap: false,
      button: translate('OK'),
      onPressButton: () => {
        Dialog.hide();
        openSettings().catch(() => console.warn('cannot open settings'));
      },
    });
  }, []);

  const getLocation = useCallback(async () => {
    // Dismiss the keyboard before checking permissions
    //   Keyboard.dismiss();

    requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ])
      .then(async (statuses: PermissionStatuses) => {
        if (
          statuses &&
          (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
            RESULTS.GRANTED ||
            statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] ===
              RESULTS.GRANTED)
        ) {
          await getLocationData(statuses);
        } else {
          showPermissionDialog();
        }
      })
      .catch(e => {
        if (e.message === 'Location not available') {
          // Show an alert to ask user to enable GPS
          Alert.alert(
            translate('Location Services Disabled'),
            translate('GPS is turned off. Please turn on GPS to get location.'),
            [
              {text: translate('Cancel'), style: 'cancel'},
              {
                text: translate('Open Settings'),
                onPress: () => Linking.openSettings(),
              },
            ],
            {cancelable: false},
          );
        }
      });
  }, [getLocationData, showPermissionDialog]);

  const checkLocationPermissionStatus = useCallback(async () => {
    const status: PermissionStatuses = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ]);
    if (
      status &&
      (status[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
        status[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED)
    ) {
      await getLocationData(status);
      return true;
    } else {
      return false;
    }
  }, [getLocationData]);

  const getLatLongValue = useCallback(() => {
    return {latitude, longitude};
  }, [latitude, longitude]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    latitude,
    longitude,
    isLocationPermissionGranted,
    getLocation,
    checkLocationPermissionStatus,
    getLatLongValue,
  };
};
function dispatch(arg0: void) {
  throw new Error(translate('Function not implemented.'));
}
