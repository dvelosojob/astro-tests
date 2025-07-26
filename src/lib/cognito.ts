import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AuthFlowType,
  ConfirmSignUpCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const REGION = import.meta.env.PUBLIC_COGNITO_REGION
const CLIENT_ID = import.meta.env.PUBLIC_COGNITO_CLIENT_ID

const client = new CognitoIdentityProviderClient({ region: REGION })

export async function signUp({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name: string
}) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,

    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'name',
        Value: name,
      },
    ],
  })

  return await client.send(command)
}

export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  })

  const response = await client.send(command)
  if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
    const challengeCommand = new RespondToAuthChallengeCommand({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: CLIENT_ID,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: password,
      },
      Session: response.Session,
    })

    const finalResponse = await client.send(challengeCommand)
    return finalResponse.AuthenticationResult?.IdToken
  }

  const idToken = response.AuthenticationResult?.IdToken
  return idToken
}

export async function confirmUserSignUp({
  code,
  email,
}: {
  email: string
  code: string
}) {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    ConfirmationCode: code,
    Username: email,
  })

  return await client.send(command)
}

export async function checkIfUserExists(email: string) {
  const command = new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  })

  try {
    await client.send(command)
    return true
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'UserNotFoundException') {
      return false
    }
    throw err
  }
}

export async function initiatePasswordlessAuth(email: string) {
  const initAuthCommand = new InitiateAuthCommand({
    AuthFlow: 'USER_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PREFERRED_CHALLENGE: 'EMAIL_OTP' },
  })

  return await client.send(initAuthCommand)
}

export async function respondToEmailOtp({
  email,
  session,
  otp,
}: {
  email: string
  session: string
  otp: string
}) {
  const challengeCommand = new RespondToAuthChallengeCommand({
    ChallengeName: 'EMAIL_OTP',
    ClientId: CLIENT_ID,
    Session: session,
    ChallengeResponses: {
      EMAIL_OTP_CODE: otp,
      USERNAME: email,
    },
  })

  return await client.send(challengeCommand)
}
