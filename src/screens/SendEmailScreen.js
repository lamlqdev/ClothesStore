import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth'; // Firebase Auth
import Header from '../components/Header'; // Import Header

const SendEmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (email) {
      setLoading(true);
      try {
        // Gửi email reset password qua Firebase Auth
        await auth().sendPasswordResetEmail(email);
        setLoading(false);
        Alert.alert('Email Sent', 'Please check your email to reset your password.');
        // Sau khi gửi email thành công, điều hướng đến màn hình nhập mã xác nhận
        navigation.navigate('SignIn', { email });
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Validation', 'Please enter your email.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Sử dụng Header với title và onBackPress */}
      <Header title="Send Email" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={styles.headerText}>Find your account</Text>
        <Text style={styles.subtitle}>Fill in your email to restore your account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Email'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',  // Điều chỉnh để phần nội dung nằm gần phía trên
    alignItems: 'center',
    padding: 20,
    marginTop: 30,  // Đẩy phần nội dung xuống gần dưới Header hơn
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 30,  
    width: '100%',  // Đảm bảo input đầy đủ chiều ngang
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6A432D',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 30,  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendEmailScreen;


