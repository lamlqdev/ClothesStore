import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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
  const [showAllReviews, setShowAllReviews] = useState(false); // State to manage review display

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
          setSizeList(productData.sizelist || []);
        } else {
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

        const reviewsData = await Promise.all(
          reviewsSnapshot.docs.map(async (doc) => {
            const review = doc.data();
            const userSnapshot = await firestore()
              .collection('users')
              .doc(review.userId)
              .get();

            const userName = userSnapshot.exists ? userSnapshot.data().name : 'Anonymous';

            return {
              id: doc.id,
              ...review,
              userName,
              reviewTime: review.timestamp ? review.timestamp.toDate() : null,
            };
          })
        );

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
          const currentWishlist = Array.isArray(userDoc.data().wishlist)
            ? userDoc.data().wishlist
            : [];
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
      updatedWishlist.splice(updatedWishlist.indexOf(productId), 1);
    } else {
      updatedWishlist.push(productId);
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3); // Display only 3 reviews initially

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedReviews}
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
            <View style={styles.reviewHeader}>
              <Icon name="user-circle" size={20} color={Colors.Gray} style={styles.userIcon} />
              <Text style={styles.reviewUserName}>{item.userName}</Text>
            </View>

            <Text style={styles.reviewRating}>Rating: {item.rating} ★</Text>
            <Text style={styles.reviewComment}>{item.comment}</Text>

            {item.image && <Image source={{ uri: item.image }} style={styles.reviewImage} />}

            <Text style={styles.reviewTime}>
              {item.reviewTime
                ? item.reviewTime.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Unknown time'}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListFooterComponent={() => (
          <View>
            {reviews.length > 3 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllReviews(!showAllReviews)}
              >
                <Text style={styles.showMoreText}>
                  {showAllReviews ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
            {/* Thêm khoảng trống */}
            <View style={{ height: 150 }} />
          </View>
        )}        
      />
      <View style={styles.addToCartContainer}>
        <AddToCartButton productId={productId} selectedSize={selectedSize} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  showMoreButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.LightGray,
    borderRadius: 5,
    margin: 10,
  },
  showMoreText: {
    fontSize: 16,
    color: Colors.DarkGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userIcon: {
    marginRight: 8,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewRating: {
    fontSize: 14,
    color: '#F5A623',
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    marginBottom: 10,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  reviewTime: {
    fontSize: 12,
    color: Colors.Gray,
    marginTop: 5,
    textAlign: 'right',
  },
  reviewItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
  },
  addToCartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  reviewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default ProductDetail;



