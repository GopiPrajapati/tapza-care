import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared AsyncStorage adapter for persisted Zustand stores. */
export const persistStorage = createJSONStorage(() => AsyncStorage);
