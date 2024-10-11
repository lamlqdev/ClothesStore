import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import searchClient from '../algoliaConfig';  // Cấu hình Algolia Client

const SearchResultsScreen = ({ route, navigation }) => {
  const {
    searchQuery,
    selectedGender = 'All',
    selectedRating = 'All',
    minPrice = 0,
    maxPrice = 10000000,
    sortingOption = 'latest', // Giá trị mặc định cho sắp xếp
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      try {
        // Tạo index Algolia
        let index = searchClient.initIndex('Products'); // Index chính

        // Áp dụng sắp xếp theo sortingOption
        switch (sortingOption) {
          case 'sales':
            index = searchClient.initIndex('Products_sales_desc'); // Replica: sắp xếp theo lượt bán giảm dần
            break;
          case 'priceLowToHigh':
            index = searchClient.initIndex('Products_price_asc'); // Replica: sắp xếp giá từ thấp đến cao
            break;
          case 'priceHighToLow':
            index = searchClient.initIndex('Products_price_desc'); // Replica: sắp xếp giá từ cao đến thấp
            break;
          case 'latest':
          default:
            index = searchClient.initIndex('Products_createdAt_desc'); // Replica: sắp xếp theo thời gian mới nhất
            break;
        }

        // Bộ lọc giới tính
        const genderFilter = selectedGender !== 'All' ? `gender:${selectedGender}` : '';

        // Bộ lọc đánh giá
        let ratingFilter = '';
        if (selectedRating !== 'All') {
          const ratingParts = selectedRating.split(' ');
          const ratingMin = parseFloat(ratingParts[0]);
          ratingFilter = `rating >= ${ratingMin}`;
        }

        // Bộ lọc giá
        let priceFilter = '';
        if (minPrice !== null && maxPrice !== null) {
          priceFilter = `price >= ${minPrice} AND price <= ${maxPrice}`;
        }

        // Tổng hợp các bộ lọc
        const filters = [genderFilter, ratingFilter, priceFilter].filter(Boolean).join(' AND ');

        // Thực hiện tìm kiếm với từ khóa và các bộ lọc
        const searchResponse = await index.search(searchQuery, {
          filters, // Áp dụng bộ lọc
        });

        setProducts(searchResponse.hits); // Cập nhật danh sách sản phẩm đã lọc
      } catch (error) {
        console.error('Error searching products: ', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery, selectedGender, selectedRating, minPrice, maxPrice, sortingOption]);

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
            sortingOption, // Truyền sortingOption sang màn hình Filter
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
          )}
          keyExtractor={item => item.objectID} // Algolia sử dụng objectID
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


