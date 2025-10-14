import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EquipmentListScreen from '../screens/equipment/EquipmentListScreen';
import EquipmentDetailScreen from '../screens/equipment/EquipmentDetailScreen';
import ScannerScreen from '../screens/scanner/ScannerScreen';
import { EquipmentStackParamList } from '../types';
import { colors } from '../constants/colors';

const Stack = createStackNavigator<EquipmentStackParamList>();

const EquipmentNavigator = () => {
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
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: 'Ekipmanlar' }}
      />
      <Stack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{ title: 'Ekipman Detayı' }}
      />
      <Stack.Screen
        name="QRScanner"
        component={ScannerScreen}
        options={{ 
          title: 'QR Kod Tara',
          headerShown: false // ScannerScreen kendi header'ını kullanıyor
        }}
      />
    </Stack.Navigator>
  );
};

export default EquipmentNavigator;
