import { SignIn } from "@clerk/clerk-react";
import { Zap } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Aczen Connect</h1>
      </div>
      <SignIn
        routing="path"
        path="/login"
        afterSignInUrl="/"
        signUpUrl="/signup"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-border",
          },
        }}
      />
    </div>
  );
}
