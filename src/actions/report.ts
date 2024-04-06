import prisma from "@/lib/prisma"

export async function calculateDailySales({ startDate, endDate, page }: { startDate: string, endDate: string, page: number }) { 
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
        saleTicket: { include: { itemsSold: { include: { inventory: true }} }},
        repairTicket: { include: { itemUsedForRepair: { include: { inventory: true }} }}
      },
      skip: (page - 1) * 40,
      take: 40
    })

    const price = tickets.reduce((acc, ticket) => acc + ticket.price, 0)
    const amountPaid = tickets.reduce((acc, ticket) => acc + ticket.payment.reduce((acc, payment) => acc + payment.amount, 0), 0)

    const report = tickets.map((ticket) => {
      // check if ticket is a sale or repair then return the items sold or used for repair
      const items = ticket.saleTicket ? ticket.saleTicket.itemsSold : ticket.repairTicket?.itemUsedForRepair
      return {
        id: ticket.id,
        price: ticket.price,
        date: ticket.createdAt,
        items: items?.map((item) => item.inventory.name).join(', '),
        amountPaid: ticket.payment.reduce((acc, payment) => acc + payment.amount, 0)
      }
    })

    const hasNextPage = tickets.length === 40;
    const hasPreviousPage = page > 1;

    return { price, amountPaid, report, hasNextPage, hasPreviousPage }
  } catch (error) {
    console.error(error)
  }
}