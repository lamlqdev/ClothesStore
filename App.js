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
            const queryParams = getQueryParams(url);
            const token = queryParams.token;
            const payerId = queryParams.PayerID;

            console.log('Deep Link Params:', { token, payerId });

            // Đảm bảo navigation được thực hiện
            if (navigationRef.current) {
                navigationRef.current.navigate('PaymentSuccess', { token, payerId });
            } else {
                console.error('Navigation ref is not available');
            }
        } else if (url.includes('payment-cancel')) {
            // Đảm bảo navigation được thực hiện khi cancel
            if (navigationRef.current) {
                navigationRef.current.navigate('Payment', { closeWebView: true });
            }
        }
    };

    // Đăng ký và xử lý deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);

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
