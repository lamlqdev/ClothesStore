import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header'; // Import Header

const SearchResultsScreen = ({ route, navigation }) => {
  // Nhận tham số được truyền từ màn hình SearchScreen
  const { query } = route.params;

  // Mảng dữ liệu sản phẩm (giả lập)
  const products = [
    { id: 1, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
    { id: 2, name: 'Brown Suite', price: '$120.00', rating: 5.0, image: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
    { id: 3, name: 'Yellow Shirt', price: '$60.00', rating: 4.8, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
    { id: 4, name: 'Red Dress', price: '$500.00', rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf05jWbUmZSFcnHa2oJVV39tUvN-iJMpfyZw&s' }
  ];

  return (
    <View style={styles.container}>
      {/* Sử dụng Header */}
      <Header 
        title="Search" 
        onBackPress={() => navigation.goBack()} // Quay lại màn hình trước đó
      />

      {/* Thanh tìm kiếm (giả lập) */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')} // Điều hướng quay lại trang tìm kiếm
      >
        <Icon name="search" size={20} color="#A9A9A9" />
        <TextInput
          placeholder={query} // Hiển thị từ khóa đã tìm kiếm
          style={styles.searchInput}
          placeholderTextColor="#000"
          editable={false} // Ngăn không cho chỉnh sửa
        />
      </TouchableOpacity>

      {/* Thông tin kết quả tìm kiếm */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultText}>Result for "{query}"</Text>
        <Text style={styles.foundText}>6,245 founds</Text>
      </View>

      {/* Danh sách sản phẩm */}
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
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.wishlistIcon}>
              <Icon name="heart" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    </View>
  );
};

// StyleSheet cho màn hình
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
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


