import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './TabNavigation';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SendEmailScreen from '../screens/SendEmailScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Tabs" component={Tabs} />
      ) : (
        <>
          <Stack.Screen name="SignIn">
            {props => <SignInScreen {...props} onLogin={handleLogin} />}
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
