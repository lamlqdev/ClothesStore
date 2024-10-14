import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import searchClient from '../algoliaConfig';  // Cấu hình Algolia Client
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const SearchResultsScreen = ({ route, navigation }) => {
  const {
    searchQuery,
    selectedGender = 'All',
    selectedRating = null,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,  // Sử dụng giá trị lớn nhất có thể
    sortingOption = 'latest',
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

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

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
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
          const ratingParts = selectedRating.split(' ');
          const ratingMin = parseFloat(ratingParts[0]);
          const ratingMax = ratingMin === 4.0 ? ratingMin + 0.5 : ratingMin + 1;
          ratingFilter = `rating >= ${ratingMin} AND rating <= ${ratingMax}`;
        }

        let priceFilter = '';
        if (!(minPrice === 0 && maxPrice === Number.MAX_SAFE_INTEGER)) {
          priceFilter = `price >= ${minPrice} AND price <= ${maxPrice}`;
        }

        const filters = [genderFilter, ratingFilter, priceFilter].filter(Boolean).join(' AND ');

        const searchResponse = await index.search(searchQuery, { filters });
        setProducts(searchResponse.hits);
      } catch (error) {
        console.error('Error searching products: ', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery, selectedGender, selectedRating, minPrice, maxPrice, sortingOption]);


  // Hàm thêm/xóa sản phẩm khỏi danh sách yêu thích
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

      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <View style={styles.container}>
      <Header title="Search Results" onBackPress={() => navigation.goBack()} />

      <View style={styles.searchRow}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search" size={20} color="#A9A9A9" />
          <TextInput
            placeholder={searchQuery}
            style={styles.searchInput}
            placeholderTextColor="#000"
            editable={false}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterIconContainer} 
          onPress={() => navigation.navigate('Filter', { 
            searchQuery, 
            selectedGender, 
            selectedRating,
            minPrice,
            maxPrice,
            sortingOption,
          })}
        >
          <Icon name="sliders" size={24} color="brown" />
        </TouchableOpacity>
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultText}>Results for "{searchQuery}"</Text>
        <Text style={styles.foundText}>{products.length} products found</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductDetail', { productId: item.objectID })}
              style={styles.productCard}
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
              <TouchableOpacity
                style={styles.wishlistIcon}
                onPress={() => toggleWishlist(item.objectID)}
              >
                <Icon
                  name="heart"
                  size={20}
                  color={isInWishlist(item.objectID) ? 'brown' : 'gray'}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.objectID}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      )}
    </View>
  );
};





  // StyleSheet chỉnh sửa
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 10,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: 20,
      flex: 1,  // Chiếm tối đa chiều rộng có thể
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: '#000',
    },
    filterIconContainer: {
      marginLeft: 10,  // Khoảng cách giữa thanh tìm kiếm và biểu tượng slider
      justifyContent: 'center',
    },
    resultsInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    resultText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    foundText: {
      fontSize: 16,
      color: '#A9A9A9',
    },
    productCard: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 16,
      marginRight: '2%',
      elevation: 2,
      padding: 10
    },
    productImage: {
      width: '100%',
      height: 150,
      borderRadius: 8
    },
    productName: {
      fontSize: 16,
      marginVertical: 8
    },
    productInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8
    },
    productPrice: {
      fontSize: 14,
      color: '#555'
    },
    productRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    productRatingText: {
      marginLeft: 4,
      fontSize: 14,
      color: '#555'
    },
    wishlistIcon: {
      position: 'absolute',
      top: 8,
      right: 8
    }
  });
  

export default SearchResultsScreen;


