import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';

const PasswordManagerScreen = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      {/* Header reused */}
      <Header
       title="Password Manager"
       onBackPress={() => navigation.goBack()} 
       />

      {/* Current Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showCurrentPassword}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity onPress={toggleShowCurrentPassword}>
            <Image
              source={showCurrentPassword
                ? require('../../assets/icons/ic_openeye.png')
                : require('../../assets/icons/ic_blindeye.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* New Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showNewPassword}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={toggleShowNewPassword}>
            <Image
              source={showNewPassword
                ? require('../../assets/icons/ic_openeye.png')
                : require('../../assets/icons/ic_blindeye.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm New Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={toggleShowConfirmPassword}>
            <Image
              source={showConfirmPassword
                ? require('../../assets/icons/ic_openeye.png')
                : require('../../assets/icons/ic_blindeye.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Change Password Button */}
      <TouchableOpacity style={styles.changePasswordButton}>
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: Colors.White,
  },
  inputContainer: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    color: Colors.Black,
    fontFamily: Fonts.interMedium,
    marginBottom: spacing.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.LightGray,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: Colors.White,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: Fonts.interRegular,
    color: Colors.Black,
    paddingVertical: spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
  },
  forgotPassword: {
    color: Colors.Brown,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
    fontFamily: Fonts.interMedium,
  },
  changePasswordButton: {
    marginTop: spacing.lg,
    backgroundColor: Colors.Brown,
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  changePasswordText: {
    color: Colors.White,
    fontSize: fontSize.md,
    fontFamily: Fonts.interBold,
  },
});

export default PasswordManagerScreen;
