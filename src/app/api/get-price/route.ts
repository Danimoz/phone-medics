import prisma from "@/lib/prisma";

export async function GET(request: Request){
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  try {
    const item = await prisma.inventory.findUnique({
      where: { id: Number(productId) }
    });

    return Response.json({ price: item?.price })

  } catch(error) {
    return Response.json({ error: 'An error occurred' }, { status: 400 })
  }
}