import { StyleSheet, Linking } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { createRef } from 'react';

const App = () => {
  // Tạo tham chiếu navigation
  const navigationRef = createRef();

  // Hàm để lấy các tham số từ URL query string
  const getQueryParams = (url) => {
    const queryParams = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      const params = queryString.split('&');
      params.forEach(param => {
        const [key, value] = param.split('=');
        queryParams[key] = decodeURIComponent(value); // Giải mã tham số URL
      });
    }

    return queryParams;
  };

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('Deep link received:', url);

      if (url.includes('payment-success')) {
        // Lấy token và PayerID từ URL
        const queryParams = getQueryParams(url); // Sử dụng hàm getQueryParams
        const token = queryParams.token;
        const payerId = queryParams.PayerID;

        // Điều hướng đến màn hình PaymentSuccess và truyền token và payerId
        navigationRef.current?.navigate('PaymentSuccess', { token, payerId });
      } else if (url.includes('payment-cancel')) {
        navigationRef.current?.navigate('Payment', {closeWebView: true});
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
