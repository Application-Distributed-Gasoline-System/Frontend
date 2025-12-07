"use client";

import { useState, useEffect, Suspense } from "react";
import { Building2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { resetPassword, ApiError } from "@/lib/api/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    if (!newPassword) {
      setError("Password is required");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await resetPassword(token, newPassword);

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Building2 className="size-4" />
            </div>
            Fuel System
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                      <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold">Password Reset Successful</h1>
                  <p className="text-muted-foreground">
                    Your password has been successfully reset. You will be redirected to
                    the login page in a few seconds.
                  </p>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive rounded-md p-3 flex items-start gap-2 text-sm">
                    <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <Input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading || !token}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading || !token}
                      required
                    />
                  </Field>
                </FieldGroup>

                <div className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !token}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Reset Password
                </Button>

                <div className="text-center text-sm space-y-2">
                  <Link
                    href="/forgot-password"
                    className="block text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Request a new reset link
                  </Link>
                  <Link
                    href="/login"
                    className="block text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.jpeg"
          alt="Reset password background image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          sizes="(max-width: 1024px) 0px, 50vw"
          priority
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <Loader2 className="size-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
