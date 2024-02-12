import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Audio } from "expo-av";
import * as Permissions from "expo-permissions";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Button,
  Alert,
  Platform,
  Dimensions,
  BackHandler,
  NativeModules,
} from "react-native";

//import RNExitApp from 'react-native-exit-app';

export default function App() {
  console.log(Dimensions.get("screen"));
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [AudioData, setAudioData] = useState(null);
  const HandleExit = () => {
    if (Platform.OS === "android") BackHandler.exitApp();
  };
  const playRecording = async () => {
    if (AudioData) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: AudioData });
        setAudioData(sound);
        await sound.playAsync();
      } catch (error) {
        console.error("Failed to play the recording", error);
      }
    } else {
      console.log("No recording available to play");
    }
  };

  const getAudioPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status !== "granted") {
      console.log("Permission denied for audio recording");
      // Handle permission denial
    }
  };

  const startRecording = async () => {
    await getAudioPermission();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true, // Enable recording on iOS
      playsInSilentModeIOS: true,

      allowsRecordingAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceIOS: false,
      playThroughEarpieceAndroid: false, // Set to false to enable stereo speaker playback // Allow playback in silent mode (if needed)
    });
    try {
      try {
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording", error);
      }
    } catch (error) {
      console.log("permission denied", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        allowsRecordingAndroid: false,
      });
      // Use `uri` to access the recorded audio file.
      console.log("Recording stopped, file URI:", uri);

      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        name: "test.3gp",
        type: "audio/3gp",
      });
      try {
        const res = await fetch("http://192.168.42.167:8000/send_audio/", {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });
        const json = await res.json();
      } catch (err) {
        alert(err);
      }

      setAudioData(uri); // Set the URI to state for later use in playing
      console.log("Recording stopped, URI:", uri);
      const { sound } = await recording.createNewLoadedSoundAsync(
        {},
        (status) => {
          if (status.didJustFinish) {
          }
        }
      );
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={[styles.container, ContainerStyle]}>
      <View
        style={{
          backgroundColor: "#1D3557",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "flex-start",
          paddingTop: 120,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 30,
            textAlign: "center",
          }}
        >
          Malayalam Speech To Text Converter
        </Text>
      </View>

      <View
        style={{
          width: "35%",
          height: "35%",
          position: "absolute",
          bottom: 0,
          left: "33%",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "#1D3557",
          flexDirection: "column",
          alignSelf: "center",
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            toggleRecording();
          }}
        >
          <Image
            style={{ width: 70, height: 70 }}
            source={require("./assets/mic.png")}
          />
        </TouchableOpacity>

        <Button
          color="#A8DADC"
          title="EXIT"
          onPress={() =>
            Alert.alert("EXIT", "Do You really want to exit the app?", [
              { text: "Yes", onPress: () => HandleExit() },
              { text: "No", onPress: () => console.log("No") },
            ])
          }
        />
        <Button
          color="#A8DADC"
          title="Play Recording"
          onPress={playRecording}
        />
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const ContainerStyle = { backgroundColor: "#1D3557" };
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#1D6557",

    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
  },
});
