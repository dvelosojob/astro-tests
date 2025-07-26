const datadogConfig = {
  applicationId: import.meta.env.PUBLIC_APPLICATION_ID,
  clientToken: import.meta.env.PUBLIC_CLIENT_TOKEN,
  site: "datadoghq.com",
  service: "test",
  env: "development",
  version: "0.0.1",
};

const config = {
  datadog: datadogConfig,
};

export default config;
