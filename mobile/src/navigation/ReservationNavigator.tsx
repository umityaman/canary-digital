import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReservationListScreen from '../screens/reservations/ReservationListScreen';
import ReservationDetailScreen from '../screens/reservations/ReservationDetailScreen';
import CreateReservationScreen from '../screens/reservations/CreateReservationScreen';
import { ReservationStackParamList } from '../types';
import { colors } from '../constants/colors';

const Stack = createStackNavigator<ReservationStackParamList>();

const ReservationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ReservationList"
        component={ReservationListScreen}
        options={{ title: 'Rezervasyonlar' }}
      />
      <Stack.Screen
        name="ReservationDetail"
        component={ReservationDetailScreen}
        options={{ title: 'Rezervasyon Detayı' }}
      />
      <Stack.Screen
        name="CreateReservation"
        component={CreateReservationScreen}
        options={{ title: 'Yeni Rezervasyon' }}
      />
    </Stack.Navigator>
  );
};

export default ReservationNavigator;
