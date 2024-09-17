import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const snapshot = await firestore().collection('Products').get();
    const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(productsList);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleEdit = (productId) => {
    navigation.navigate('EditProduct', { productId });
  };

  const handleDelete = async (productId) => {
    await firestore().collection('Products').doc(productId).delete();
    setProducts(products.filter(product => product.id !== productId));
  };

  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.productImage} /> : null}
      <Text style={styles.productName}>Name: {item.name}</Text>
      <Text style={styles.productDetail}>Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.productDetail}>Description: {item.description}</Text>
      <Text style={styles.productDetail}>Category ID: {item.categoryId}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => handleEdit(item.id)} />
        <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <Button title="Add Product" onPress={() => navigation.navigate('AddProduct')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  productContainer: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default ProductList;
