import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const DeleteProduct = ({ navigation }) => {
  const [productId, setProductId] = React.useState('');

  const handleDeleteProduct = async () => {
    try {
      await firestore().collection('Products').doc(productId).delete();
      console.log('Product deleted with ID: ', productId);
      navigation.navigate('ProductList');
    } catch (error) {
      console.error('Error deleting product: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Product ID" value={productId} onChangeText={setProductId} />
      <Button title="Delete Product" onPress={handleDeleteProduct} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default DeleteProduct;
