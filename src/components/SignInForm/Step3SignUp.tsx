import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/cognito";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { formStep3Schema } from "./index";
import {
  errorMessages,
  Step,
  useLogin,
} from "@/components/providers/LoginProvider";

const Step3SignUp: React.FC = () => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useFormContext<z.infer<typeof formStep3Schema>>();

  const { state, updateState } = useLogin();

  const onSubmitSignUp: SubmitHandler<z.infer<typeof formStep3Schema>> = async (
    data
  ) => {
    updateState("error", "");
    updateState("isLoading", true);

    try {
      const response = await signUp({
        email: data.email,
        password: data.password,
        name: data.email,
      });

      if (
        response.CodeDeliveryDetails &&
        response.CodeDeliveryDetails.DeliveryMedium === "EMAIL"
      ) {
        updateState("step", Step.Step4ConfirmSignUp);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message =
          errorMessages[err.name] ??
          "An error occurred during sign in. Please try again.";
        updateState("error", message);
      }
    } finally {
      updateState("isLoading", false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-900">
        You don&apos;t have an account yet. Create one to get started.
      </p>
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
        />
        {errors.email?.message ? (
          <p className="text-red-800">{errors.email?.message?.toString()}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          placeholder="Enter your password"
        />
        {errors.password?.message ? (
          <p className="text-red-800">{errors.password?.message?.toString()}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          fullWidth
          disabled={state.isLoading || !isValid}
          type="button"
          onClick={handleSubmit(onSubmitSignUp)}
        >
          {state.isLoading ? "Submitting..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default Step3SignUp;
