import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics';

type LectureKeyNotesCardProp = {
    height : number
    width : number
    index : number
    scrollY : number
    keynote : string
    active : number
}
const LectureKeyNotesCard = ({height, width, index, scrollY, keynote, active} : LectureKeyNotesCardProp) => {
  const opacity = useSharedValue(0.3)

  const inputRange = [
    (index - 1) * height,
    (index) * height,
    (index + 1) * height
  ]

  opacity.value = interpolate(
    scrollY,
    inputRange,
    [0.3, 1, 0.3]
  )

  const cardStyle = useAnimatedStyle(() =>{
    return{
      opacity :  opacity.value
    }
  }) 
  useEffect(() => {
    if( active == index && index != 0 ){
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )
    }
  }, [active])
  return (
    <Animated.View style={[{ height : height, width : width, backgroundColor : "white", borderRadius : 15, paddingHorizontal : 10, paddingVertical : 10 }, cardStyle, {marginTop : index === 0 ? 20: 0}, {marginBottom : index === 4 ? 20 : 0}]}>
      <Text>{keynote}</Text>
    </Animated.View>
  )
}

export default LectureKeyNotesCard