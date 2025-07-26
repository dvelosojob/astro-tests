const datadogConfig = {
  applicationId: import.meta.env.PUBLIC_APPLICATION_ID,
  clientToken: import.meta.env.PUBLIC_CLIENT_TOKEN,
  site: "datadoghq.com",
  service: "test",
  env: "production",
  version: "0.0.1",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  defaultPrivacyLevel: "mask-user-input",
};

const config = {
  datadog: datadogConfig,
};

export default config;
