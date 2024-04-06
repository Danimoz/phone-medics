'use client';

import { signIn } from "@/actions/auth";
import SubmitButton from "@/components/elements/submitbutton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

const initialState = {
  message: "",
  status: 0
}

export default function LoginForm() {
  const [message, dispatch] = useFormState(signIn, initialState);
  const router = useRouter();

  if (message?.status === 200) {
    router.push('/');
  }

  return (
    <form className="my-4" action={dispatch}>
      <p aria-live="polite" className="sr-only">
        {message?.message}
      </p>

      <div className="mb-3">
        <Label htmlFor="email" className="text-lg mb-1s">Email</Label>
        <Input id='email' type="email" name='email' placeholder="Enter your email" />
      </div>
      <div className="mb-3">
        <Label htmlFor="password" className="text-lg mb-1s">Password</Label>
        <Input id='password' type="password" name='password' placeholder="Enter your Password" />
      </div>

      <SubmitButton buttonText="Login" />
    </form>
  )
}