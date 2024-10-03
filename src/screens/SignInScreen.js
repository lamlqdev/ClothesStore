import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { signInWithEmailAndPassword, signInWithCredential, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth'; // Import thêm GoogleAuthProvider
import { auth, db } from '../firebaseConfig';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Import Firestore

const SignInScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cấu hình Google Sign-In
  GoogleSignin.configure({
    webClientId: '799913536954-rpaevl1jranhdvkngd9vgibpueda8k8i.apps.googleusercontent.com', 
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Kiểm tra xem email đã được xác nhận chưa
        if (user.emailVerified) {
          Alert.alert("Login Successful", `Welcome back, ${user.email}`);
          onLogin();
          navigation.navigate('HomeScreen');
        } else {
          // Nếu email chưa được xác nhận
          Alert.alert(
            "Email Not Verified", 
            "Please verify your email before logging in. Check your inbox for the verification link."
          );
          // Đăng xuất ngay lập tức để không giữ người dùng đăng nhập
          auth.signOut();
        }
      })
      .catch((error) => {
        Alert.alert("Login Failed", error.message);
      });
  };  

  const onFacebookButtonPress = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }
  
      const data = await AccessToken.getCurrentAccessToken();
  
      if (!data) {
        throw 'Something went wrong obtaining access token';
      }
  
      const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await signInWithCredential(auth, facebookCredential);
      const user = userCredential.user;
  
      // Lấy tên từ Facebook
      const name = user.displayName || "User"; // Sử dụng tên người dùng hoặc mặc định là "User"
  
      // Kiểm tra email trong Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
  
      if (!userDoc.exists()) {
        // Nếu người dùng chưa tồn tại, thêm mới vào Firestore
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          name: name,
          membershipLevel: null,  // Mã hạng thành viên ban đầu là null
          imageUrl: null,         // Hình ảnh ban đầu là null
        });
      }
  
      Alert.alert("Login Successful", `Welcome back, ${user.email}`);
      onLogin();
      navigation.navigate('HomeScreen');
  
    } catch (error) {
      Alert.alert("Facebook Login Failed", error.toString());
    }
  };
  
  const onGoogleButtonPress = async () => {
    try {
      // Đăng xuất khỏi bất kỳ phiên Google nào trước đó để yêu cầu người dùng chọn tài khoản
      await GoogleSignin.signOut();
      
      // Kiểm tra dịch vụ Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
      // Đăng nhập và yêu cầu người dùng chọn tài khoản Google
      const { idToken } = await GoogleSignin.signIn();
      
      // Tạo thông tin xác thực từ token của Google
      const googleCredential = GoogleAuthProvider.credential(idToken);
  
      // Đăng nhập vào Firebase bằng thông tin xác thực của Google
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
  
      // Lấy tên từ Google
      const name = user.displayName || "User"; // Sử dụng tên người dùng hoặc mặc định là "User"
  
      // Kiểm tra xem người dùng đã có trong Firestore chưa
      const userDoc = await getDoc(doc(db, 'users', user.uid));
  
      if (!userDoc.exists()) {
        // Nếu người dùng chưa tồn tại, thêm mới vào Firestore
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          name: name,
          membershipLevel: null,  // Mã hạng thành viên ban đầu là null
          imageUrl: null,         // Hình ảnh ban đầu là null
        });
      }
  
      Alert.alert("Login Successful", `Welcome back, ${user.email}`);
      onLogin();
      navigation.navigate('HomeScreen');
  
    } catch (error) {
      Alert.alert("Google Login Failed", error.message);
    }
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
            source={showPassword
              ? require('../../assets/icons/ic_openeye.png')
              : require('../../assets/icons/ic_blindeye.png')}
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
        <TouchableOpacity onPress={onFacebookButtonPress}>
          <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onGoogleButtonPress}>
          <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
        </TouchableOpacity>
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



