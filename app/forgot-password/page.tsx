"use client";

import { useState } from "react";
import {
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { requestPasswordReset, ApiError } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestPasswordReset(email);

      if (response.success) {
        setSuccess(true);
        setEmail(""); // Clear the email field
      } else {
        setError(response.message || "Failed to send reset link");
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
                  <h1 className="text-2xl font-bold">Check your email</h1>
                  <p className="text-muted-foreground">
                    We&apos;ve sent a password reset link to your email address.
                    Please check your inbox and follow the instructions.
                  </p>
                </div>
                <div className="space-y-4">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 size-4" />
                      Back to Login
                    </Button>
                  </Link>
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Didn&apos;t receive the email? Try again
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password
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
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Send Reset Link
                </Button>

                <div className="text-center text-sm">
                  <Link
                    href="/login"
                    className="text-muted-foreground underline-offset-4 hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="size-3" />
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
          alt="Forgot password background image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          sizes="(max-width: 1024px) 0px, 50vw"
          priority
        />
      </div>
    </div>
  );
}
