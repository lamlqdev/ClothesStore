import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import Header from '../components/Header';

const FilterCategoryScreen = ({ route, navigation }) => {
  const {
    title,
    categoryId,
    selectedGender: initialGender = 'All', 
    selectedRating: initialRating = null, 
    minPrice: initialMinPrice = 0, 
    maxPrice: initialMaxPrice = Number.MAX_SAFE_INTEGER,  // Sử dụng Number.MAX_SAFE_INTEGER
    sortingOption: initialSortingOption = 'latest',
  } = route.params || {};

  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [minPrice, setMinPrice] = useState(
    initialMinPrice === 0 ? '' : initialMinPrice.toString() // Ẩn khi minPrice là 0
  );
  const [maxPrice, setMaxPrice] = useState(
    initialMaxPrice === Number.MAX_SAFE_INTEGER ? '' : initialMaxPrice.toString() // Ẩn khi maxPrice là Number.MAX_SAFE_INTEGER
  );
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [selectedSortingOption, setSelectedSortingOption] = useState(initialSortingOption);

  const genders = ['All', 'Male', 'Female', 'Unisex', 'Child'];
  const reviewRatings = [
    { label: '4.5 and above', value: '4.5' },
    { label: '4.0 - 4.5', value: '4.0' },
    { label: '3.0 - 4.0', value: '3.0' },
    { label: '2.0 - 3.0', value: '2.0' },
    { label: '1.0 - 2.0', value: '1.0' },
  ];

  const sortingOptions = [
    { label: 'Sort by Sales', value: 'sales' },
    { label: 'Latest', value: 'latest' },
    { label: 'Price: Low to High', value: 'priceLowToHigh' },
    { label: 'Price: High to Low', value: 'priceHighToLow' },
  ];

  const renderOptions = (options, selectedOption, onSelect) => {
    return options.map(option => (
      <TouchableOpacity
        key={option}
        style={[styles.optionButton, selectedOption === option && styles.selectedOption]}
        onPress={() => onSelect(option)}
      >
        <Text style={[styles.optionText, selectedOption === option && styles.selectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderSortingOptions = () => {
    return sortingOptions.map(option => (
      <TouchableOpacity
        key={option.value}
        style={[styles.optionButton, selectedSortingOption === option.value && styles.selectedOption]}
        onPress={() => setSelectedSortingOption(option.value)}
      >
        <Text style={[styles.optionText, selectedSortingOption === option.value && styles.selectedText]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderRatings = () => {
    return reviewRatings.map(rating => (
      <TouchableOpacity
        key={rating.value}
        style={styles.ratingOption}
        onPress={() => setSelectedRating(rating.value)}
      >
        <View style={styles.ratingStars}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Text key={index} style={styles.star}>
              {index < Math.round(parseFloat(rating.value)) ? '★' : '☆'}
            </Text>
          ))}
        </View>
        <Text style={styles.ratingLabel}>{rating.label}</Text>
        <View style={styles.radioCircle}>
          {selectedRating === rating.value && <View style={styles.selectedRadioCircle} />}
        </View>
      </TouchableOpacity>
    ));
  };

  const sections = [
    { type: 'header' },
    { type: 'gender' },
    { type: 'sorting' },
    { type: 'price' },
    { type: 'reviews' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <Header 
            title="Filter" 
            onBackPress={() => navigation.goBack()} 
          />
        );
      case 'gender':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.optionsRow}>
              {renderOptions(genders, selectedGender, setSelectedGender)}
            </View>
          </View>
        );
      case 'sorting':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsRow}>
              {renderSortingOptions()}
            </View>
          </View>
        );
      case 'price':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min price"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={(text) => setMinPrice(text)}
              />
              <Text style={styles.toText}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max price"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={(text) => setMaxPrice(text)}
              />
            </View>
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {renderRatings()}
          </View>
        );
      default:
        return null;
    }
  };

  const applyFilters = () => {
    const min = Number(minPrice) || 0; // Gán giá trị 0 nếu ô trống
    const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER; // Gán giá trị Number.MAX_SAFE_INTEGER nếu ô trống

    // Kiểm tra giá trị hợp lệ
    if (min < 0 || max < 0 || max <= min) {
      Alert.alert('Invalid input', 'Please enter a valid price range.');
      return;
    }

    // Điều hướng tới màn hình kết quả
    navigation.navigate('Category', {
      title,
      categoryId,
      selectedGender,
      minPrice: min,
      maxPrice: max,
      selectedRating,
      sortingOption: selectedSortingOption,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={() => {
          setSelectedGender('All');
          setMinPrice('');
          setMaxPrice('');
          setSelectedRating(null);
          setSelectedSortingOption('latest');
        }}>
          <Text style={[styles.buttonText, styles.resetButtonText]}>Reset Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.applyButton]}
          onPress={applyFilters}
        >
          <Text style={[styles.buttonText, styles.applyButtonText]}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchQueryText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#7B3E19',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  toText: {
    fontSize: 16,
    color: '#000',
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    fontSize: 24,
    color: '#FFD700',
  },
  ratingLabel: {
    flex: 1,
    fontSize: 16,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#7B3E19',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#7B3E19',
  },
  applyButtonText: {
    color: '#fff',
  },
});

export default FilterCategoryScreen;
