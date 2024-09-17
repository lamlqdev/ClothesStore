import React from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EditProduct = ({ route, navigation }) => {
  const { productId } = route.params;

  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [image, setImage] = React.useState('');

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await firestore().collection('Products').doc(productId).get();
        const productData = productDoc.data();
        if (productData) {
          setName(productData.name);
          setPrice(productData.price.toString());
          setDescription(productData.description);
          setCategoryId(productData.categoryId);
          setImage(productData.image);
        } else {
          Alert.alert('Error', 'Product not found.');
        }
      } catch (error) {
        console.error('Error fetching product: ', error);
        Alert.alert('Error', 'Error fetching product data.');
      }
    };

    fetchProduct();
  }, [productId]);

  const handleEditProduct = async () => {
    try {
      await firestore().collection('Products').doc(productId).update({
        name,
        price: parseFloat(price),
        description,
        categoryId,
        image,
      });
      Alert.alert('Success', 'Product updated successfully.');
      navigation.navigate('ProductList');
    } catch (error) {
      console.error('Error updating product: ', error);
      Alert.alert('Error', 'Error updating product data.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput placeholder="Category ID" value={categoryId} onChangeText={setCategoryId} />
      <TextInput placeholder="Image URL" value={image} onChangeText={setImage} />
      <Button title="Update Product" onPress={handleEditProduct} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default EditProduct;
