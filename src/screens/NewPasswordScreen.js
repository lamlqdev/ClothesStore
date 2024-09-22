import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // State để theo dõi trạng thái hiển thị mật khẩu
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // State cho confirm password

  const navigation = useNavigation();

  // Cấu hình header để chỉ có nút back, không có tiêu đề
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",  // Ẩn tiêu đề
    });
  }, [navigation]);

  const handleCreatePassword = () => {
    if (password !== confirmPassword) {
      console.log('Passwords do not match.');
    } else {
      console.log('Password set successfully.');
      // Further actions here
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>New Password</Text>
      {/* Nội dung */}
      <Text style={styles.subText}>
        Your new password must be different from previously used passwords.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}  // Ẩn/hiện mật khẩu dựa vào trạng thái
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={toggleShowPassword}>
          <Image
            source={showPassword
              ? require('../../assets/icons/ic_openeye.png')  // Biểu tượng mắt mở
              : require('../../assets/icons/ic_blindeye.png')}  // Biểu tượng mắt đóng
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showConfirmPassword}  // Ẩn/hiện xác nhận mật khẩu dựa vào trạng thái
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={toggleShowConfirmPassword}>
          <Image
            source={showConfirmPassword
              ? require('../../assets/icons/ic_openeye.png')  // Biểu tượng mắt mở
              : require('../../assets/icons/ic_blindeye.png')}  // Biểu tượng mắt đóng
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
