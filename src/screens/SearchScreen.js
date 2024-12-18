import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';

const MAX_SEARCH_HISTORY = 20;  // Giới hạn tối đa 20 từ khóa

// Hàm chuyển đổi ký tự có dấu thành không dấu
const removeVietnameseTones = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

const SearchScreen = ({ navigation }) => {
  const [userId, setUserId] = useState(null);  // Lưu trữ userId
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const user = auth.currentUser;  
      const storedHistory = await AsyncStorage.getItem('searchHistory'); // Lấy lịch sử tìm kiếm từ AsyncStorage
      if (storedHistory) {
        setRecentSearches(JSON.parse(storedHistory));
      }
      setUserId(user.uid);  // Lưu userId vào state
    };
    getData();
  }, []);  // Chỉ chạy một lần khi component được mount

  const handleSearch = async () => {
    if (searchText.trim()) {
      // Điều hướng đến trang kết quả tìm kiếm với từ khóa tìm kiếm và userId
      navigation.navigate('SearchResults', { searchQuery: searchText, userId: userId });

      // Cập nhật lịch sử tìm kiếm
      if (!recentSearches.includes(searchText)) {
        const newHistory = [searchText, ...recentSearches].slice(0, MAX_SEARCH_HISTORY); // Giữ tối đa 20 từ khóa
        setRecentSearches(newHistory);
        await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory)); // Lưu lại lịch sử tìm kiếm vào AsyncStorage
      }
      setSearchText(''); // Xóa ô input sau khi tìm kiếm
    }
  };

  // Gợi ý từ khóa dựa trên nội dung nhập vào, không phân biệt dấu và chữ hoa, chữ thường
  const getFilteredSuggestions = () => {
    if (!searchText) return [];

    const normalizedSearchText = removeVietnameseTones(searchText.toLowerCase()); // Chuẩn hóa từ khóa tìm kiếm

    return recentSearches.filter((item) => {
      const normalizedItem = removeVietnameseTones(item.toLowerCase()); // Chuẩn hóa từ khóa trong lịch sử
      return normalizedItem.includes(normalizedSearchText); // So sánh không phân biệt dấu
    });
  };

  const handleRemoveItem = async (item) => {
    const updatedHistory = recentSearches.filter((search) => search !== item);
    setRecentSearches(updatedHistory);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory)); // Cập nhật AsyncStorage
  };

  const clearAll = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem('searchHistory'); // Xóa lịch sử tìm kiếm trong AsyncStorage
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

      {/* Gợi ý từ khóa khi người dùng nhập */} 
      {searchText ? (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Suggestions</Text>
          <ScrollView>
            {getFilteredSuggestions().map((item, index) => (
              <TouchableOpacity key={index} onPress={() => setSearchText(item)}>
                <Text style={styles.suggestionItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

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
    fontSize: 16, // Cỡ chữ của khung tìm kiếm
  },
  searchButton: {
    color: '#007BFF',
    fontSize: 16,
    marginLeft: 10,
  },
  suggestionContainer: {
    marginHorizontal: 16,
    backgroundColor: '#F5F5F5', // Giống với khung search
    borderBottomLeftRadius: 20,  // Góc bo tròn phía dưới của phần gợi ý
    borderBottomRightRadius: 20, // Góc bo tròn phía dưới của phần gợi ý
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,  // Cỡ chữ giống với khung tìm kiếm
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentContainer: {
    marginHorizontal: 16,
    marginTop: 10,
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
    fontSize: 16,  // Cỡ chữ giống với khung tìm kiếm
  },
});


export default SearchScreen;

