import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventory.findMany()
    return Response.json({ items })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'An error occurred' }, { status: 400 });
  }
}