import { View, Text, Image, Dimensions, StatusBar, Pressable, Platform } from 'react-native'
import React, { useState } from 'react'
import { Button, Divider, Icon, TextInput } from 'react-native-paper'
import { Link, Stack } from "expo-router"
import { supabase } from '@/src/lib/supabase'
import * as AppleAuthentication from 'expo-apple-authentication'

const SignUp = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword] = useState("")
  const [ name, setName ] = useState('')
  const [ loading, setLoading ] = useState(false)
  const { width } = Dimensions.get("window")

  async function signUpWithEmail() {
    setLoading(true)
    if( email && password && name ){
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: name,
          profile_email: email,
        },
      },
    })

    if (error) {alert(error.message); return}
    setLoading(false)}
    else{
      alert('Fill in the fields to complete sign up')
    }
  }

  return (
    <View className='border w-full h-full bg-white'>
      <Stack.Screen options={{ headerTransparent : true, headerTitle : '', headerBackTitleVisible : false }}/>
      <StatusBar barStyle={"dark-content"}/>
      <View className='h-[25%] justify-end px-8' style={{ borderBottomRightRadius : 40, borderBottomLeftRadius : 40, backgroundColor : 'gray'}}>
        <View className='pt-8'>
          <Text className=' text-white italic' style={{ fontSize : 40 }}>Account <Text className='font-bold'>Sign Up</Text></Text>
        </View>
        <Link href={'/SignIn'} asChild>
          <Pressable className='pt-4 p-2 rounded-3xl w-[55%] border-white flex-row justify-between items-center mb-4' style={{ borderWidth : 4}}>
            <Text className='text-white'>already a member?</Text>
            <Icon source={'arrow-right-thin'} size={20} color='white'/>
          </Pressable>
        </Link>
          </View>
      <View className=' justify-center items-center bg-white pt-[12%] flex-col flex-2'>
      <View className='w-[95%]' style={{ shadowColor : 'black', shadowOffset : { width : 0, height : 2 }, shadowOpacity : 0.5, shadowRadius : 1 }}>
          <TextInput
            mode='outlined' 
            value={name}
            onChangeText={setName}
            style={{ backgroundColor : 'white', borderBottomWidth : 0, borderWidth : 0 }}
            theme={{ roundness : 50 }}
            placeholder={'name'}
            outlineColor='white'
            activeOutlineColor='black'
            textColor='black'
          />
        </View>
        <View className='w-[95%] mt-2' style={{ shadowColor : 'black', shadowOffset : { width : 0, height : 2 }, shadowOpacity : 0.5, shadowRadius : 1 }}>
          <TextInput
            mode='outlined' 
            value={email}
            onChangeText={setEmail}
            style={{ backgroundColor : 'white', borderBottomWidth : 0, borderWidth : 0 }}
            theme={{ roundness : 50 }}
            placeholder={'email'}
            outlineColor='white'
            activeOutlineColor='black'
            textColor='black'
          />
        </View>
        <View className='w-[95%] mt-2' style={{ shadowColor : 'black', shadowOffset : { width : 0, height : 2 }, shadowOpacity : 0.5, shadowRadius : 1 }}>
          <TextInput
            mode='outlined' 
            value={password}
            onChangeText={setPassword}
            style={{ backgroundColor : 'white', borderBottomWidth : 0, borderWidth : 0 }}
            theme={{ roundness : 50 }}
            placeholder={'password'}
            outlineColor='white'
            activeOutlineColor='black'
            secureTextEntry
            textColor='black'
          />
        </View>
        <View className='w-[40%] flex-2 mt-10' style={{ shadowColor : 'black', shadowOffset : { width : 0, height : 2 }, shadowOpacity : 0.5, shadowRadius : 1 }}>
          <Button onPress={signUpWithEmail} mode='contained' buttonColor='#57BA47' textColor='white'>Sign Up</Button>
        </View>
      </View>
      <View className=' flex-row mt-2 items-center self-center'>
        <Divider className=' w-[100]' bold/>
        <Text className='font-semi text-black text-lg' > OR </Text>
        <Divider className=' w-[100]' bold/>
      </View>
      <View className='items-center mt-[5%] w-[100%]'>
        { Platform.OS == 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{ width: '70%', height: 64 }}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              })
              // Sign in via Supabase Auth.
              console.log(credential)
              if (credential.identityToken) {
                const {
                  error,
                  data: { user },
                } = await supabase.auth.signInWithIdToken({
                  provider: 'apple',
                  token: credential.identityToken,
                })
                console.log(JSON.stringify({ error, user }, null, 2))
                if (!error) {
                  // User is signed in.
                  const{
                    error,
                    data
                  } = await supabase.from('profiles').update({ profile_email : credential.email, first_name : credential.fullName }).eq('id', session?.user.id)
                }
              } else {
                throw new Error('No identityToken.')
              }
            } catch (e) {
              if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
  
        />
        ) : <></>}
      </View>
    </View>
  )
}

export default SignUp