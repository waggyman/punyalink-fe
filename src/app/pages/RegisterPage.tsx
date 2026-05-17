import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ApiError,
  confirmEmailOtp,
  fetchSubdomainAvailability,
  registerUser,
  resendEmailOtp,
} from "@/lib/api";
import { validateStoreSubdomain } from "@/lib/constants";
import { getBaseDomain, getStoreLoginUrl } from "@/lib/tenant";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type Step = "form" | "otp";

function subdomainIssueMessage(
  issue: NonNullable<ReturnType<typeof validateStoreSubdomain>>,
): string {
  switch (issue) {
    case "empty":
      return "Choose a subdomain.";
    case "charset":
      return "Use lowercase letters, numbers, and hyphens only.";
    case "length":
      return "Subdomain must be at least 3 characters.";
    case "reserved":
      return "That subdomain is reserved. Pick another.";
    default:
      return "Invalid subdomain.";
  }
}

export function RegisterPage() {
  const baseDomain = getBaseDomain();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  const [availLoading, setAvailLoading] = useState(false);
  const [availOk, setAvailOk] = useState<boolean | null>(null);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const normalizedSubdomain = subdomain.trim().toLowerCase();
  const subdomainIssue = validateStoreSubdomain(subdomain);

  useEffect(() => {
    if (subdomainIssue || !normalizedSubdomain) {
      setAvailOk(null);
      setAvailLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setAvailLoading(true);
      setError(null);
      try {
        const res = await fetchSubdomainAvailability(normalizedSubdomain);
        setAvailOk(res.available);
      } catch (err) {
        setAvailOk(null);
        if (err instanceof ApiError) {
          setError(err.message);
        }
      } finally {
        setAvailLoading(false);
      }
    }, 450);

    return () => window.clearTimeout(handle);
  }, [normalizedSubdomain, subdomainIssue]);

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const issue = validateStoreSubdomain(subdomain);
    if (issue) {
      setError(subdomainIssueMessage(issue));
      return;
    }
    if (availOk !== true) {
      setError(
        availOk === false
          ? "That subdomain is already taken."
          : "Check subdomain availability before continuing.",
      );
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerUser({
        email,
        name: trimmedName,
        subdomain: normalizedSubdomain,
      });
      setEmail(res.email);
      setSubdomain(res.subdomain);
      setOtpExpiresAt(res.otp_expired_at);
      setStep("otp");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Registration failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmEmailOtp({
        target: email,
        value: code,
        password,
      });
      window.location.assign(getStoreLoginUrl(subdomain.trim().toLowerCase()));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Verification failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResending(true);
    try {
      await resendEmailOtp(email);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not resend code.",
      );
    } finally {
      setResending(false);
    }
  }

  const previewUrl = normalizedSubdomain
    ? `https://${normalizedSubdomain}.${baseDomain}`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === "form" ? "Create your store" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            {step === "form"
              ? `Pick a subdomain on ${baseDomain} and your owner account details.`
              : `We sent a code to ${email}. Enter it below with a password for your account.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "form" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-name">Your name</Label>
                <Input
                  id="reg-name"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-subdomain">Store subdomain</Label>
                <div className="flex rounded-md border border-input bg-background overflow-hidden focus-within:ring-[3px] focus-within:ring-ring/50">
                  <Input
                    id="reg-subdomain"
                    className="border-0 rounded-none shadow-none focus-visible:ring-0"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="your-store"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(e.target.value.toLowerCase())
                    }
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground whitespace-nowrap border-l bg-muted/40">
                    .{baseDomain}
                  </span>
                </div>
                {subdomainIssue && subdomain.trim() !== "" && (
                  <p className="text-xs text-destructive">
                    {subdomainIssueMessage(subdomainIssue)}
                  </p>
                )}
                {!subdomainIssue && normalizedSubdomain && (
                  <p className="text-xs text-muted-foreground">
                    {availLoading
                      ? "Checking availability…"
                      : availOk === true
                        ? "This subdomain is available."
                        : availOk === false
                          ? "This subdomain is already taken."
                          : previewUrl
                            ? `Preview: ${previewUrl}`
                            : null}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
                Email delivery may be disabled in some API setups. If you do not
                receive a code, check your backend logs or database for the OTP
                while developing.
              </p>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  submitting ||
                  !!subdomainIssue ||
                  availLoading ||
                  availOk !== true
                }
              >
                {submitting ? "Creating…" : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {otpExpiresAt && (
                <p className="text-xs text-muted-foreground">
                  Code expires:{" "}
                  {new Date(otpExpiresAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp-code">Verification code</Label>
                <Input
                  id="otp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-password">Password</Label>
                <Input
                  id="otp-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-password2">Confirm password</Label>
                <Input
                  id="otp-password2"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Verifying…" : "Verify and open login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={resending}
                onClick={handleResend}
              >
                {resending ? "Sending…" : "Resend code"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground pt-2 border-t">
            <Link to="/" className="underline hover:text-foreground">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
