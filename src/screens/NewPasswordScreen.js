import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Header from '../components/Header';

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();

  const handleCreatePassword = () => {
    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }

    auth()
      .currentUser.updatePassword(password)
      .then(() => {
        Alert.alert('Success', 'Password has been updated successfully.');
        navigation.navigate('SignIn'); // Điều hướng về màn hình SignIn sau khi đặt mật khẩu thành công
      })
      .catch(error => {
        console.log('Error updating password:', error);
        Alert.alert('Error', error.message);
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <View style={styles.container}>
      <Header title="New Password" onBackPress={() => navigation.goBack()} />
      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subText}>
        Your new password must be different from previously used passwords.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={toggleShowPassword}>
          <Image
            source={showPassword
              ? require('../../assets/icons/ic_openeye.png')
              : require('../../assets/icons/ic_blindeye.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm Password"
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

      <TouchableOpacity style={styles.button} onPress={handleCreatePassword}>
        <Text style={styles.buttonText}>Create New Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#7D7D7D',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 30,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#7D7D7D',
  },
  button: {
    backgroundColor: '#6A432D',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NewPasswordScreen;
