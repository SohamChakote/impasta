import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
    return (
        // This acts as the engine for your app, stacking screens on top of each other
        <Stack screenOptions={{ headerShown: false }}>
            {/* By setting headerShown: false, we hide that default grey bar with the
              settings button so your custom dark/light UI can take over completely.
            */}
        </Stack>
    );
}