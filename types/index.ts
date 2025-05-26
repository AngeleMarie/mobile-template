import { RefObject,ReactNode } from "react";
import { ButtonProps, TextInput, TextInputProps } from "react-native";



export interface CustomButtonProps extends Omit<ButtonProps, 'title'> {
    containerStyle: string;
    iconRight?: any;
    textStyle?: any;
    backgroundColor? : string;
    title?: ReactNode ;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  rating?: number;
  image?: string; 
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}


export type Toast = {
  id?: string; // optional, in case you manage multiple toasts
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // in milliseconds, optional
};



export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastType {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  icon?: React.ReactNode;
  timestamp?: string; 
}

export interface OAuthButtonProps extends ButtonProps {
    containerStyle: string;
    iconLeft?: any;
}
export interface User {
  id: number | string;
  email: string;
  password?: string;  // optional, maybe don't keep password in frontend state
  firstName: string;
  lastName: string;
  role?: string;
  avatarUrl: string;
  location?: string;  // Your sample user JSON doesn't have location, so optional
  createdAt?: string;
  updatedAt?: string;

}





export interface Booking {
  id: string;
  name: string;
  location: string;
  Date: string;
  status: string;
  Price: number;
  Duration: string;
  EntryTime: number;
  ExitTime: number;
}

export interface Parking {
  id: string;
  name: string;
  Price: number;
  parkingImage: string;
  availabeSpaces: number;
}


export interface CustomInputProps extends TextInputProps {
    iconLeft?: any;
    iconRight?: any;
    placeholder?: string;
    placeholderStyle?: string;
    containerStyle?: string;
    secureTextEntry?: boolean;
    onChangeText: (text:string)=>void
}

export  interface OTPInputProps {
    codes: string[];
    refs: RefObject<TextInput>[];
    errorMessages: string[] | undefined;
    onChangeCode: (text: string, index: number) => void;
  }
