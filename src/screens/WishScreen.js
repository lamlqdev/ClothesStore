import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { spacing } from '../constants/dimensions';
import Category from '../components/Category';
import ProductCard from '../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Jacket', 'Shirt', 'Pant', 'T-Shirt', 'Dress'];

const WishScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);  // Lưu danh sách productId
  const [products, setProducts] = useState([]);  // Lưu thông tin chi tiết sản phẩm
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchWishlist = async () => {
        if (!userId) return;

        const userDoc = await firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];
          const productPromises = currentWishlist.map(async (productId) => {
            const productDoc = await firestore().collection('Products').doc(productId).get();
            return productDoc.exists ? { id: productId, ...productDoc.data() } : null;
          });
          const productList = await Promise.all(productPromises);
          setProducts(productList.filter(product => product !== null));
        }
      };

      fetchWishlist();
    }, [userId])
  );

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;

      const userRef = firestore().collection('users').doc(userId);
      try {
        const userDoc = await userRef.get();
        const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];

        // Lấy thông tin chi tiết từng sản phẩm từ Firestore dựa trên productId
        const productPromises = currentWishlist.map(async (productId) => {
          const productDoc = await firestore().collection('Products').doc(productId).get();
          return productDoc.exists ? { id: productId, ...productDoc.data() } : null;
        });

        const productList = await Promise.all(productPromises);
        setProducts(productList.filter(product => product !== null));  // Lọc bỏ sản phẩm không tồn tại

      } catch (error) {
        console.error("Error fetching wishlist: ", error);
      }
    };

    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const toggleWishlist = async (productId) => {
    if (!userId) return;

    const userRef = firestore().collection('users').doc(userId);
    try {
      const userDoc = await userRef.get();
      const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];

      // Cập nhật wishlist
      let updatedWishlist;
      if (currentWishlist.includes(productId)) {
        updatedWishlist = currentWishlist.filter(id => id !== productId); // Xóa sản phẩm
        // Cập nhật lại danh sách sản phẩm
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } else {
        updatedWishlist = [...currentWishlist, productId]; // Thêm sản phẩm
      }

      // Cập nhật wishlist trong Firestore
      await userRef.update({ wishlist: updatedWishlist });
      // Cập nhật wishlist items
      setWishlistItems(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };


  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view your wishlist.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />
      <Header title={"My wishlist"} />
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <Category
            item={item}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        keyExtractor={(item) => item}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      />

      <FlatList
        data={products}  // Hiển thị thông tin chi tiết sản phẩm
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            isWished={true}  // Vì đây là wishlist
            onWishlistToggle={() => toggleWishlist(item.id)}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        style={styles.productContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    backgroundColor: Colors.White,
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.Gray,
  },
  categoryContainer: {
    marginTop: 15,
  },
  productContainer: {
    marginTop: 15,
    marginBottom: 140,
  },
});

export default WishScreen;
