'use client';

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { LoaderIcon } from "lucide-react";

interface SubmitButtonProps {
  buttonText: string;
}

export default function SubmitButton({ buttonText }: SubmitButtonProps){
  const { pending } = useFormStatus();
  
  return (
    <Button disabled={pending} className="w-full" type='submit'>
      { pending ? (
        <>
          <LoaderIcon className='animate-spin mr-4 h-4 w-4' />
          {buttonText}
        </>
      ) : buttonText }
    </Button>
  )
}