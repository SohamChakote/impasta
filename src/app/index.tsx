import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
// import { AdManager } from '@/backend/adManager';

export default function AppIndex() {
    // useEffect(() => {
    //     AdManager.initialize();
    // }, []);

    // This instantly routes the user from the root app launch to your actual Title Screen
    return <Redirect href="/screens/TitleScreen" />;
}