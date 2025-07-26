import { Button } from "@/components/ui/button";
import { initiatePasswordlessAuth, respondToEmailOtp } from "@/lib/cognito";
import { useEffect, useState } from "react";
import { useFormContext, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { formStep2Schema } from "./index";
import { errorMessages, useLogin } from "@/components/providers/LoginProvider";

const Step2SignIn: React.FC = () => {
  const { state, updateState } = useLogin();
  const [session, setSession] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    watch,
  } = useFormContext<z.infer<typeof formStep2Schema>>();

  const email = watch("email");

  useEffect(() => {
    const fetchSession = async () => {
      if (email) {
        const result = await initiatePasswordlessAuth(email).catch((err) => {
          if (err instanceof Error) {
            updateState("error", err.message);
          }
        });

        if (result) {
          setSession(result.Session ?? null);
        }
      }
    };
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitSignIn: SubmitHandler<z.infer<typeof formStep2Schema>> = async (
    data
  ) => {
    updateState("error", "");
    updateState("isLoading", true);

    if (!session) {
      updateState("error", "Session not found");
      updateState("isLoading", false);
      return;
    }

    if (!data.otp) {
      updateState("error", "OTP code is required");
      updateState("isLoading", false);
      return;
    }

    try {
      const result = await respondToEmailOtp({
        email: data.email,
        otp: data.otp,
        session,
      });

      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.AuthenticationResult?.IdToken,
        }),
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
      <p className="text-gray-900">Enter the code sent to your email</p>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          readOnly={!!email}
          disabled={!!email}
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
          Authentication code
        </label>
        <input
          {...register("otp")}
          placeholder="Enter your authentication code"
          id="otp"
        />

        {errors.otp?.message ? (
          <p className="text-red-800">{errors.otp?.message?.toString()}</p>
        ) : null}
      </div>

      <Button
        fullWidth
        disabled={state.isLoading || !session}
        type="button"
        onClick={handleSubmit(onSubmitSignIn)}
      >
        {state.isLoading ? "Submitting..." : "Continue"}
      </Button>
    </div>
  );
};

export default Step2SignIn;
