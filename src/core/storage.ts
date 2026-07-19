import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY } from "./constants";

export async function saveRoseData(data: any): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
    return true;
  } catch (error) {
    console.error("Erreur sauvegarde locale :", error);
    return false;
  }
}

export async function loadRoseData(): Promise<any | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Erreur lecture locale :", error);
    return null;
  }
}

export async function clearRoseData(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Erreur suppression locale :", error);
    return false;
  }
}