import { SignInForm } from "@/components/SignInForm";
import { LoginProvider } from "@/components/providers/LoginProvider";

const SignIn: React.FC = () => {
  return (
    <LoginProvider>
      <SignInForm />
    </LoginProvider>
  );
};

export default SignIn;
