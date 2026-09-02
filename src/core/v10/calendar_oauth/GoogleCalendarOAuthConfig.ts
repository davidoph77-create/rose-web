export type GoogleCalendarOAuthConfig = {
  clientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

let config: GoogleCalendarOAuthConfig = {};

export function configureGoogleCalendarOAuth(next: GoogleCalendarOAuthConfig) {
  config = { ...config, ...next };
  return getGoogleCalendarOAuthConfig();
}

export function getGoogleCalendarOAuthConfig(): GoogleCalendarOAuthConfig {
  return { ...config };
}

export function hasGoogleCalendarOAuthClientId() {
  return Boolean(
    config.clientId ||
    config.androidClientId ||
    config.iosClientId ||
    config.webClientId
  );
}
