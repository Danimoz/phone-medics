import prisma from "@/lib/prisma";
import { hash } from 'bcryptjs';
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  // This route creates admin users
  const { email, password, firstName, lastName } = await request.json()

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    if (existingUser) {
      return Response.json({ message: "User already exists"}, { status: 400});
    }
    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, isAdmin: true }
    });
    revalidatePath('/staff')
    return Response.json({ message: "Admin User Successfully Created"}, { status: 201 })
  } catch(error) {
    console.error(error)
    return Response.json({ message: 'Could not create user at this time' }, { status: 400 })
  }
}