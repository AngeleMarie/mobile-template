import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { CustomButtonProps } from "@/types";

const CustomButton = ({
  containerStyle,
  iconRight = <ChevronRight size={20} color="#0961F5" />,
  onPress,
  title,
  textStyle = "text-white text-center font-semibold ",
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex flex-row items-center relative rounded-full p-2 ${containerStyle}`}
    >
      <Text className={`font-medium text-lg   ${textStyle}`}>
        {title}
      </Text>

      <View className="ml-3 w-10 h-10 rounded-full right-3 bg-white absolute items-center justify-center">
        {iconRight}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
