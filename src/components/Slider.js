import { Animated, FlatList, StyleSheet, View } from 'react-native';
import React, { useRef, useState } from 'react';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import HeaderProductDetail from './HeaderProductDetail';

const images = [
    {
      id: 1,
      url: 'https://vaydamcongsodep.com/wp-content/uploads/2019/10/01f263515db9cfc5160095d660a338ba.jpg',
    },
    {
      id: 2,
      url: 'https://vaydamcongsodep.com/wp-content/uploads/2019/10/01f263515db9cfc5160095d660a338ba.jpg',
    },
    {
      id: 3,
      url: 'https://vaydamcongsodep.com/wp-content/uploads/2019/10/01f263515db9cfc5160095d660a338ba.jpg',
    },
    {
      id: 4,
      url: 'https://vaydamcongsodep.com/wp-content/uploads/2019/10/01f263515db9cfc5160095d660a338ba.jpg',
    },
    {
      id: 5,
      url: 'https://vaydamcongsodep.com/wp-content/uploads/2019/10/01f263515db9cfc5160095d660a338ba.jpg',
    },
  ];

const Slider = () => {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleonViewableItemsChanged = useRef(({ viewableItems }) => {
        const firstItem = viewableItems[0];
        if (firstItem && firstItem.index !== undefined) {
            setIndex(firstItem.index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <View>
            <HeaderProductDetail showFavoriteIcon={true}/>
            <FlatList
                data={images}
                renderItem={({ item }) => <SlideItem item={item} />}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={handleonViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                decelerationRate="fast"
            />
            <Pagination data={images} scrollX={scrollX} />
        </View>
    );
};

export default Slider;

const styles = StyleSheet.create({});
