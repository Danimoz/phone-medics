import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

  const start = new Date(startDate)
  const end = new Date(endDate)

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      include: {
        payment: true,
        customer: true,
        saleTicket: { include: { itemsSold: { include: { inventory: true }} }},
        repairTicket: { include: { itemUsedForRepair: { include: { inventory: true }} }}
      }
    })

    const report = tickets.map((ticket) => {
      const items = ticket.saleTicket
        ? ticket.saleTicket.itemsSold
        : ticket.repairTicket?.itemUsedForRepair;
      
      const costPrice = items?.reduce((acc, item) => acc + item.inventory.costPrice, 0);
      const profit = ticket.price - costPrice!;

      return {
        date: ticket.createdAt,
        id: ticket.id,
        customer: ticket.customer?.firstName + ' ' + ticket.customer?.lastName,
        items: items?.map((item) => item.inventory.name).join(' '),
        costPrice,
        price: ticket.price,
        amountPaid: ticket.payment.reduce((acc, payment) => acc + payment.amount, 0),
        profit,
      };
    });

    return Response.json({ report });
  } catch(error) {
    console.error(error)
    return Response.json({ error: 'An error occurred' }, { status: 400 });
  }
}