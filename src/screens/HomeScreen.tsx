import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const categories = [
  { id: 1, name: 'T-Shirt', icon: 'tshirt' },
  { id: 2, name: 'Pant', icon: 'user-tie' },
  { id: 3, name: 'Dress', icon: 'female' },
  { id: 4, name: 'Jacket', icon: 'tshirt' }
];

const products = [
  { id: 1, name: 'Brown Jacket', price: '$83.97', rating: 4.9, image: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
  { id: 2, name: 'Brown Suite', price: '$120.00', rating: 5.0, image: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
  { id: 3, name: 'Yellow Shirt', price: '$60.00', rating: 4.8, image: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
  { id: 4, name: 'Red Dress', price: '$500.00', rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf05jWbUmZSFcnHa2oJVV39tUvN-iJMpfyZw&s' }
];

function HomeScreen() {
  const navigation = useNavigation();

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
                navigation.navigate('Category', { title: category.name });
              }}>
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
      <Text style={styles.productPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.wishlistIcon}>
        <Icon name="heart" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={{ paddingBottom: 80 }}
      numColumns={2}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 16,
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
    fontWeight: 'bold'
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
    fontSize: 16,
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
    fontSize: 14,
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
