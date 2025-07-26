import { Button } from "@/components/ui/button";
import { confirmUserSignUp, signIn } from "@/lib/cognito";
import {
  Controller,
  useFormContext,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { formStep4Schema } from "./index";
import { errorMessages, useLogin } from "@/components/providers/LoginProvider";

const Step4ConfirmSignUp: React.FC = () => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    control,
  } = useFormContext<z.infer<typeof formStep4Schema>>();

  const { state, updateState } = useLogin();

  const onSubmitConfirm: SubmitHandler<
    z.infer<typeof formStep4Schema>
  > = async (data) => {
    updateState("error", "");
    updateState("isLoading", true);

    try {
      try {
        await confirmUserSignUp({
          email: data.email,
          code: data.otp,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          const message =
            errorMessages[err.name] ??
            "An error occurred during sign in. Please try again.";
          updateState("error", message);
        }
      }
      const response = await signIn({
        email: data.email,
        password: data.password,
      });

      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response }),
      });

      window.location.href = "/checkout";
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
        Enter the code sent to your email to confirm your account
      </p>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          {...register("email")}
          placeholder="Enter your email"
          id="email"
        />
        {errors.email?.message ? (
          <p className="text-red-800">{errors.email?.message?.toString()}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="otp"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Verification code
        </label>
        <input
          {...register("otp")}
          placeholder="Enter your verification code"
          id="otp"
        />
        {errors.otp?.message ? (
          <p className="text-red-800">{errors.otp?.message?.toString()}</p>
        ) : null}
      </div>

      <Button
        fullWidth
        disabled={state.isLoading || !isValid}
        type="button"
        onClick={handleSubmit(onSubmitConfirm)}
      >
        {state.isLoading ? "Submitting..." : "Continue"}
      </Button>
    </div>
  );
};

export default Step4ConfirmSignUp;
