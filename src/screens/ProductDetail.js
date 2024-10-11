import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';
import Slider from '../components/Slider';
import ProductInfor from '../components/ProductInfor';
import SelectSize from '../components/SizeSelector';
import AddToCartButton from '../components/AddToCard';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetail = ({ route, navigation }) => {
  const { productId } = route.params;
  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchProduct = async () => {
      try {
        const productSnapshot = await firestore()
          .collection('Products')
          .doc(productId)
          .get();

        if (productSnapshot.exists) {
          setProduct(productSnapshot.data());
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (!userId) return;
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(userId)
          .get();

        if (userDoc.exists) {
          const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];
          setWishlist(currentWishlist);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchUserId();
    fetchProduct();
    if (userId) {
      fetchWishlist();
    }
  }, [productId, userId]);

  const toggleWishlist = async () => {
    const updatedWishlist = [...wishlist];
    if (updatedWishlist.includes(productId)) {
      updatedWishlist.splice(updatedWishlist.indexOf(productId), 1); // Xóa sản phẩm
    } else {
      updatedWishlist.push(productId); // Thêm sản phẩm
    }

    setWishlist(updatedWishlist);

    if (userId) {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({ wishlist: updatedWishlist });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.Brown} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {product && (
        <>
          <Slider
            images={product.images || []}
            productId={productId}
            isWished={wishlist.includes(productId)}
            toggleWishlist={toggleWishlist}
          />
          <ProductInfor product={product} />
          <SelectSize productId={productId} />
          <AddToCartButton productId={productId} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
});

export default ProductDetail;
