import { View, Text, Pressable, FlatList, Image, TouchableOpacity, Dimensions, } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, Stack, router } from 'expo-router';
import programsData from '@/assets/data/programsData';
import LecturesListLecture from '@/src/components/LectureListLecture';
import { defaultProgramImage }  from '@/src/components/ProgramsListProgram';
import { Divider, Portal, Modal, IconButton, Icon, Button } from 'react-native-paper';
import SheikData from "@/assets/data/sheikData";
import { SheikDataType } from '@/src/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated,{ interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';

const programLectures = () => {
  const { programId } = useLocalSearchParams();
  const program = programsData.find(p => p.programId.toString() == programId)
  const [ visible, setVisible ] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const Tab = useBottomTabBarHeight()

  const { width } = Dimensions.get("window")
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return{
      transform: [
        {
          translateY : interpolate(
          scrollOffset.value,
          [-250, 0, 250 ],
          [-250/2, 0, 250 * 0.75]
          )
        },
        {
          scale: interpolate(scrollOffset.value, [-250, 0, 250], [2, 1, 1])
        }
      ]
    }
  })
  if (!program){
    return (
      <Text> Program Not Found </Text>
    )
  }

  const GetSheikData = () => {
    const sheik : SheikDataType[]  = SheikData.filter(sheik => sheik.name == program?.programSpeaker)
    return( 
      <View>
        <View className=' flex-row'>
          <Image source={{uri : sheik[0].image || defaultProgramImage}} style={{width: 110, height: 110, borderRadius: 50}} resizeMode='contain'/>
          <View className='flex-col px-5'>
            <Text className='text-xl font-bold'>Name: </Text>
            <Text className='pt-2 font-semibold'> {sheik[0].name} </Text>
          </View>
        </View>
  
        <View className='flex-col py-3'>
          { sheik[0].name == "MAS" ? <Text className='font-bold'>Impact </Text> :  <Text className='font-bold'>Credentials: </Text>} 
          {sheik[0].creds.map( (cred, i) => {
            return <Text key={i}> <Icon source="cards-diamond-outline"  size={15}/> {cred} </Text>
          })}
        </View>
      </View>
    )
  } 

  const lectures = program.lectures
  return (
      <Animated.ScrollView ref={scrollRef} style={{backgroundColor: "white", height: "100%", paddingBottom: Tab, flex: 1}}>
        <Stack.Screen options={ { title : "", headerTransparent: true, headerLeft: () => <Button onPress={() => router.back()} style={{justifyContent: "flex-start"}}><Icon source={"less-than"} color='black' size={15}/><Text className='text-black'>Back</Text></Button> }}  />
          <View className='justify-center items-center h-[300] mt-[14%]' style={{ shadowColor: "black", shadowOffset: { width: 0, height: 0},shadowOpacity: 0.6}}>
          <Animated.Image 
            source={ { uri: program.programImg || defaultProgramImage }}
            style={[{width: width / 1.2, height: "100%", borderRadius: 8 }, imageAnimatedStyle] }
            resizeMode='stretch'
          />
          </View>
          <View className='bg-white'>
            <Text className='text-center mt-2 text-xl text-black font-bold'>{program.programName}</Text>
            <Text className='text-center mt-2  text-[#0D509D]' onPress={showModal}>{program.programSpeaker}</Text>
            {
              lectures ? lectures.map((item, index) => {
                return(
                  <>
                  <LecturesListLecture key={index} lecture={item} index={index} speaker={program.programSpeaker}/>
                  <Divider style={{width: "95%", marginLeft: 8}}/>
                  </>
                )
              }) : <></>
            }
          </View>
          <Portal>
            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{backgroundColor: 'white', padding: 20, height: "35%", width: "90%", borderRadius: 35, alignSelf: "center"}} >
              <GetSheikData />
            </Modal>
          </Portal>
      </Animated.ScrollView>
  )
}


const styles={
  programImageStyle: "h-200 w-300"
}
export default programLectures