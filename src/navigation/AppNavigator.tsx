import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './TabNavigation';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SendEmailScreen from '../screens/SendEmailScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import FilterScreen from '../screens/FilterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CategoryScreen from '../screens/CategoryScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingScreen';
import PasswordManagerScreen from '../screens/PasswordManagerScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <><Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name ="SearchResults" component={SearchResultsScreen}/>
        <Stack.Screen name ="Category" component={CategoryScreen}/>
        <Stack.Screen name ="Notification" component={NotificationScreen}/>
        <Stack.Screen name ="Profile" component={ProfileScreen}/>
        <Stack.Screen name ="Setting" component={SettingsScreen}/>
        <Stack.Screen name ="PasswordManager" component={PasswordManagerScreen}/>
        </>
        
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
