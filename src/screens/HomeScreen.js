import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const ITEMS_PER_PAGE = 6;

function HomeScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState({});
  const [timeLeft, setTimeLeft] = useState(9000);
  const [currentBannerProductIndex, setCurrentBannerProductIndex] = useState(0);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    // Lấy userId từ AsyncStorage
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    const fetchTopProducts = async () => {
      try {
        const snapshot = await firestore()
          .collection('Products')
          .orderBy('sale', 'desc')
          .limit(3)
          .get();
        const topProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopProducts(topProducts);
      } catch (error) {
        console.error("Error fetching top products:", error);
      }
    };

    const fetchCategoriesAndProducts = async () => {
      const unsubscribeCategories = firestore()
        .collection('Categories')
        .where('isVisible', '==', true)
        .onSnapshot(snapshot => {
          const categoryList = [];
          snapshot.forEach(doc => {
            categoryList.push({ id: doc.id, ...doc.data() });
          });
          setCategories(categoryList);

          const validCategoryIds = categoryList.map(cat => cat.categoryId);
          const unsubscribeProducts = firestore()
            .collection('Products')
            .onSnapshot(snapshot => {
              const productList = [];
              snapshot.forEach(doc => {
                const product = { id: doc.id, ...doc.data() };
                if (validCategoryIds.includes(product.categoryId)) {
                  productList.push(product);
                }
              });
              setProducts(shuffleArray(productList));
            });

          return () => unsubscribeProducts();
        });

      return () => unsubscribeCategories();
    };

    getUserId();
    fetchTopProducts();
    fetchCategoriesAndProducts();

    // Đặt Interval để thay đổi sản phẩm banner
    const interval = setInterval(() => {
      setCurrentBannerProductIndex(prevIndex => (prevIndex + 1) % topProducts.length);
    }, 4000);

    return () => clearInterval(interval);

  }, [topProducts.length]); // UseEffect sẽ chạy lại mỗi khi topProducts thay đổi

  // Lắng nghe sự thay đổi của wishlist
  useFocusEffect(
    useCallback(() => {
      const fetchWishlist = async () => {
        if (!userId) return;
        const userDoc = await firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const currentWishlist = Array.isArray(userDoc.data().wishlist) ? userDoc.data().wishlist : [];
          const wishlistObject = {};
          currentWishlist.forEach(id => {
            wishlistObject[id] = true;
          });
          setWishlist(wishlistObject);
        }
      };
      fetchWishlist();
    }, [userId])
  );

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
        updatedWishlist = currentWishlist.filter(id => id !== productId); // Xóa sản phẩm
      } else {
        updatedWishlist = [...currentWishlist, productId]; // Thêm sản phẩm
      }

      await userRef.update({ wishlist: updatedWishlist });

      // Cập nhật wishlist trong state
      setWishlist((prevWishlist) => {
        const newWishlist = { ...prevWishlist };
        if (newWishlist[productId]) {
          delete newWishlist[productId]; // Nếu đã có thì xóa
        } else {
          newWishlist[productId] = true; // Nếu chưa có thì thêm
        }
        return newWishlist;
      });
    } catch (error) {
      console.error("Error updating wishlist: ", error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          // Reset to 2:30:00 (9000 seconds) when timer reaches 0
          return 9000;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000); // Decrease the timer every second

    // Cleanup the interval when component unmounts
    return () => clearInterval(timer);
  }, []);

  // Shuffle danh sách sản phẩm (ngẫu nhiên)
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationInnerContainer}>
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <TouchableOpacity
              key={pageNumber}
              style={[styles.pageButton, currentPage === pageNumber ? styles.activePageButton : styles.inactivePageButton]}
              onPress={() => setCurrentPage(pageNumber)}
            >
              <Text style={styles.pageButtonText}>{pageNumber}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchAndFilterContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search" onPress={() => navigation.navigate('Search')} />
        </View>
        <Icon name="bell" size={24} color="brown" style={styles.icon} onPress={() => navigation.navigate('Notification')} />
      </View>
  
      <View style={styles.bannerContainer}>
        {topProducts.length > 0 && topProducts[currentBannerProductIndex] && (
          <>
            <Image source={{ uri: topProducts[currentBannerProductIndex].image }} style={styles.bannerImage} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>{topProducts[currentBannerProductIndex].name}</Text>
              <Text style={styles.bannerSubtitle}>Best selling product</Text>
              <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => navigation.navigate('ProductDetail', { productId: topProducts[currentBannerProductIndex].id })}
              >
                <Text style={styles.shopNowText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
  
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Category</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.category}
              onPress={() => {
                navigation.navigate('Category', {
                  title: category.name,
                  categoryId: category.categoryId
                });
              }}
            >
              <FontAwesome5 name={category.icon} size={24} color="brown" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
  
      <View style={styles.flashSaleContainer}>
        <View style={styles.flashSaleHeader}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <Text style={styles.closingInText}>
            Closing in: <Text style={styles.closingInTime}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.productInfo}>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="orange" />
          <Text style={styles.productRatingText}>{item.rating}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.wishlistIcon}
        onPress={() => toggleWishlist(item.id)}>
        <Icon name="heart" size={20} color={wishlist[item.id] ? 'brown' : 'gray'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={currentProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        numColumns={2}
      />
      {renderPagination()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    marginBottom: 72,
  },
  paginationInnerContainer: {
    flexDirection: 'row',
  },
  pageButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activePageButton: {
    backgroundColor: Colors.Brown,
  },
  inactivePageButton: {
    backgroundColor: 'white',
  },
  pageButtonText: {
    color: 'black',
  },
  icon: {
    marginLeft: 15
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 8
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    flex: 1,
    elevation: 2
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
  },
  bannerContainer: {
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden'
  },
  bannerImage: {
    width: '100%',
    height: 200
  },
  bannerTextContainer: {
    padding: 16,
    backgroundColor: '#fff'
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#888'
  },
  shopNowButton: {
    backgroundColor: 'brown',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginTop: 10
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16
  },
  categoryContainer: {
    margin: 16
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red'
  },
  categories: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  category: {
    alignItems: 'center',
    width: 70,
    marginHorizontal: 10,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold'
  },
  flashSaleContainer: {
    margin: 16
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closingInText: {
    fontSize: 14,
    color: '#555'
  },
  closingInTime: {
    color: 'red',
    fontWeight: 'bold'
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
    fontSize: 19,
    marginVertical: 8,
    color: "black",
    fontWeight: "bold"
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
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

export default HomeScreen;
