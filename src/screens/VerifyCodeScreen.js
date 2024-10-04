import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../components/Header';

const VerifyCodeScreen = ({ route, navigation }) => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleChangeText = (value) => {
    if (value.length <= 4) {
      setCode(value);
    }
  };

  const handleVerify = () => {
    const { verificationCode } = route.params;
    if (code === verificationCode) {
      console.log('Code verified successfully');
      navigation.navigate('NewPassword');
    } else {
      console.log('Invalid code');
    }
  };

  const resendCode = () => {
    console.log('Resend code');
  };

  return (
    <View style={styles.container} onTouchStart={() => inputRef.current.focus()}>
      <Header title="Verify Code" onBackPress={() => navigation.goBack()} />
      <Text style={styles.headerText}>Verify Code</Text>
      <Text style={styles.subText}>Please enter the code we just sent to</Text>
      <Text style={styles.emailText}>{email}</Text>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="numeric"
        maxLength={4}
        value={code}
        onChangeText={handleChangeText}
        autoFocus={true}
      />

      <View style={styles.codeContainer}>
        {Array(4).fill('').map((_, index) => (
          <View key={index} style={styles.inputBox}>
            <Text style={styles.inputText}>{code[index] || ''}</Text>
          </View>
        ))}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive OTP? </Text>
        <TouchableOpacity onPress={resendCode}>
          <Text style={styles.resendLink}>Resend code</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    color: '#7D7D7D',
    textAlign: 'center',
    marginBottom: 10, // Giảm khoảng cách sau đoạn văn bản này
  },
  emailText: {
    fontSize: 16,
    color: '#6A432D', // Đổi màu chữ của email
    textAlign: 'center',
    marginBottom: 30, // Khoảng cách sau email
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  inputText: {
    fontSize: 24,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#666',
  },
  resendLink: {
    fontSize: 16,
    color: '#6A432D',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#6F4E37',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VerifyCodeScreen;

