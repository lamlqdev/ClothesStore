import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const ReviewInput = ({ onCommentChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add detailed review</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter here"
        onChangeText={onCommentChange} 
      />
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
    marginTop: 10,
  },
  addPhotoText: {
    fontFamily: Fonts.interRegular,
    color: Colors.Brown,
  },
});

export default ReviewInput;


