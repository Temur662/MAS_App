import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";
import * as Animatable from 'react-native-animatable';
import { AccessibilityInfo, TouchableOpacity, View, Text } from "react-native"
import { useEffect, useRef } from "react"
import TabArray from './tabArray';
import { TabArrayType } from '@/src/types';
import { Icon } from "react-native-paper";
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
function TabBarIcon(props: {
  source: string;
  color: string;
}) {
  return <Icon size={20} {...props} />;
}

const animate1 = {0 : {scale: .5, translateY : 0} ,1: {scale: 1.2, translateY: -5}}
const animate2 = {0 : {scale: 1.2, translateY: 0}, 1: {scale: 1, translateY: 20}}

type TabButtonProps = {
  props : BottomTabBarButtonProps,
  items : TabArrayType
}

const TabButton = ({props ,items} : TabButtonProps) => {
  const { onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected
  const viewRef = useRef<any>(null)
  const textRef = useRef<any>(null)

  useEffect(() => {
    if(focused) {
      viewRef.current?.animate(animate1)
      textRef.current.transitionTo({scale: 1})
    }else{
      viewRef.current?.animate(animate2)
      textRef.current.transitionTo({scale: 0})

    }

  }
  , [focused])
  return(
    <TouchableOpacity
    onPress={onPress}
    style={{ alignItems: "center", justifyContent: "center", flex : 1}}
    >
    <Animatable.View ref={viewRef} className='justify-center items-center' style={{width : 30, height: 30, borderRadius: 25, borderWidth: 4, backgroundColor: "white", borderColor: "white", justifyContent: "center", alignItems: "center"}} animation="zoomIn" duration={1000}>
      <Icon source={items?.icon}  size={20} color={ focused ? "#57BA47" : "#0D509D"}/>
    </Animatable.View>
    <Animatable.Text ref={textRef} style={{fontSize: 14, color: "black", textAlign: "center", paddingTop : 2, fontWeight: "bold"}}>
      {items?.title ? items?.title : "\n"}
    </Animatable.Text>
    </TouchableOpacity>
  )
}
export default function TabLayout() {

  return (
    <Tabs 
    screenOptions={{
      tabBarStyle : {backgroundColor: "white", height: 50, position: "absolute",bottom: 16, right: 16, left: 16, borderRadius: 16, marginBottom: 5, shadowColor:"black", shadowOffset: { width: 0, height: 0},shadowOpacity: 1, shadowRadius: 8, justifyContent: "center", alignItems : "center", flex:1},
      tabBarItemStyle: { height: 40 }
    }}
    >

      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="tabArray" options={{ href: null}} />

      {TabArray.map((tab, i) => {
        return(
          <Tabs.Screen 
          key={i}
            name={tab.name}
            options={{
              title: tab.title,
              headerShown : false,
              tabBarIcon: ( {color} ) =>(
                <TabBarIcon source={tab.icon} color={color} />
              ),
              tabBarButton: (props) => <TabButton items={TabArray[i]} props={{...props}}/>
            }}
          />
        )
      }) }
      { /*<Tabs.Screen
        name="menu"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen 
        name="myPrograms"
        options={ {
          title: "My Library",
          headerShown:  false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name='book' color={color} />
          ),
        }}
        />

      <Tabs.Screen 
        name="prayersTable"
        options={ {
          title: "Prayer Times",
          headerShown: false,
          tabBarIcon: ( {color} ) =>(
            <TabBarIcon name="clock-o" color={color} />
          )
        }}
      />
      
      <Tabs.Screen 
              name="more"
              options={ {
                title: "More",
                headerShown: false,
                tabBarButton : (props) => <TabButton items={TabArray[3]} props={{...props}} />
              }}
            /> */ }
    </Tabs>
  );
}
