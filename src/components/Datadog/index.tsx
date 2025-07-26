import {
  datadogRum,
  DefaultPrivacyLevel,
  type RumInitConfiguration,
} from '@datadog/browser-rum'
import { useEffect } from 'react'

import env from '@/configs/env'

const datadogConfig: RumInitConfiguration = {
  applicationId: env.datadog.applicationId,
  clientToken: env.datadog.clientToken,
  // `site` refers to the Datadog site parameter of your organization
  // see https://docs.datadoghq.com/getting_started/site/
  site: 'datadoghq.com',
  service: env.datadog.service,
  env: env.datadog.env,
  version: env.datadog.version,
}

if (env.datadog.env === 'production') {
  datadogConfig.sessionSampleRate = env.datadog.sessionSampleRate!
  datadogConfig.sessionReplaySampleRate = env.datadog.sessionReplaySampleRate!
  datadogConfig.defaultPrivacyLevel = env.datadog
    .defaultPrivacyLevel! as DefaultPrivacyLevel
}

export default function DatadogTracker() {
  useEffect(() => {
    datadogRum.init(datadogConfig)
  }, [])

  return null
}
