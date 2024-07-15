import { View, Text, Pressable, FlatList, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, Stack } from 'expo-router';
import programsData from '@/assets/data/programsData';
import { Lectures, Program } from '@/src/types';
import { Link } from "expo-router";
import { defaultProgramImage } from '../ProgramsListProgram';
import { Icon, IconButton } from 'react-native-paper';
import LectureDotsMenu from '../LectureComponets/LectureDotsMenu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

type LecturesListProp = {
  lecture : Lectures
  index : number
  speaker : string | null | undefined
}
const { width } = Dimensions.get("window")


const RenderMyLibraryProgramLectures = ( {lecture, index, speaker} : LecturesListProp ) => {
  const liked = useSharedValue(0)
  const outlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });
  
  const fillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value
    };
  });
  
    const LikeButton = () => {
      return(
        <Pressable onPress={() => (liked.value = withSpring(liked.value ? 0: 1))} className=' relative'>
          <Animated.View style={outlineStyle}>
            <Icon source="cards-heart-outline"  color='black'size={25}/>
          </Animated.View>
          <Animated.View style={[{position: "absolute"} ,fillStyle]}>
            <Icon source="cards-heart"  color='red'size={25}/>
          </Animated.View>
      </Pressable>
      )
    }
  
    const DotsButton = () => {
      return(
        <Menu>
          <MenuTrigger>
            <Icon source={"dots-horizontal"} color='black' size={25}/>
          </MenuTrigger>
          <MenuOptions customStyles={{optionsContainer: {width: 150, borderRadius: 8, marginTop: 20, padding: 8}}}>
            <MenuOption>
              <View className='flex-row justify-between items-center'>
               <Text>Add To Playlist</Text> 
               <Icon source="playlist-plus" color='black' size={15}/>
              </View>
            </MenuOption>
            <MenuOption>
              <View className='flex-row justify-between items-center'>
                <Text>Add To Library</Text>
                <Icon source="library" color='black' size={15}/>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>           
      )
    }
    return (
      <View className='bg-white mt-2'>
        <Pressable>
        <View className='ml-2 flex-row items-center' >
          <Link href={`/myPrograms/lectures/${lecture.lecture_id}`}>
            <Text className='text-xl font-bold text-gray-400 ml-2' >{index + 1}</Text>
            <View className='flex-col justify-center' style={{width: width / 1.5}}>
              <Text className='text-md font-bold ml-2 text-black' style={{flexShrink: 1, }} numberOfLines={1}>{lecture.lecture_name}</Text>
              <View className='flex-row' style={{flexShrink: 1, width: width / 1.5}}>
                {speaker == "MAS" ? <Text className='ml-2 text-gray-500' style={{flexShrink:1}} numberOfLines={1}>{lecture.lecture_speaker} </Text> : <Text className='ml-2 text-gray-500'> {lecture.lecture_date}</Text>}
              </View>
            </View>
            </Link>
            <View className='flex-row items-center justify-center ml-3 px-5'>
              <LikeButton />
              <View className='w-5'></View>
              <DotsButton />
            </View>
          </View>
        </Pressable>
        
      </View>
    )
  }



export default RenderMyLibraryProgramLectures