'use client';

import { signUp } from "@/actions/auth";
import SubmitButton from "@/components/elements/submitbutton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import { useRef } from "react";

const initialState = {
  message: "",
  status: 0
}

export default function SignUpForm(){
  const [message, dispatch] = useFormState(signUp, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  if (message?.status === 201) {
    formRef.current?.reset();
    alert(message.message);
  }

  return (
    <form className="my-4" action={dispatch} ref={formRef}>
      <p aria-live="polite" className="sr-only">
        {message?.message}
      </p>

      <div className="mb-3">
        <Label htmlFor="firstName" className="text-lg mb-1">First Name</Label>
        <Input id='firstName' type="text" name='firstName' placeholder="Enter First Name" required />
      </div>
      <div className="mb-3">
        <Label htmlFor="lastName" className="text-lg mb-1">Last Name</Label>
        <Input id='lastName' type="text" name='lastName' placeholder="Enter Last Name" required />
      </div>
      <div className="mb-3">
        <Label htmlFor="email" className="text-lg mb-1">Email</Label>
        <Input id='email' type="email" name='email' placeholder="Enter email" required />
      </div>
      <div className="mb-3">
        <Label htmlFor="password" className="text-lg mb-1">Password</Label>
        <Input id='password' type="password" name='password' placeholder="Enter Password" required />
      </div>

      <SubmitButton buttonText="SignUp" />
    </form>
  )
}