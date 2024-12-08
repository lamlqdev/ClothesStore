import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async () => {
    // Kiểm tra nếu các trường bị bỏ trống
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'All fields are required.');
      return;
    }
  
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
  
    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }
  
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      // Cập nhật tên người dùng
      await user.updateProfile({
        displayName: name,
      });
  
      // Gửi email xác nhận
      await user.sendEmailVerification();
  
      // Lưu thông tin người dùng vào Firestore
      await firestore().collection('users').doc(user.uid).set({
        userId: user.uid,
        name: name,
        membershipLevel: 'IdQr4CRJclPYYKP00bDk',
        imageUrl: 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/03/avatar-trang-68.jpg',
        wishlist: [],
        cartlist: [],
        phonelist: [],
        addresslist: [],
      });
  
      Alert.alert('Success', 'Please verify your email address.');
      navigation.navigate('SignIn');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Fill your information below or register with your social account.</Text>
      
      {/* Input fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Ô Password với nút toggle icon */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}  // Hiển thị hoặc che mật khẩu
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            source={
              showPassword
                ? require('../../assets/icons/ic_openeye.png')  // Icon mắt mở (eye2)
                : require('../../assets/icons/ic_blindeye.png')  // Icon mắt đóng (eye1)
            }
            style={styles.eyeIconStyle}
          />
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Or sign up with */}
      <Text style={styles.orText}>Or sign up with</Text>
      
      <View style={styles.socialMediaContainer}>
        <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
        <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
      </View>

      {/* Already have an account? Sign In */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
    borderRadius: 30,  
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIconStyle: {
    width: 25,
    height: 25,
  },
  button: {
    backgroundColor: '#6A432D',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 30,  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 20,
  },
  socialIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  signInContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
    fontSize: 16,
    color: '#6A432D',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
