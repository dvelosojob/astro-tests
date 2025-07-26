import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Step1 from "./Step1UserExists";
import Step2 from "./Step2SignIn";
import Step3 from "./Step3SignUp";
import Step4 from "./Step4ConfirmSignUp";
import { Step, useLogin } from "@/components/providers/LoginProvider";

export const baseSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least 1 special character"
    )
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
});

export const formStep2Schema = baseSchema.merge(otpSchema);
export const formStep3Schema = baseSchema.merge(passwordSchema);
export const formStep4Schema = baseSchema
  .merge(otpSchema)
  .merge(passwordSchema);

type FormData =
  | z.infer<typeof baseSchema>
  | z.infer<typeof formStep2Schema>
  | z.infer<typeof formStep3Schema>
  | z.infer<typeof formStep4Schema>;

function getStepSchema(step: Step) {
  switch (step) {
    case Step.Step1UserExists:
      return baseSchema;
    case Step.Step2SignIn:
      return formStep2Schema;
    case Step.Step3SignUp:
      return formStep3Schema;
    case Step.Step4ConfirmSignUp:
      return formStep4Schema;
    default:
      return baseSchema;
  }
}

export const Form = () => {
  const { state } = useLogin();
  return (
    <div className="flex w-full flex-col gap-4">
      <form id="signInForm" role="form" className="flex flex-col gap-4">
        {state.step === Step.Step1UserExists && <Step1 />}
        {state.step === Step.Step2SignIn && <Step2 />}
        {state.step === Step.Step3SignUp && <Step3 />}
        {state.step === Step.Step4ConfirmSignUp && <Step4 />}
      </form>

      {state.error ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-300 bg-red-100 p-2 text-sm text-red-800 shadow-sm"
        >
          {state.error}
        </div>
      ) : null}
    </div>
  );
};

export const SignInForm = () => {
  const { state } = useLogin();
  const formMethods = useForm<FormData>({
    resolver: zodResolver(getStepSchema(state.step)),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      otp: "",
    },
  });

  console.log("errors===>", formMethods.formState.errors);
  return (
    <FormProvider {...formMethods}>
      <Form />
    </FormProvider>
  );
};
