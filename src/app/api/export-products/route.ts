import { getAllItems } from "@/actions/inventory";

export async function GET() {
  try {
    const { items } = await getAllItems();
    const products = items.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      price: product.price,
      quantity: product.quantity
    }));

    return Response.json({ products });
  }  catch(error) {
    console.error(error)
    return Response.json({ error: 'An error occurred' }, { status: 400 });
  }
}