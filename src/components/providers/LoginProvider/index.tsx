import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export const errorMessages: Record<string, string> = {
  UserNotFoundException: 'User not found. Please sign up.',
  LimitExceededException: 'Too many requests. Please try again later.',
  NotAuthorizedException: 'Invalid email or password. Please try again.',
  UserNotConfirmedException:
    'Please confirm your email address before signing in.',
  TooManyRequestsException: 'Too many failed attempts. Please try again later.',
  UsernameExistsException: 'User already exists. Please sign in.',
  CodeMismatchException: 'Invalid verification code. Please try again.',
}

export enum Step {
  Step1UserExists = 'Step1UserExists',
  Step2SignIn = 'Step2SignIn',
  Step3SignUp = 'Step3SignUp',
  Step4ConfirmSignUp = 'Step4ConfirmSignUp',
}

interface State {
  step: Step
  error: string
  isLoading: boolean
}

// Context interface
interface ContextType {
  state: State
  updateState: (key: keyof State, value: unknown) => void
}

// Create the context
const LoginContext = createContext<ContextType | undefined>(undefined)

// Provider component
interface ProviderProps {
  children: ReactNode
  initialState?: State
}

export const LoginProvider: React.FC<ProviderProps> = ({
  children,
  initialState = {
    step: Step.Step1UserExists,
    error: '',
    isLoading: false,
  },
}) => {
  const [state, setState] = useState<State>(initialState)

  const updateState = (key: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const value: ContextType = {
    state,
    updateState,
  }

  return (
    <LoginContext.Provider value={value} data-testid='login-provider'>
      {children}
    </LoginContext.Provider>
  )
}

// Custom hook to use the context
export const useLogin = (): ContextType => {
  const context = useContext(LoginContext)
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider')
  }
  return context
}

// Export the context for advanced usage
export { LoginContext }
