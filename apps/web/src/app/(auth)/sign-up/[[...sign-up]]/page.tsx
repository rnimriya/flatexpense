import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
      <SignUp 
        path="/sign-up" 
        routing="path" 
        signInUrl="/sign-in" 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            card: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            dividerText: 'text-muted-foreground',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-white/5 border-white/10 text-foreground focus:ring-primary',
            footerActionLink: 'text-primary hover:text-primary/90',
            socialButtonsBlockButton: 'bg-white/5 border-white/10 text-foreground hover:bg-white/10',
            socialButtonsBlockButtonText: 'text-foreground',
          }
        }}
      />
    </div>
  );
}
