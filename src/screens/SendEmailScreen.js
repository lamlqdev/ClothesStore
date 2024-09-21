import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const SendEmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  // Ẩn tiêu đề của thanh điều hướng khi màn hình được mở
  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',  // Xóa tiêu đề
    });
  }, [navigation]);

  const handleNext = () => {
    if (email) {
      // Điều hướng sang màn hình Verify Code và truyền email
      navigation.navigate('VerifyCode', { email });
    } else {
      console.log('Vui lòng nhập email');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Find your account</Text>
      <Text style={styles.subtitle}>Fill in your email to restore your account</Text>
      <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Send Email</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 30,  
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
    marginBottom: 30,
    borderRadius: 30,  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendEmailScreen;

