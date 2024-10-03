import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker'; 
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const ReviewInput = () => {
  const [imageUri, setImageUri] = useState(null); 

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to select photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri; 
        setImageUri(uri); 
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add detailed review</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter here"
      />

      <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
        <Icon name="camera" size={24} color={Colors.Brown} />
        <Text style={styles.addPhotoText}>add photo</Text>
      </TouchableOpacity>
      
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.imagePreview}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.interBold,
    color: Colors.Black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 100,
    padding: 10,
    textAlignVertical: 'top',
  },
  addPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addPhotoText: {
    marginLeft: 10,
    fontFamily: Fonts.interRegular,
    color: Colors.Brown,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default ReviewInput;
