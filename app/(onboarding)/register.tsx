import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import CustomButton from '@/components/CustomButton';
import { Mail, Lock, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { firstName: '', lastName: '', email: '', password: '' };

    if (!firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.replace('/(onboarding)/login');
      }, 1500);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View className="items-center mt-6 mb-10">
            <Image
              source={require('@/assets/images/logo_blue.png')}
              className="w-32 h-10"
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View className="px-6 mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-base text-gray-600">Sign up to get started</Text>
          </View>

          {/* Form */}
          <View className="px-6 space-y-5">
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              errorText={errors.firstName}
              icon={<User size={20} color="#9CA3AF" />}
            />

            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              errorText={errors.lastName}
              icon={<User size={20} color="#9CA3AF" />}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              errorText={errors.email}
              icon={<Mail size={20} color="#9CA3AF" />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              errorText={errors.password}
              icon={<Lock size={20} color="#9CA3AF" />}
            />

            <CustomButton
              title={
                loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  'Register Now'
                )
              }
              containerStyle="w-[80%] text-center m-4 h-[54px]  justify-center bg-primary"
              onPress={handleRegister}
              disabled={loading}
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mt-auto mb-12 px-6">
            <Text className="text-gray-600 text-sm">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
                     <Text className="text-primary font-semibold text-sm ml-1"> Login</Text>
                   </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
