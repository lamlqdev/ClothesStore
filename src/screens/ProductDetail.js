import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import Slider from '../components/Slider';
import ProductInfor from '../components/ProductInfor';
import SelectSize from '../components/SizeSelector';
import AddToCartButton from '../components/AddToCart';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetail = ({ route, navigation }) => {
  const { productId } = route.params;
  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeList, setSizeList] = useState([]);
  const [reviews, setReviews] = useState([]);
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
          const productData = productSnapshot.data();
          setProduct(productData);
          setSizeList(productData.sizelist || []); // cập nhật sizeList
        }
        else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewsSnapshot = await firestore()
          .collection('Reviews')
          .where('productId', '==', productId)
          .get();

        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
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
    fetchReviews();
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
    <FlatList
      style={styles.container}
      data={reviews}
      ListHeaderComponent={() => (
        <>
          {product && (
            <>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <Slider
                images={product.images || []}
                productId={productId}
                isWished={wishlist.includes(productId)}
                toggleWishlist={toggleWishlist}
              />
              <ProductInfor product={product} />
              <Text style={styles.productPrice}>${product.price}</Text>

              <SelectSize productId={productId} sizelist={sizeList} onSelectSize={setSelectedSize} />
              <Text style={styles.reviewHeader}>Reviews:</Text>
            </>
          )}
        </>
      )}
      renderItem={({ item }) => (
        <View style={styles.reviewItem}>
          <Text style={styles.reviewText}>Rating: {item.rating} ★</Text>
          <Text style={styles.reviewText}>{item.comment}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
      ListFooterComponent={() => (
        <View style={styles.addToCartContainer}>
          <AddToCartButton productId={productId} selectedSize={selectedSize} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  reviewItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
  },
  reviewText: {
    fontSize: 16,
  },
  addToCartContainer: {
    backgroundColor: Colors.White,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.LightGray,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginVertical: 10,
  },
});

export default ProductDetail;
