import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export async function playTtsFromBase64(
  audioBase64: string,
  mimeType: string
) {
  try {
    const fileUri =
      FileSystem.cacheDirectory + `rose-tts.${mimeType.split("/")[1]}`;

    await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });

    await sound.playAsync();
  } catch (err) {
    console.error("TTS error:", err);
  }
}
