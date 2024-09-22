import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const AddProduct = ({ navigation }) => {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [image, setImage] = React.useState('');

  const handleAddProduct = async () => {
    try {
      const productRef = await firestore().collection('Products').add({
        name,
        price: parseFloat(price),
        description,
        categoryId,
        image,
        createdAt: new Date(),
      });

      await productRef.update({
        productId: productRef.id,
      });

      console.log('Product added with ID: ', productRef.id);
      navigation.navigate('ProductList');
    } catch (error) {
      console.error('Error adding product: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput placeholder="Category ID" value={categoryId} onChangeText={setCategoryId} />
      <TextInput placeholder="Image URL" value={image} onChangeText={setImage} />
      <Button title="Add Product" onPress={handleAddProduct} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default AddProduct;
