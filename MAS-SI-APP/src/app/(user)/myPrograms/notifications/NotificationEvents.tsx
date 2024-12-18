import { View, Text, ScrollView, useWindowDimensions, Button, FlatList, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Stack } from 'expo-router'
import { supabase } from '@/src/lib/supabase'
import{ useAuth } from "@/src/providers/AuthProvider"
import { EventsType, Program } from '@/src/types'
import RenderAddedEvents from "@/src/components/UserProgramComponets/RenderAddedEvents" 
import ProgramsListProgram from '@/src/components/ProgramsListProgram'
import RenderAddedPrograms from '@/src/components/UserProgramComponets/RenderAddedPrograms'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Dialog, Icon, IconButton } from 'react-native-paper'
import { usePrayer } from '@/src/providers/prayerTimesProvider'
import NotificationPrayerTable from '@/src/components/notificationPrayerTimeTable'
import { useRouter } from 'expo-router'
import JummahMarquee from '@/src/components/JummahMarquee'
{/*
  const NotificationPaidScreen = () => {
    return(
      <ScrollView>
        <View className='px-7'>
          <View className='items-center'>
            <Text className='font-bold text-2xl text-center'>Start adding flyers to make your notifications list</Text>
            <Icon source={"bell"} color="#007AFF" size={40}/>
          </View>
          <View className='pb-[50%]'/>
          <View>
            <Text className='font-bold text-xl text-center'>Add programs and events by tapping the <Icon source={"bell"} color="#007AFF" size={20}/> or sliding right on the flyer name</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  */}
type NotificationEventsScreenProp = {
  addedEvents : EventsType[] | null
  layout: number
}

const SalahSetting = () => {
  
}
const NotificationEventsScreen = ( { addedEvents, layout } : NotificationEventsScreenProp) => {
  return(
    <ScrollView className='w-[100%]' contentContainerStyle={{ flexDirection : "row", flexWrap : "wrap" }}>
        {
          addedEvents && addedEvents.length > 0? addedEvents.map((item, index) => {
            return (
            <View key={index} style={{ width : layout / 2, justifyContent : "center", alignItems : "center", paddingTop : 10}}>
              <RenderAddedEvents event_id={item.event_id}/>
            </View>
          )
          }) :  
          ( 
            <View className='px-7'>
            <View className='items-center'>
              <Text className='font-bold text-2xl text-center'>Start adding flyers to make your notifications list</Text>
              <Icon source={"bell"} color="#007AFF" size={40}/>
            </View>
            <View className='pb-[50%]'/>
            <View>
              <Text className='font-bold text-xl text-center'>Add programs and events by tapping the <Icon source={"bell"} color="#007AFF" size={20}/> or sliding right on the flyer name</Text>
            </View>
          </View>
          )
        }
    </ScrollView>
  )
}
type ClassesAndLecturesScreenProp = {
  addedPrograms : Program[] | null
  layout: number
}

const ClassesAndLecturesScreen = ( { addedPrograms, layout } : ClassesAndLecturesScreenProp) => {
  return(
    <ScrollView className='w-[100%]' contentContainerStyle={{ flexDirection : "row", flexWrap : "wrap" }}>
        {
          addedPrograms && addedPrograms.length > 0 ? addedPrograms.map(( item ) => {
            return(
              <View style={{ width : layout / 2, justifyContent : "center", alignItems : "center", paddingTop : 10 }}>
                <RenderAddedPrograms program_id={item.program_id}/>
              </View>
            )
          }) : 
          ( 
          <View className='px-7'>
            <View className='items-center'>
              <Text className='font-bold text-2xl text-center'>Start adding flyers to make your notifications list</Text>
              <Icon source={"bell"} color="#007AFF" size={40}/>
            </View>
            <View className='pb-[50%]'/>
            <View>
              <Text className='font-bold text-xl text-center'>Add programs and events by tapping the <Icon source={"bell"} color="#007AFF" size={20}/> or sliding right on the flyer name</Text>
            </View>
          </View>
          )
        }
    </ScrollView>
  )
}

const SalahTimesScreen = () => {
  const { prayerTimesWeek } = usePrayer();
  if( prayerTimesWeek.length == 0 ){
    return
  }
  const [ tableIndex, setTableIndex ] = useState(0)
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold : 50}).current;
  const flatlistRef = useRef<FlatList>(null)
  useEffect(() => {
    flatlistRef.current?.scrollToIndex({
      index : tableIndex,
      animated : true
    })  
  }, [tableIndex])

  return (
    <View className='items-center justify-center bg-white'>
      <FlatList 
        data={prayerTimesWeek}
        renderItem={({item, index}) => <NotificationPrayerTable prayerData={item} setTableIndex={setTableIndex} tableIndex={tableIndex} index={index}/>}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        scrollEventThrottle={32}
        viewabilityConfig={viewConfig}
        contentContainerStyle={{flex:1}}
        ref={flatlistRef}
        nestedScrollEnabled
      />
    </View>
  )
}


const NotificationEvents = () => {
  const { session } = useAuth()
  const [ addedEvents, setAddedEvents ] = useState<EventsType[] | null>(null)
  const [ addedPrograms, setAddedPrograms ] = useState<Program[] | null>(null)
  const [ index, setIndex ] = useState(0)
  const layout = useWindowDimensions().width
  const tabBarHeight = useBottomTabBarHeight()
  const getAddedEvents = async () => {
    const { data ,error } = await supabase.from("added_notifications_events").select("*").eq("user_id", session?.user.id).order("created_at", { ascending : false })
    if( error ){
        console.log( error)
    }
    if( data ){
        setAddedEvents(data)
    }
  }

  const getAddedProgram = async () => {
    const currDate = new Date().toISOString()
    const { data, error } = await supabase.from("added_notifications_programs").select("*").eq("user_id", session?.user.id).order("created_at", { ascending : false })
    if( error ){
      console.log( error )
    }
    if( data ){
      setAddedPrograms(data)
    }
  }
    useEffect(() => {
      getAddedEvents()
      getAddedProgram()
      const listenForAddedEvents = supabase.channel("added notifications").on(
        "postgres_changes",
        {
          event: '*',
          schema : "public",
          table: "added_notifications_events",
          filter:`user_id=eq.${session?.user.id}`

        },
        async (payload) => await getAddedEvents()
      )
      .subscribe()

      const listenForAddedPrograms = supabase.channel("added notifications programs").on(
        "postgres_changes",
        {
          event: '*',
          schema : "public",
          table: "added_notifications_programs",
          filter:`user_id=eq.${session?.user.id}`
        },
        async (payload) => await getAddedProgram()
      )
      .subscribe()
      return () => { supabase.removeChannel( listenForAddedEvents ) ; supabase.removeChannel( listenForAddedPrograms )}
  },[])


const renderScene = ({ route } : any) => {
  switch( route.key ){
    case "second" :
         return <SalahTimesScreen />
    case "third" :
       return <ClassesAndLecturesScreen addedPrograms={addedPrograms} layout={layout} />   
    case "fourth" :
      return <NotificationEventsScreen addedEvents={addedEvents} layout={layout} />  }
}
  const routes = [
    //{ key: 'first', title: 'Paid' },
    { key : 'second', title: 'Prayers'},
    { key: 'third', title: 'Classes & Lectures' },
    { key : 'fourth', title: 'Events'},
    ]

  const renderTabBar = (props : any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor : "#57BA47", position: "absolute", zIndex : -1, bottom : "8%", left : "1%", height: "85%", width : "30%", borderRadius : 20  }}
      style={{ backgroundColor: '#0D509D', alignSelf : "center",  height: '9%'}}
      labelStyle={{ color : "white", fontWeight : "bold" }}
      tabStyle={{ width : layout / 3 }}
      scrollEnabled={true}
    />
  );
 //#0D509D
  const router = useRouter()
  return (
    <>
    <Stack.Screen options={{ title : "Notification Center", headerBackTitleVisible : false, headerTintColor : '#007AFF' , headerTitleStyle: { color : 'black'}, headerStyle : {backgroundColor : 'white',}, headerLeft : () => ( <Pressable className='items-start mr-2' onPress={() => router.back()}><Icon source={'chevron-left'} color='black' size={30} /></Pressable>)}}/>
    <View className='bg-[#ededed]'/>
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout }}
      renderTabBar={renderTabBar}
      style={{ backgroundColor : "#ededed"}}
    />
    </>
  )
}


{
  /*
        <ScrollView className='bg-white flex-1'>
      <Stack.Screen options={{title : 'Notification Center', headerBackTitleVisible : false}}/>
      <View className='flex-col w-[100%] flex-wrap justify-center mt-5' >
        <View>
          <Text className='text-2xl font-bold'>Events :</Text>
        </View> 

        <View className='mt-2 flex-row w-[100%] flex-wrap justify-center' >
        {addedEvents ? addedEvents.map((event, index) => {
          return(
            <View className='pb-5 justify-between mx-2' key={index}>
              <RenderAddedEvents event_id={event.event_id} />
            </View>
          )
        }) : <></>}
        </View>


        <View>
          <Text className='text-2xl font-bold'>Programs :</Text>
        </View> 

        <View className='mt-2 flex-row w-[100%] flex-wrap justify-center' >
        {addedPrograms ? addedPrograms.map((program, index) => {
          return(
            <View className='pb-5 justify-between mx-2' key={index}>
              <RenderAddedPrograms program_id={program.program_id} />
            </View>
          )
        }) : <></>}
        </View>

      </View>
    </ScrollView>
  */
}

export default NotificationEvents
