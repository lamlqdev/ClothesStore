import { StyleSheet, Linking } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { createRef } from 'react';

const App = () => {
  // Tạo tham chiếu navigation
  const navigationRef = createRef();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // Điều hướng dựa trên deep link
      if (url.includes('payment-success')) {
        navigationRef.current?.navigate('PaymentSuccess');
      } else if (url.includes('payment-cancel')) {
        navigationRef.current?.navigate('Payment');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Xử lý URL khi ứng dụng được khởi động từ deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
