import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageHelper {

    // 1. Save the list of names as a single string (JSON.stringify)
    static async savePlayerNames(names: string[]) {
        try {
            const jsonValue = JSON.stringify(names);
            await AsyncStorage.setItem('saved_player_names', jsonValue);
        } catch (e) {
            console.error("Error saving names:", e);
        }
    }

    // 2. Load the list of names when the app/screen starts (JSON.parse)
    static async loadPlayerNames(): Promise<string[]> {
        try {
            const jsonValue = await AsyncStorage.getItem('saved_player_names');
            // If data exists, parse it back into an array. If not, return empty array.
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Error loading names:", e);
            return [];
        }
    }
}