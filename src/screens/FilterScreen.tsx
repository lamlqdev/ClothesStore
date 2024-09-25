import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Header from '../components/Header'; // Sử dụng Header từ file bên ngoài

const FilterScreen = ({ navigation }) => {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedRating, setSelectedRating] = useState('4.5 and above');

  const brands = ['All', 'Nike', 'Adidas', 'Puma'];
  const genders = ['All', 'Men', 'Women'];
  const sortOptions = ['Most Recent', 'Popular', 'Price High'];
  const reviewRatings = [
    { label: '4.5 and above', value: '4.5 and above' },
    { label: '4.0 - 4.5', value: '4.0 - 4.5' },
    { label: '3.0 - 4.0', value: '3.0 - 4.0' },
    { label: '2.0 - 3.0', value: '2.0 - 3.0' },
    { label: '1.0 - 2.0', value: '1.0 - 2.0' },
    { label: '0.0 - 1.0', value: '0.0 - 1.0' },
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
              {index < parseFloat(rating.value) ? '★' : '☆'}
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

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <Header 
            title="Filter" // Tiêu đề của header
            onBackPress={() => navigation.goBack()} // Hàm gọi lại khi nhấn nút quay lại
          />
        );
      case 'brands':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brands</Text>
            <View style={styles.optionsRow}>
              {renderOptions(brands, selectedBrand, setSelectedBrand)}
            </View>
          </View>
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
      case 'sort':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <View style={styles.optionsRow}>
              {renderOptions(sortOptions, selectedSort, setSelectedSort)}
            </View>
          </View>
        );
      case 'price':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Range</Text>
            <MultiSlider
              values={[priceRange[0], priceRange[1]]}
              min={0}
              max={2000000}
              step={100000}
              selectedStyle={{ backgroundColor: '#7B3E19' }}
              unselectedStyle={{ backgroundColor: '#E0E0E0' }}
              onValuesChange={values => setPriceRange(values)}
              sliderLength={320}
              containerStyle={{ marginLeft: 20 }} // Thêm khoảng cách cho slider
            />
            <View style={styles.priceRange}>
              <Text>{priceRange[0].toLocaleString()} VND</Text>
              <Text>{priceRange[1] >= 2000000 ? '2,000,000+' : priceRange[1].toLocaleString()} VND</Text>
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

  const sections = [
    { type: 'header' },
    { type: 'brands' },
    { type: 'gender' },
    { type: 'sort' },
    { type: 'price' },
    { type: 'reviews' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // Tạo khoảng cách cho phần nút
        showsVerticalScrollIndicator={false}
      />

      {/* Nút Reset Filter và Apply */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={() => console.log('Reset Filter')}>
          <Text style={[styles.buttonText, styles.resetButtonText]}>Reset Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={() => console.log('Apply')}>
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
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    justifyContent: 'space-between', // Căn đều hai bên
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1, // Chia đều chiều rộng của các nút
    paddingVertical: 15,
    marginHorizontal: 10, // Tạo khoảng cách giữa các nút
    borderRadius: 30,
    alignItems: 'center', // Căn giữa nội dung trong nút
  },
  resetButton: {
    backgroundColor: '#f0f0f0', // Màu nền của nút Reset
  },
  applyButton: {
    backgroundColor: '#7B3E19', // Màu nền của nút Apply
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#7B3E19', // Màu chữ của nút Reset trùng với màu của nút Apply
  },
  applyButtonText: {
    color: '#fff', // Màu chữ trắng cho nút Apply
  },
});

export default FilterScreen;








