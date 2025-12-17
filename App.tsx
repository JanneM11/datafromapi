import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { WeatherData } from './types/weatherDataTypes';

export default function App() {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)


  const getCurrentLocation = async(): Promise<void> => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log("Permission denied for location")
        setLoading(false)
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High})
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        
      })
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const fetchWeather = async () => {
      if (!location) {
        return
      }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.EXPO_PUBLIC_API_KEY}&units=metric&lang=fi`
      );
      const data: WeatherData = await response.json()
      setWeather(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location) {
      fetchWeather()
    }
  }, [location])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sään hakusovellus</Text>
      
      <Button title='Hae paikka ja sää' onPress={getCurrentLocation} />
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      )}
      {weather && !loading && (
        <View style={{ marginTop: 20 }}>
          <Text>Paikka: {weather.name}</Text>
          <Text>Lämpötila: {weather.main.temp} °C</Text>
          <Text>Kuvaus: {weather.weather[0].description}</Text>
          <Text>Tuulennopeus: {weather.wind.speed} m/s</Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
            style={{ width: 100, height: 100 }}
          />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
