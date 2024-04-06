import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./form";

export default function Login(){
  return (
    <main className="min-h-screen flex w-full justify-center items-center">
      <Card className="w-full max-w-3xl px-4 shadow-2xl">
        <CardHeader className="border-b-2 flex items-center">
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}