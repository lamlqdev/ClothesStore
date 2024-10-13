import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';


function CategoryScreen({ navigation }) {
  const route = useRoute();
  const { title, categoryId } = route.params; // Lấy categoryId từ params
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Lấy userId từ AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  // Lấy danh sách wishlist từ Firestore
  useEffect(() => {
    if (userId) {
      const fetchWishlist = async () => {
        try {
          const userRef = firestore().collection('users').doc(userId);
          const userDoc = await userRef.get();
          const currentWishlist = userDoc.exists && userDoc.data().wishlist ? userDoc.data().wishlist : [];
          setWishlist(currentWishlist);
        } catch (error) {
          console.error("Error fetching wishlist: ", error);
        }
      };

      fetchWishlist();
    }
  }, [userId]);

  // Lấy danh sách sản phẩm dựa trên categoryId
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await firestore()
          .collection('Products')
          .where('categoryId', '==', categoryId) // Lọc theo categoryId
          .get();

        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Hàm thêm/xóa sản phẩm khỏi danh sách yêu thích
  const toggleWishlist = async (productId) => {
    if (!userId) return;

    try {
      const userRef = firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      const currentWishlist = userDoc.exists && userDoc.data().wishlist ? userDoc.data().wishlist : [];

      let updatedWishlist;
      if (currentWishlist.includes(productId)) {
        // Nếu sản phẩm đã có trong wishlist, thì xóa nó
        updatedWishlist = currentWishlist.filter(id => id !== productId);
      } else {
        // Nếu sản phẩm chưa có, thì thêm vào wishlist
        updatedWishlist = [...currentWishlist, productId];
      }

      // Cập nhật Firestore với danh sách wishlist mới
      await userRef.set({ wishlist: updatedWishlist }, { merge: true });

      // Cập nhật state wishlist
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  // Kiểm tra xem sản phẩm có trong wishlist hay không
  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} // Điều hướng tới trang chi tiết sản phẩm
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.productRating}>
            <Icon name="star" size={16} color="orange" />
            <Text style={styles.productRatingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.productPrice}>${item.price}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.wishlistIcon}
        onPress={() => toggleWishlist(item.id)} // Thêm vào danh sách yêu thích
      >
        <Icon 
          name="heart" 
          size={20} 
          color={isInWishlist(item.id) ? 'brown' : 'gray'} // Đổi màu nếu sản phẩm đã có trong wishlist
        />
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

export default CategoryScreen;
