import { Redirect } from 'expo-router';

export default function AppIndex() {
    // This instantly routes the user from the root app launch to your actual Title Screen
    return <Redirect href="/screens/TitleScreen" />;
}