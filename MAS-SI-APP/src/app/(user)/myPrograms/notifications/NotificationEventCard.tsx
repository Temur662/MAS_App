import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import * as Haptics from "expo-haptics"
import { Icon } from 'react-native-paper'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { err } from 'react-native-svg'
import { EventsType } from '@/src/types'
import { isBefore } from 'date-fns'
type NotificationCardProp = {
    height : number
    width : number
    index : number
    scrollY : number
    setSelectedNotification : ( selectedNotification : number[] ) => void
    selectedNotification : number[]
    event_id : string | string[]
    eventInfo : EventsType
}

const schedule_notification = async ( user_id, push_notification_token, message, notification_type, program_event_name, notification_time ) => {
  const { error } = await supabase.from('program_notification_schedule').insert({ user_id : user_id, push_notification_token : push_notification_token, message : message, notification_type : notification_type, program_event_name : program_event_name, notification_time : notification_time})
  if( error ){
    console.log(error)
  }
}

function setTimeToCurrentDate(timeString : string ) {

  // Split the time string into hours, minutes, and seconds
  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  // Create a new Date object with the current date
  const timestampWithTimeZone = new Date();

  // Set the time with setHours (adjust based on local timezone or UTC as needed)
  timestampWithTimeZone.setHours(hours , minutes, seconds, 0); // No milliseconds

  // Convert to ISO format with timezone (to ensure it's interpreted as a TIMESTAMPTZ)
  const timestampISO = timestampWithTimeZone // This gives a full timestamp with timezone in UTC

  return timestampISO
}

const NotificationEventCard = ({height , width, index, scrollY, setSelectedNotification, selectedNotification, event_id, eventInfo } : NotificationCardProp) => {
  const { session } = useAuth()
  const scale = useSharedValue(1)
  const [ checked , setChecked ] = useState(false)
  const [ pushToken , setPushToken ] = useState('')
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const onPress = async () => {
    const { data : currentSettings, error } = await supabase.from('event_notification_settings').select('*').eq('user_id', session?.user.id).eq('event_id', event_id ).single()
    if(currentSettings == null) {
      const {data, error} = await supabase.from('event_notification_settings').insert({event_id : event_id, user_id : session?.user.id, notification_settings : [CardOptions[index]]})
    }
    else if(currentSettings.length == 0){
     const {data, error} = await supabase.from('event_notification_settings').insert({event_id : event_id, user_id : session?.user.id, notification_settings : [CardOptions[index]]})
     if( error ){
      console.log(error)
     }
    }
    if(currentSettings){
      const settings = currentSettings.notification_settings
      if( settings.includes(CardOptions[index]) ){
        const filter = settings.filter((e : any) => e !== CardOptions[index])
        const {data, error} = await supabase.from('event_notification_settings').update({notification_settings : filter}).eq('event_id', event_id ).eq('user_id', session?.user.id, )
      }
      else{
        settings.push(CardOptions[index])
        if ( pushToken ){
          const currentDate = new Date()
          const day = currentDate.getDay()
          const eventStartTime =  setTimeToCurrentDate(eventInfo.event_start_time)
          const event_days = eventInfo.event_days
          if( index == 0 ){
            await Promise.all(event_days.map( async ( days ) => {
              const indexOfDay = daysOfWeek.indexOf(days)
              if( ( indexOfDay - 1 ) % 6 == day ){
                await schedule_notification(session?.user.id, pushToken,  `${eventInfo.event_name} is Tomorrow`, 'Day Before', eventInfo.event_name, eventStartTime)
              }
            }))
          }else{
            if( event_days.includes(daysOfWeek[day]) && isBefore( currentDate, eventStartTime )){
              if( index == 1 ){
                await schedule_notification(session?.user.id, pushToken,  `${eventInfo.event_start_time} is Starting Now!`, 'When Program Starts', eventInfo.event_start_time, eventStartTime)
              }
              else if( index == 2 && isBefore(currentDate, eventStartTime) ){
                const start_time = setTimeToCurrentDate(eventInfo.event_start_date)
                start_time.setMinutes(start_time.getMinutes() - 30)
                await schedule_notification(session?.user.id, pushToken, `${eventInfo.event_start_time} is Starting in 30 Mins!`, '30 Mins Before', eventInfo.event_start_time, start_time)
              }
            }
          }
        }
        const { error } = await supabase.from('event_notification_settings').update({notification_settings : settings}).eq('event_id', event_id ).eq('user_id', session?.user.id, )
      }
    }
  }
  const handlePress = () => {
    scale.value = withSequence(withSpring(0.9), withSpring(1))
    
    Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      )

      if( selectedNotification.includes(index)  ){
        const setPlaylist = selectedNotification?.filter(id => id !== index)
        setSelectedNotification(setPlaylist)
        setChecked( false )
      }
      else if( selectedNotification ){
        setSelectedNotification([...selectedNotification, index])
        setChecked( true )
      }
      else{
          setSelectedNotification([index])
          setChecked(true)
      }
      onPress()
  }
  const getSettings = async () => {
    const { data , error } = await supabase.from('event_notification_settings').select('notification_settings').eq('event_id', event_id ).eq('user_id', session?.user.id, ).single()
    const { data : user_push_token } = await supabase.from('profiles').select('push_notification_token').eq('id', session?.user.id).single()
    if( user_push_token ){
      setPushToken(user_push_token.push_notification_token)
    }
    if( error ) {
      return
    }
    if( data && data.notification_settings.length > 0){
      if( data.notification_settings.includes(CardOptions[index]) ){
        setSelectedNotification((prevSelected : any) => {
          if (!prevSelected.includes(index)) {
            return [...prevSelected, index];
          }
          return prevSelected; 
        });
        
        setChecked(true); 
        }
    }
  }
  useEffect(() => {
    getSettings()
  }, [])
  const cardStyle = useAnimatedStyle(() => {
    return{
        transform: [{ scale : scale.value }]
    }
  })
  const CardOptions = ['Day Before', '30 Mins Before', 'When Program Starts']
  return (
        <Animated.View style={[{ height : height, width : width, borderRadius : 20, shadowColor : "black", shadowOpacity : 1, shadowRadius : 1, shadowOffset : {width : 0, height : 0} }, cardStyle, {marginTop : index === 0 ? 10: 0}, {marginBottom : index === 5 ? 10 : 0}]}>
            <Pressable onPress={handlePress} style={[{ height : height, width : width, flexDirection : "row", alignItems : "center", justifyContent : "center"  }]}>
              {checked ?    <Icon source={"checkbox-blank-circle"}  size={25}/>  : <Icon source={"checkbox-blank-circle-outline"}  size={25}/>}
                <View className='w-[5]'/>
                <View style={{ backgroundColor : "white", height : height, width : width, borderRadius : 20,  paddingVertical : 10, paddingHorizontal : 10, alignItems : 'center', justifyContent : 'center'}}>
                <Text className='text-bold text-black text-2xl'>{CardOptions[index]}</Text>
              </View>
            </Pressable>
        </Animated.View>
  )
}

export default NotificationEventCard