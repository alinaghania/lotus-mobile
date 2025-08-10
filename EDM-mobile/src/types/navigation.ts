import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Home: undefined;
  Analytics: undefined;
  Tracking: undefined;
  Profile: undefined;
  Levels: undefined;
  DigestiveScreen: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export type TabParamList = {
  Home: undefined;
  Analytics: undefined;
  Tracking: undefined;
  Profile: undefined;
}; 