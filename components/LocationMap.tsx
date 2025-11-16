import * as Location from 'expo-location';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView from 'react-native-maps';
import "../global.css";

export default function LocationMap() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        (async () => {
            try {
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                // Get initial location
                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation);
                setLoading(false);

                // Watch for location changes
                subscriptionRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 1000, // Update every second
                        distanceInterval: 1, // Update every meter
                    },
                    (newLocation) => {
                        setLocation(newLocation);
                    }
                );
            } catch (err) {
                setError('Failed to get location');
                setLoading(false);
            }
        })();

        // Cleanup: remove subscription when component unmounts
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
        };
    }, []);

    // Log location whenever it changes
    useEffect(() => {
        if (location) {
            const { latitude, longitude } = location.coords;
            // console.log(`Location updated - Latitude: ${latitude}, Longitude: ${longitude}`);
        }
    }, [location]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
                <Text className="mt-2.5 text-base">Finding your location...</Text>
            </View>
        );
    }

    if (error || !location) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-base text-red-500 text-center">{error || 'Location not available'}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <MapView
                provider="google"
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            />
        </View>
    );
}

