import { View, Text, ScrollView, FlatList, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { EventsType, Program } from '@/src/types'
import { Link, Stack } from 'expo-router'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { AccordionItem } from './_Accordion'
import { useSharedValue } from 'react-native-reanimated'
import { Button, Divider } from 'react-native-paper'
import Days from './_Days'
const UpcomingEvents = () => {
  const TabBarHeight = useBottomTabBarHeight()
  const [ upcoming, setUpcoming ] = useState<Program[]>([])
  const [ upcomingEvents, setUpcomingEvents ] = useState<EventsType[]>([])
  const MondaySection = useSharedValue(false);
  const TuesdaySection = useSharedValue(false);
  const WednesdaySection = useSharedValue(false);
  const ThursdaySection = useSharedValue(false);
  const FridaySection = useSharedValue(false);
  const SaturdaySection = useSharedValue(false);
  const SundaySection = useSharedValue(false);
  

  const GetUpcomingEvents = async () => {
    const date = new Date()
    const isoString = date.toISOString(); // "2024-04-27T14:20:30.000Z"
    const { data : programs , error } = await supabase.from('programs').select('*').gte('program_end_date', isoString)
    const { data : events , error : eventsError } = await supabase.from('events').select('*').gte('event_end_date', isoString)
    if( programs ){
        setUpcoming(programs)
    } 
    if( events ){
        setUpcomingEvents(events)
    }
  }
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    GetUpcomingEvents()
  }, [])
  return (
    <ScrollView contentContainerStyle={{ paddingBottom : TabBarHeight + 30, gap : 20, marginTop : 10 }} className="bg-white h-full flex-1 w-full ">
        <Stack.Screen options={{ 
            headerStyle : { backgroundColor : 'white' },
            headerTintColor : 'black'
        }}/>
        {
          days.map(( item ) => {
            const program = upcoming.filter(programs => programs.program_days.includes(item))
            const DaysKidsPrograms = program.filter(programs => programs.is_kids == true)
            const event = upcomingEvents.filter(events => events.event_days.includes(item) && events.pace == false)
            const pace = upcomingEvents.filter(events => events.event_days.includes(item) && events.pace == true)
            return(
              <>
                <Days Programs={program} Day={item}Kids={DaysKidsPrograms} Events={event} Pace={pace}/>
                <Divider className='h-[0.5px] w-[70%] self-center'/>
              </>
            )
          })
        }
      
    </ScrollView>
  )
}

export default UpcomingEvents