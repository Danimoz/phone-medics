import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const repairables = await prisma.repairable.findMany()
    return Response.json({ repairables, status: 200 });
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'An error occurred' }, { status: 400 });
  }
}