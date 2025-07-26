import dev from './dev'
import prod from './prod'

function getEnv(env = import.meta.env.MODE) {
  if (env === 'production') {
    return prod
  }

  return dev
}

export default getEnv()
