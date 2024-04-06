import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from './form'
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function SignUp(){
  const { user } = await getSession()
  if (!user && !user.isAdmin ) {
    redirect('/login')
  }
  
  return (
    <main className="min-h-screen flex w-full justify-center items-center">
      <Card className="w-full max-w-3xl px-4 shadow-2xl">
        <CardHeader className="border-b-2 flex items-center">
          <CardTitle className="text-2xl">SignUp</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  )
}