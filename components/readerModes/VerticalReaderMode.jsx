import { BackHandler, FlatList, PixelRatio, TouchableWithoutFeedback, TouchableOpacity, View, Text } from 'react-native';
import React, { useImperativeHandle, forwardRef, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ChapterPage from '../ChapterPage';
import * as backend from "../../app/screens/_mangaReader";
import shorthash from 'shorthash';

const VerticalReaderMode = forwardRef(({ chapterUrls, onTap, currentManga, onPageChange, initialScrollIndex }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);

  const flatRef = useRef(null);
  const pagesRef = useRef([]);
  const isInteracted = useRef(false);
  const isOnSavedPage = useRef(false);

  const onScroll = useCallback(async (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    await backend.saveMangaConfigData(currentManga.manga, currentManga.chapter, { offsetY: offset });
    setScrollOffset(offset);
  }, [currentManga]);

  useImperativeHandle(ref, () => ({
    onReadmodeChange: () => {
      console.log("Read mode in ver");
    },
    retryFetch: () => {
      console.log("retrying to fetch page:", pagesRef.current[initialScrollIndex].getPageNum());
    }
  }));

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentViewableIndex = viewableItems[viewableItems.length - 1].index;
      onPageChange(currentViewableIndex);
    }
  }, [onPageChange]);

  const AsyncEffect = async () => {
    setIsLoading(true);
    const savedConfig = await backend.readMangaConfigData(currentManga.manga, currentManga.chapter);
    setScrollOffset(savedConfig ? savedConfig.offsetY : 0);
    setIsLoading(false);
  };

  useEffect(() => {
    AsyncEffect();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Cleanup any ongoing async tasks or listeners here
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <TouchableWithoutFeedback onPress={() => onTap()}>
      <View>
        <ChapterPage
          ref={(page) => { pagesRef.current[index] = page; }}
          pageUrl={item}
          pageNum={index}
          currentManga={{ ...currentManga, chapterUrls }}
        />
      </View>
    </TouchableWithoutFeedback>
  ), [chapterUrls, onTap, currentManga]);

  const keyExtractor = useCallback((item) => shorthash.unique(item), []);



  const memoizedData = useMemo(() => chapterUrls, [chapterUrls]);

  return (
    <View>
      {!isLoading && (
        <View className="h-full w-full relative">
          <FlatList
            ref={flatRef}
            data={memoizedData}
            renderItem={renderItem}
            initialScrollIndex={initialScrollIndex}
            keyExtractor={(item) => { return shorthash.unique(item)}}
            onViewableItemsChanged={onViewableItemsChanged}
            onTouchMove={() => { isInteracted.current = true }}
            onScrollToIndexFailed={()=>{}}
            onContentSizeChange={(w, h) => {
              console.log("height:", h)
              if(h > scrollOffset && !isOnSavedPage.current) {
                flatRef.current.scrollToOffset({ offset: scrollOffset, animated: true });
                isOnSavedPage.current = true
              }
            }}
            onScroll={onScroll}
            removeClippedSubviews
            windowSize={10}
            maxToRenderPerBatch={15}
            disableVirtualization
          />
        </View>
      )}
    </View>
  );
});

export default React.memo(VerticalReaderMode);
