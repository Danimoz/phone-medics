'use client';

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";

export default function Logout() {
  const { replace } = useRouter();
  
  async function logout() {
    const res = await signOut();
    if (res.status !== 200) {
      toast.error('An error occurred');
      return
    }
    replace('/login');
  }

  return (
    <div className="p-3 ">
      <Button size='sm' variant='ghost' onClick={logout}>
        Logout
      </Button>
    </div>
  )
}