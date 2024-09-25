import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'Blue Shirt',
    'CosmicChic Jacket',
    'EnchantedElegance Dress',
    'WhimsyWhirl Top',
    'Fluffernova Coat',
    'MirageMelody Cape',
    'BlossomBreeze Overalls',
    'EnchantedElegance Dress',
  ]);

  const handleRemoveItem = (item) => {
    setRecentSearches(recentSearches.filter((search) => search !== item));
  };

  const clearAll = () => {
    setRecentSearches([]);
  };

  // Điều hướng đến màn hình kết quả tìm kiếm và truyền searchText
  const handleSearch = () => {
    navigation.navigate('SearchResults', { query: searchText });
  };

  return (
    <View style={styles.container}>
      <Header title="Search" onBackPress={() => navigation.goBack()} />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A9A9A9" />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor="#A9A9A9"
          value={searchText}
          onChangeText={setSearchText} // Cập nhật searchText khi nhập liệu
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.searchButton}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          {recentSearches.map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <Text style={styles.itemText}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                <Icon name="times-circle" size={20} color="#A9A9A9" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
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
  },
  searchButton: {
    color: '#007BFF',
    fontSize: 16,
    marginLeft: 10,
  },
  recentContainer: {
    marginHorizontal: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemText: {
    fontSize: 16,
  },
});

export default SearchScreen;
