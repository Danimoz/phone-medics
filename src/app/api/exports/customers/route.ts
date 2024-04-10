import { getCustomers } from "@/actions/tickets";


export async function GET() {
  try {
    const customers = await getCustomers();
    return Response.json({ customers });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "An error occurred" }, { status: 400 });
  }
}