import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './TabNavigation';
import FilterScreen from '../screens/FilterScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CategoryScreen from '../screens/CategoryScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SendEmailScreen from '../screens/SendEmailScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import AddCardScreen from '../screens/AddCardScreen';
import { ChoosePhoneScreen, ShippingAddressScreen } from '../screens/Shipping';
import AddAddressScreen from '../screens/AddAddressScreen';
import AddPhoneScreen from '../screens/AddPhoneScreen';
import SettingsScreen from '../screens/SettingScreen';
import PasswordManagerScreen from '../screens/PasswordManagerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import MyOderScreen from '../screens/MyOderScreen';
import TrackOrder from '../screens/TrackOrderScreen';
import LeaveReviewScreen from '../screens/LeaveReviewScreen';
import ProductDetail from '../screens/ProductDetail';
import FilterCategory from '../screens/FilterCategoryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Tabs">
            {props => <Tabs {...props} onLogout={() => setIsLoggedIn(false)} />}
          </Stack.Screen>
          <Stack.Screen name="Filter" component={FilterScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
          <Stack.Screen name="ChoosePhone" component={ChoosePhoneScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="AddPhone" component={AddPhoneScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="AddCard" component={AddCardScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Setting" component={SettingsScreen} />
          <Stack.Screen name="PasswordManager" component={PasswordManagerScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="MyOrders" component={MyOderScreen} />
          <Stack.Screen name="TrackOrder" component={TrackOrder} />
          <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="FilterCategory" component={FilterCategory} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn">
            {props => <SignInScreen {...props} onlogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
          <Stack.Screen name="SendEmail" component={SendEmailScreen} />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;