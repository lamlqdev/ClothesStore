import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const SignInScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = () => {
    onLogin();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Hi! Welcome back, you've been missed</Text>
      
      <View style={styles.inputContainer}>
        <Image source={require('../../assets/icons/ic_profile.png')} style={styles.iconStyle} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Image source={require('../../assets/icons/key.png')} style={styles.iconStyle} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            source={
              showPassword
                ? require('../../assets/icons/ic_openeye.png')
                : require('../../assets/icons/ic_blindeye.png')
            }
            style={styles.eyeIconStyle}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.forgotPasswordContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SendEmail')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.signinwith}>Or sign in with?</Text>

      <View style={styles.socialMediaContainer}>
        <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
        <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 10,
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
    marginBottom: 30,
    borderRadius: 30,  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPassword: {
    color: '#0000FF',
    textDecorationLine: 'underline',
  },
  signinwith: {
    marginBottom: 20,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  socialIcon: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#6A432D', 
    textDecorationLine: 'underline',
  },
});

export default SignInScreen;


