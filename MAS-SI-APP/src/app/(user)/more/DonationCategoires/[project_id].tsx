import { View, Text, Pressable, Image } from 'react-native'
import React, { useRef, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Svg, { Path } from 'react-native-svg'
import { ProgressBar } from 'react-native-paper'
import OtherAmountDonationSheet from '@/src/components/ShopComponets/OtherAmountDonationSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { initializePaymentSheet, openPaymentSheet } from '@/src/lib/stripe'
import { supabase } from '@/src/lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { Extrapolation, interpolate, useSharedValue, withTiming } from 'react-native-reanimated'
const ProjectDetails = () => {
  const { project_id, project_name, project_linked_to, project_goal, thumbnail } = useLocalSearchParams()
  const [ projectInfo, setProjectInfo ] = useState<{ project_id : string, }[]>()
  const [ buttonOn, setButtonOn ] = useState(true)
  const DonationProgressBar = useSharedValue(0)
  const getProjectDonations = async ( ) => {
    const { data , error } = await supabase.from('donations').select('*').contains('project_donated_to', [project_id])
    if( data ){
      const totalAmount = data.reduce((sum, donation) => sum + donation.amountGiven, 0);
      const Percentage = (totalAmount / Number(project_goal)) * 100
      const interpolatedValue = interpolate(totalAmount, [0, 5000000], [0, 1], Extrapolation.CLAMP);
      DonationProgressBar.value = withTiming(interpolatedValue, { duration : 3000 })
    }
  }

  const DonationButtonBoxs = [30, 50, 100, 250]
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const handlePresentModalPress = () => bottomSheetRef.current?.present();
  const callForDonationAmount = async (amount : number) => {
    setButtonOn(false)
    const paymentIntent = await initializePaymentSheet(Math.floor(amount * 100))
    const paymentSuccess = await openPaymentSheet()
    if(paymentSuccess){
      const { data : getLatestTotal , error } = await supabase.from('donations').select('*').order('date', { ascending : false }).limit(1).single()
      const { error : insertError } = await supabase.from('donations').insert({  amountGiven : amount, projec_donated_to : project_linked_to ?  [project_id, project_linked_to] : [project_id] })
      const { error : emailError } = await supabase.functions.invoke('donation-confirmation-email',{ body : { donation_amount : amount } })
      if( emailError ){
        console.log(emailError)
      }
      if( insertError ){
        console.log(insertError)
      }
      setButtonOn(true)
    }else{
      console.log('Failed')
      setButtonOn(true)
    }
    setButtonOn(true)
  }
  return (
    <View className='flex-1 bg-white'>
        <Stack.Screen options={{
            headerTransparent : true,
            header : () => 
                (
                <View style={{ borderBottomLeftRadius: 20, borderBottomRightRadius : 20, backgroundColor : '#CBDCF0', height : 100 }} 
                className='items-end justify-center flex flex-row'>
                  
                  <View className='mb-[1%] flex flex-row items-center w-[100%]'>
      
                    <Pressable className='self-start ml-4' onPress={() => router.back()}>
                      <Svg width="35" height="35" viewBox="0 0 29 29" fill="none">
                        <Path d="M18.125 7.25L10.875 14.5L18.125 21.75" stroke="#1B85FF" stroke-width="2"/>
                      </Svg>
                    </Pressable>
      
                    <Text className='font-bold text-xl text-center self-center ml-[25%]'>Categories</Text>
                  </View>
                </View>
                )
            
        }}
        />
      <View className='w-[100%] items-center pt-[110] bg-[#F6F6F6] rounded-br-[15px] rounded-bl-[15px] pb-2'>
        <Image src={thumbnail} className='w-[95%] h-[273px] rounded-[15px] '/>
        <View className=' flex flex-col w-[100%] items-center mt-2 '>
            <Text className='text-black font-bold text-xl mb-2' numberOfLines={1} adjustsFontSizeToFit>{project_name}</Text>
            <View className='w-[85%]' >
                <ProgressBar 
                className='bg-[#0D509E] w-[100%] rounded-xl self-center h-[16px]' theme={{ colors: { primary: 'green' } }}
                animatedValue={0.2}
                />
                <Text className='text-black text-lg'>Raised:  XX%</Text>
            </View>
        </View>
      </View>

      <View className=''>
        <Text className='text-black text-lg font-bold ml-3'>Select Amount: </Text>

        <View style={{ width : '100%',  backgroundColor : 'white', flexWrap : "wrap", flexDirection : 'row', columnGap : 20, justifyContent : 'center', marginTop : "2%", rowGap : 25}}
        className=''
        >
            {DonationButtonBoxs.map((item, index) => (
                  <Pressable style={{ width : '40%', height : 50, shadowColor : 'black', shadowOffset : { width : 0, height : 1}, shadowOpacity : 1, shadowRadius : 2 }} onPress={ () =>  callForDonationAmount(DonationButtonBoxs[index]) } key={index} disabled={!buttonOn}>
                      <LinearGradient colors={['#0D509D', '#57BA47']} style={{ width : '100%', height : '100%', borderRadius  : 20, justifyContent : "center" }}>
                          <Text className='text-white text-xl font-bold text-center'>${item}</Text>
                      </LinearGradient>
                  </Pressable>
            ))}
             <Pressable style={{ width : '50%', height : 50 }} onPress={handlePresentModalPress} disabled={!buttonOn}>
                 <View className='bg-black' style={{ width : '100%', height : '100%', borderRadius  : 20, justifyContent : "center"}}>
                     <Text className='text-white text-xl font-bold text-center'>Other Amount...</Text>
                 </View>
             </Pressable>
        </View>

        <View>
            <Text className='text-black font-bold text-center mt-5'>Help Us Complete The Expansion Of Our Center </Text>
        </View>
      </View>
      <OtherAmountDonationSheet ref={bottomSheetRef} />
    </View>
  )
}

export default ProjectDetails