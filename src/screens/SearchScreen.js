import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';


const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = async () => {
    if (searchText.trim()) {
      // Điều hướng đến trang kết quả tìm kiếm với từ khóa tìm kiếm
      navigation.navigate('SearchResults', { searchQuery: searchText }); 
  
      // Cập nhật lịch sử tìm kiếm
      if (!recentSearches.includes(searchText)) {
        setRecentSearches([searchText, ...recentSearches]); // Thêm vào đầu danh sách
      }
      setSearchText(''); // Xóa ô input sau khi tìm kiếm
    }
  };
  

  const handleRemoveItem = (item) => {
    setRecentSearches(recentSearches.filter((search) => search !== item));
  };

  const clearAll = () => {
    setRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      <Header title="Search" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#A9A9A9" />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#A9A9A9"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch} // Tìm kiếm khi nhấn Enter
          />
          <TouchableOpacity onPress={handleSearch}>
            <Text style={styles.searchButton}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Searches */} 
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          {recentSearches.map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <TouchableOpacity onPress={() => setSearchText(item)}>
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    flex: 1,
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

