import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import { Colors } from '../constants/colors';

const ITEMS_PER_PAGE = 6;

function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = [];
        const snapshot = await firestore().collection('Categories').get();
        snapshot.forEach(doc => {
          categoryList.push({ id: doc.id, ...doc.data() });
        });
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const productList = [];
        const snapshot = await firestore().collection('Products').get();
        snapshot.forEach(doc => {
          productList.push({ id: doc.id, ...doc.data() });
        });
        // Sắp xếp ngẫu nhiên sản phẩm
        setProducts(shuffleArray(productList));
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  const renderIcon = (library, iconName, size, color) => {
    switch (library) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'FontAwesome':
        return <Icon name={iconName} size={size} color={color} />;
      default:
        return <Icon name="question-circle" size={size} color={color} />; // Default icon nếu không tìm thấy
    }
  };

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
        <Image source={{ uri: 'https://file.hstatic.net/200000503583/article/high-fashion-la-gi-21_15eb1f9733ae4344977098b5bdcaf03f_2048x2048.jpg' }} style={styles.bannerImage} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>New Collection</Text>
          <Text style={styles.bannerSubtitle}>Discount 50% for the first transaction</Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Category</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categories}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.category}
              onPress={() => {
                // Truyền cả title và categoryId khi điều hướng sang màn hình tiếp theo
                navigation.navigate('Category', { 
                  title: category.name, 
                  categoryId: category.categoryId  // Truyền categoryId
                });
              }}
            >
              <FontAwesome5 name={category.icon} size={24} color="brown" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>


      <View style={styles.flashSaleContainer}>
        <View style={styles.flashSaleHeader}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <Text style={styles.closingInText}>
            Closing in: <Text style={styles.closingInTime}>02:12:56</Text>
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <Text style={styles.filterText}>All</Text>
          <Text style={styles.filterText}>Woman</Text>
          <Text style={styles.filterText}>Man</Text>
          <Text style={styles.filterText}>Newest</Text>
          <Text style={styles.filterText}>Popular</Text>
        </ScrollView>
      </View>
    </View>
  );

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
      <Text style={styles.productPrice}>${item.price}</Text>
      <TouchableOpacity style={styles.wishlistIcon}>
        <Icon name="heart" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );

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
              style={[
                styles.pageButton,
                currentPage === pageNumber ? styles.activePageButton : styles.inactivePageButton,
              ]}
              onPress={() => setCurrentPage(pageNumber)}
            >
              <Text style={styles.pageButtonText}>{pageNumber}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
  seeAll: {
    color: 'brown',
    fontSize: 16,
  },
  categories: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-around',
  },
  category: {
    alignItems: 'center',
    marginRight: 20
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
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 10
  },
  filterText: {
    marginRight: 45,
    fontSize: 20,
    fontWeight: '500',
    color: '#333'
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
    marginVertical: 8
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
