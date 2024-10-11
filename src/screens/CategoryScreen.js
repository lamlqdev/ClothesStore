import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firestore

function JacketScreen({ navigation }) {
  const route = useRoute(); 
  const { title, categoryId } = route.params; // Lấy categoryId từ params

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Truy vấn Firestore để lấy các sản phẩm có categoryId khớp
        const snapshot = await firestore()
          .collection('Products')
          .where('categoryId', '==', categoryId) // Lọc theo categoryId
          .get();

        // Chuyển đổi dữ liệu từ snapshot sang array
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(fetchedProducts);
        setLoading(false); // Tắt loading khi dữ liệu đã tải xong
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]); // Chỉ chạy lại khi categoryId thay đổi

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="orange" />
          <Text style={styles.productRatingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.wishlistIcon}>
        <Icon name="heart" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Header 
        title={title} 
        onBackPress={() => navigation.goBack()} 
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.productsContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  productsContainer: {
    padding: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    marginRight: '2%',
    elevation: 2,
    padding: 10,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default JacketScreen;
