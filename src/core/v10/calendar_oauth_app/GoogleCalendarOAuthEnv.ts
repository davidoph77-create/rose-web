export function getGoogleAndroidClientId(): string {
  return (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "").trim();
}

export function hasGoogleAndroidClientId(): boolean {
  return getGoogleAndroidClientId().length > 20;
}
