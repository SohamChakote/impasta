import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from hiding until the font loads
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    // Loading multiple weights so you have options for titles vs standard text
    const [loaded, error] = useFonts({
        'Iosevka-Charon-Regular': require('../../assets/fonts/Iosevka_Charon/IosevkaCharon-Regular.ttf'),
        'Iosevka-Charon-Medium': require('../../assets/fonts/Iosevka_Charon/IosevkaCharon-Medium.ttf'),
        'Iosevka-Charon-Bold': require('../../assets/fonts/Iosevka_Charon/IosevkaCharon-Bold.ttf'),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}