import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Alert, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { getMangaById, getMangaByTitle } from '../utils/MangaDexClient'

import images  from "../constants/images"
 
const MangaCard = ({ mangaId, containerStyles, coverStyles, mangaTitle, mangaCover, mangaDetails, autoload, children, disabled }) => {
  
  const [title, setTitle] = useState("")
  const [coverImgUrl, setCoverImgUrl] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(autoload) {
          const result = await getMangaById(mangaId);
          setCoverImgUrl(result.cover);
          setTitle(result.title);
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    fetchData();
  }, [autoload]);
  
  const handlePress = () => {
    // console.log(mangaDetails.altTitles)
    if(mangaDetails) {
      router.navigate({
        pathname: "screens/mangaInfo",
        params: {
          "mangaId": mangaId,
          "mangaCover": mangaCover,
          "mangaTitle": mangaTitle,
          "status":  mangaDetails.status ? mangaDetails.status : "no status available", 
          "desc":  mangaDetails.desc ? mangaDetails.desc : "no description available",  
          "altTitles": mangaDetails.altTitles ? JSON.stringify(mangaDetails.altTitles) : "no alternative titles", 
          "tags" : JSON.stringify(mangaDetails.tags),
          "contentRating": mangaDetails.contentRating ? mangaDetails.contentRating : "no rating available",
        }
      })
    }
  }

  const source = autoload ? coverImgUrl : mangaCover;
  const displayTitle = autoload ? title : mangaTitle;
  
  return (
    <TouchableOpacity 
      className={`${containerStyles} rounded-md overflow-hidden bg-accent-100 border-2 border-accent-100`}
      onPress={handlePress}
      disabled={disabled}
    >
      <ImageBackground
        source={source ? { uri: source } : images.test}   
        className={`${coverStyles} relative`}
        resizeMode='cover'
      >
      </ImageBackground>
        {children}
    </TouchableOpacity>
  );
}

export default MangaCard;
