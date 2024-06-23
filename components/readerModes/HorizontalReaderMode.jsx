import React, { useCallback, useRef } from 'react';
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import { stackTransition, Gallery, GalleryType } from 'react-native-zoom-toolkit';
import ChapterPage from '../ChapterPage';
import * as NavigationBar from 'expo-navigation-bar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HorizontalReaderMode = ({chapterUrls, inverted, onTap}) => {
  const ref = useRef(null);

  const renderItem = useCallback((item, index) => {
    return (
      <View className="">
        <ChapterPage pageUrl={item}/>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item, index) => {
    return `${item}-${index}`;
  }, []);

  const transition = useCallback(stackTransition, []);

  return (
    <View className="h-full w-full">
      <Gallery
        ref={ref}
        initialIndex={inverted ? chapterUrls.length - 1 : 0}
        data={inverted ? [...chapterUrls].reverse() : chapterUrls}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onTap={onTap}
        customTransition={transition}
        onEndReached={()=>{
          console.log('end')
        }}
        allowPinchPanning={false}
        onIndexChange={()=>{
          NavigationBar.setVisibilityAsync('hidden')
        }}
      />
    </View>
  );
};

export default HorizontalReaderMode;