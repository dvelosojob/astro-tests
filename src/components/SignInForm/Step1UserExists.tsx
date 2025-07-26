import { Button } from "@/components/ui/button";
import { checkIfUserExists } from "@/lib/cognito";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import {
  errorMessages,
  Step,
  useLogin,
} from "@/components/providers/LoginProvider";
import { z } from "zod";
import { baseSchema } from ".";

const Step1UserExists: React.FC = () => {
  const { state, updateState } = useLogin();
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useFormContext<z.infer<typeof baseSchema>>();

  const onSubmitCheckEmail: SubmitHandler<z.infer<typeof baseSchema>> = async (
    data
  ) => {
    try {
      updateState("error", "");
      updateState("isLoading", true);
      const isUserExists = await checkIfUserExists(data.email);
      if (isUserExists) {
        updateState("step", Step.Step2SignIn);
      } else {
        updateState("step", Step.Step3SignUp);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message =
          errorMessages[err.name] ??
          "An error occurred during email check. Please try again.";
        updateState("error", message);
      }
    } finally {
      updateState("isLoading", false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-gray-900">Sign in to your account</p>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          {...register("email")}
          placeholder="Enter your email"
          type="email"
          className="w-full"
        />

        {errors.email?.message ? (
          <p className="text-red-800">{errors.email?.message?.toString()}</p>
        ) : null}
      </div>

      <Button
        disabled={state.isLoading || !isValid}
        onClick={handleSubmit(onSubmitCheckEmail)}
        type="button"
        form="signInForm"
      >
        {state.isLoading ? "Checking..." : "Continue"}
      </Button>
    </div>
  );
};

export default Step1UserExists;
