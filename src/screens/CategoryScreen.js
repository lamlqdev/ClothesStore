import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import { useRoute } from '@react-navigation/native';
import searchClient from '../algoliaConfig'; // Sử dụng cấu hình Algolia
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

function CategoryScreen({ navigation }) {
  const route = useRoute();
  const {
    title,
    categoryId,
    selectedGender = 'All',
    selectedRating = null,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    sortingOption = 'latest',
  } = route.params;

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
          setWishlist(currentWishlist); // Lưu danh sách wishlist vào state
        } catch (error) {
          console.error("Error fetching wishlist: ", error);
        }
      };
      fetchWishlist();
    }
  }, [userId]);

  // Fetch sản phẩm từ Algolia và áp dụng bộ lọc
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let index = searchClient.initIndex('Products');

        switch (sortingOption) {
          case 'sales':
            index = searchClient.initIndex('Products_sales_desc');
            break;
          case 'priceLowToHigh':
            index = searchClient.initIndex('Products_price_asc');
            break;
          case 'priceHighToLow':
            index = searchClient.initIndex('Products_price_desc');
            break;
          case 'latest':
          default:
            index = searchClient.initIndex('Products_createdAt_desc');
            break;
        }

        const genderFilter = selectedGender !== 'All' ? `gender:${selectedGender}` : '';

        let ratingFilter = '';
        if (selectedRating !== null) {
          const ratingMin = parseFloat(selectedRating);
          const ratingMax = ratingMin === 4.0 ? ratingMin + 0.5 : ratingMin + 1;
          ratingFilter = `rating >= ${ratingMin} AND rating < ${ratingMax}`;
        }

        let priceFilter = '';
        if (minPrice !== null && maxPrice !== null) {
          priceFilter = `price >= ${minPrice} AND price <= ${maxPrice}`;
        }

        const categoryFilter = categoryId ? `categoryId:"${categoryId}"` : '';        const filters = [categoryFilter, genderFilter, ratingFilter, priceFilter].filter(Boolean).join(' AND ');
        const result = await index.search('', { filters });

        console.log('Products found:', result.hits);
        setProducts(result.hits);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products from Algolia: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, selectedGender, selectedRating, minPrice, maxPrice, sortingOption]);

  // Thêm hoặc xóa sản phẩm khỏi wishlist
  const toggleWishlist = async (productId) => {
    if (!userId) {
      console.error("User ID not found!");
      return;
    }

    const userRef = firestore().collection('users').doc(userId);
    try {
      const userDoc = await userRef.get();
      const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];

      let updatedWishlist;
      if (currentWishlist.includes(productId)) {
        updatedWishlist = currentWishlist.filter(id => id !== productId);
      } else {
        updatedWishlist = [...currentWishlist, productId];
      }

      await userRef.update({ wishlist: updatedWishlist });
      setWishlist(updatedWishlist); // Cập nhật lại state wishlist
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  // Kiểm tra xem sản phẩm có trong danh sách wishlist không
  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.objectID })}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productInfo}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <View style={styles.productRating}>
            <Icon name="star" size={16} color="orange" />
            <Text style={styles.productRatingText}>{item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Biểu tượng wishlist trái tim */}
      <TouchableOpacity
        style={styles.wishlistIcon}
        onPress={() => toggleWishlist(item.objectID)}
      >
        <Icon
          name="heart"
          size={20}
          color={isInWishlist(item.objectID) ? 'brown' : 'gray'} // Đổi màu nếu sản phẩm đã có trong wishlist
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Header title={title} onBackPress={() => navigation.goBack()} />
      <TouchableOpacity
        style={styles.filterIconContainer} // Cập nhật style
        onPress={() => navigation.navigate('FilterCategory', {
          title,
          categoryId,
          selectedGender,
          selectedRating,
          minPrice,
          maxPrice,
          sortingOption,
        })}
      >
        <Icon name="sliders" size={24} color="brown" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.objectID.toString()}
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
  filterIconContainer: {
    position: 'absolute',
    top: 10,
    right: 16, // Chuyển icon sang phải
    zIndex: 1,
  },
});

export default CategoryScreen;