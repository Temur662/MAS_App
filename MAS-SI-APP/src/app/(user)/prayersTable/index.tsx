import { View, Text, Animated, FlatList, Image, FlatListProps, Pressable, StatusBar, Dimensions, ImageBackground } from 'react-native';
import Paginator from '@/src/components/paginator';
import Table from "@/src/components/prayerTimeTable";
import React, {useEffect, useRef, useState } from 'react';
import { usePrayer } from '@/src/providers/prayerTimesProvider';
import { gettingPrayerData } from '@/src/types';
import { Divider } from 'react-native-paper';
import { Link } from 'expo-router';
import ApprovedAds from '@/src/components/BusinessAdsComponets/ApprovedAds';
import { BlurView } from 'expo-blur';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/providers/AuthProvider';


export default function Index() {
  const { prayerTimesWeek } = usePrayer();
  if( prayerTimesWeek.length == 0 ){
    return
  }
  const { session } = useAuth()
  const [isRendered, setIsRendered ] = useState(false)
  const { height } = Dimensions.get('window')
  const tableWidth = Dimensions.get('screen').width * .95
  const [ tableIndex, setTableIndex ] = useState(0)
  const  [ UserSettings, setUserSettings ] = useState<{ prayer : string, notification_settings : string[] }[]>()
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold : 50}).current;
  const handleScroll = (event : any) => {
    const scrollPositon = event.nativeEvent.contentOffset.x;
    const index = Math.floor(scrollPositon / tableWidth);
    setTableIndex(index)
  }
  const flatlistRef = useRef<FlatList>(null)
  useEffect(() => {
    flatlistRef.current?.scrollToIndex({
      index : tableIndex,
      animated : true
    })  
  }, [tableIndex])
    
  const getUserSetting = async () => {
      const { data , error } = await supabase.from('prayer_notification_settings').select('*').eq('user_id', session?.user.id)
      if( data ){
        setUserSettings(data)
      }
    if( error ){
      console.log(error)
    }
  }
  useEffect(() => {
    getUserSetting()
    const listenForSettings = supabase.channel('Listen for user settings change').on(
      'postgres_changes',
      {
        event : '*',
        schema : 'public',
        table : 'prayer_notification_settings',
        filter : `user_id=eq.${session?.user.id}`
      },
      async (payload) => await getUserSetting()
    ).subscribe()

    return () => { supabase.removeChannel(listenForSettings) }
  }, [])
  return (
    <View className='h-[100%]  bg-white'>
      <StatusBar barStyle={"dark-content"} />
      <View className='items-center justify-center '>
      <ImageBackground
        source={require('@/assets/images/PrayerTimesHeader.jpg')}
        style={{ height : isRendered ? height / 1.85 : height / 1.7 , justifyContent : 'flex-end' }}
        imageStyle={{ height : isRendered ? height / 4.5 : height / 3.5 , opacity : 0.9, borderBottomLeftRadius : 10, borderBottomRightRadius : 10}}
        className=''
      >
        <View className=' h-[300] items-center justify-center '>
          <FlatList 
            data={prayerTimesWeek}
            renderItem={({item, index}) => <Table prayerData={item} setTableIndex={setTableIndex} tableIndex={tableIndex} index={index} userSettings={UserSettings}/>}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEventThrottle={32}
            viewabilityConfig={viewConfig}
            contentContainerStyle={{justifyContent: "center", alignItems: "center"}}
            ref={flatlistRef}
          />
        </View>
        </ImageBackground>
        <ApprovedAds setRenderedFalse={() => setIsRendered(false)} setRenderedTrue={() => setIsRendered(true) }/>
      </View>
    </View>
  )
}


{
  /*
  
   <View className='flex-row items-center justify-between  flex-wrap mt-[10]'>
              <View className='flex-col items-center justify-center ml-[10]'>
                  <View className='w-[95] h-[80] items-center justify-center bg-white' style={{shadowColor: "black", shadowOffset: {width : 0, height: 0}, shadowOpacity: 1, shadowRadius: 3, borderRadius: 8}}>
                    <Image source={{ uri : "https://cdn-icons-png.freepik.com/512/10073/10073987.png" || undefined}} style={{width: 50, height: 50, objectFit: "contain"}} />
                  </View>
                    <Text className='text-xl font-bold'> Qibla </Text>
                </View>

                <View className='flex-col items-center justify-center '>
                  <View className='w-[95] h-[80] items-center justify-center bg-white' style={{shadowColor: "black", shadowOffset: {width : 0, height: 0}, shadowOpacity: 1, shadowRadius: 3, borderRadius: 8}}>
                    <Image source={{ uri : "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678116-calendar-512.png" || undefined}} style={{width: 50, height: 50, objectFit: "contain"}} />
                  </View>
                    <Text className='text-xl font-bold'> Calender </Text>
                </View>

                <View className='flex-col items-center justify-center mr-[10]'>
                  <View className='w-[95] h-[80] items-center justify-center bg-white' style={{shadowColor: "black", shadowOffset: {width : 0, height: 0}, shadowOpacity: 1, shadowRadius: 3, borderRadius: 8}}>
                    <Image source={{ uri : "https://cdn-icons-png.flaticon.com/512/5195/5195218.png" || undefined}} style={{width: 50, height: 50, objectFit: "contain"}} />
                  </View>
                    <Text className='text-xl font-bold'> 99 Names</Text>
                </View>
            </View>
  */
}