// src/lib/cognito.mock.ts
export async function initiatePasswordlessAuth() {
  return {
    Session: 'stub-session',
    $metadata: { httpStatusCode: 200 },
  }
}

export async function respondToEmailOtp() {
  return {
    AuthenticationResult: { IdToken: 'stub-token' },
    $metadata: { httpStatusCode: 200 },
  }
}

/* stub the other helpers your code may import */
export const signUp = async () => ({})
export const signIn = async () => ({})
export const confirmUserSignUp = async () => ({})
export const checkIfUserExists = async () => false
