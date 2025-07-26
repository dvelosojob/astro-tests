import { Button as ButtonBase } from '@/components/ui/button'

type CustomProps = {
  variant?: 'contained' | 'outline' | 'link'
  children: React.ReactNode
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  isLoading?: boolean
  isDisabled?: boolean
}

type ButtonProps = CustomProps & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = (props: ButtonProps) => {
  const { isDisabled, isLoading, ...rest } = props
  return <ButtonBase {...rest} disabled={isDisabled || isLoading} />
}

export default Button
