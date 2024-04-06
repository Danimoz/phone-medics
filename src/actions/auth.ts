'use server';

import prisma from "@/lib/prisma";
import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!email || !password || !firstName || !lastName) {
    return { message: "All fields are required", status: 400 };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    if (existingUser) {
      return { message: "User already exists", status: 400 };
    }
  
    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName }
    });

    return { message: "User Successfully Created", status: 201 }
  } catch (error) {
    console.error(error)
    return { message: 'Could not create user at this time', status: 400 }
  }
}

async function encryptSession(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)
}

async function decryptSession(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"]
  });
  return payload;
} 

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: "All fields are required", status: 400 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return { message: "Invalid credentials", status: 400 };
    }
  
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return { message: "Invalid credentials", status: 400 };
    }
  
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const session = await encryptSession({ user: {
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin
    }, expires });
  
    cookies().set('currentUser', session, { expires, httpOnly: true });
    return { message: "User Successfully Logged In", status: 200 }
  } catch (error) {
    console.error(error)
    return { message: 'Could not login user at this time', status: 400 }
  }
}


export async function signOut() {
  cookies().set('currentUser', '', { expires: new Date(0), httpOnly: true });
  return { message: "User Successfully Logged Out", status: 200 }
}

export async function getSession() {
  const session = cookies().get("currentUser")?.value;
  if (!session) return null;
  return await decryptSession(session);
}


export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("currentUser")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decryptSession(session);
  parsed.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const res = NextResponse.next();
  res.cookies.set({
    name: "currentUser",
    value: await encryptSession(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

export async function getStaffs(page: number, search?: string) {
  try {
    const where:any = {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    };

    const staffs = await prisma.user.findMany({
      where: search ?  where  : {},
      skip: (page - 1) * 40,
      take: 40
    });

    const hasPreviousPage = page > 1;
    const hasNextPage = staffs.length === 40;
    return { staffs, hasPreviousPage, hasNextPage, status: 200 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't fetch Staffs at this time. Try again later", status: 400 }
  }
}