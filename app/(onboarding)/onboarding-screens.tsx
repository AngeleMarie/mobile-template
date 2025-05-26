import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { router } from 'expo-router';
import { ChevronLeft, ChevronLeftBlue } from '@/assets/svgs';
import CustomButton from '@/components/CustomButton';
import { data } from '@/components/constants';

const { width } = Dimensions.get('window');

const Onboarding = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);
  const lastIndex = activeIndex === data.onboarding.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top bar with Skip button */}
        <View className="flex-row justify-end px-6 mt-4">
          <TouchableOpacity onPress={() => router.push('/(onboarding)/login')}>
            <Text className="text-dark font-semibold underline text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View className="items-center mt-4 mb-2">
          <Image
            source={require("@/assets/images/logo_blue.png")}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
        </View>

        {/* Swiper Content */}
        <View className="flex-1">
          <Swiper
            ref={swiperRef}
            onIndexChanged={setActiveIndex}
            loop={false}
            dotColor="#D5E2F5"
            activeDotColor="#0961F5"
            activeDotStyle={{ width: 20 }}
            paginationStyle={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {data.onboarding.map((item) => (
              <View key={item.id} className="flex-1 justify-center items-center px-6">
                <Image
                  source={item.image}
                  style={{
                    width: width * 0.75,
                    height: width * 0.75,
                    marginBottom: 32,
                  }}
                  resizeMode="contain"
                />
                <Text className="text-dark font-semibold text-2xl text-center mb-3 capitalize">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-sm text-center leading-relaxed max-w-[90%]">
                  {item.description}
                </Text>
              </View>
            ))}
          </Swiper>

          {/* Navigation button */}
          <View className="items-center mb-8 ">
            {lastIndex ? (
              
              <CustomButton
                containerStyle="w-[80%] max-w-[260px] h-[48px] bg-primary justify-center pl-8 items-center"
                title="Get Started"
                textStyle="text-white text-center text-base font-semibold"
            
                onPress={() => router.push('/(onboarding)/login')}
              />
            ) : (
              <TouchableOpacity
                className="w-[40px] h-[40px] rounded-full bg-primary items-center justify-center"
                onPress={() => swiperRef.current?.scrollBy(1)}
              >
                <ChevronLeft  className='h-6'/>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
