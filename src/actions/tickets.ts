'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { Prisma } from "@prisma/client";

interface saleData {
  customer: number;
  items: { id: number; quantity: number }[];
  services: { id: number, amount: number }[];
  payment: { price: number; method: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'; note?: string };
}

interface repairData {
  customer: number;
  products: { productName: string; quantity: number; productId: number,}[];
  services: { serviceName: string; id: number; amount: number }[];
  repairables: { repairableName: string; id: number; problem: string }[];
  payment: { amount: number; method: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'; note?: string };
}

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany()
    return customers
  } catch (error) {
    console.error(error)
  }
}

export async function getPaginatedCustomers(page: number, search?: string) {
  try {
    let customers;

    if (search) {
      customers = await prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        },
        include: { createdBy: true },
        skip: (page - 1) * 40,
        take: 40
      });
    } else {
      customers = await prisma.customer.findMany({
        skip: (page - 1) * 40,
        take: 40,
        include: { createdBy: true },
      });
    }

    const hasPreviousPage = page > 1;
    const hasNextPage = customers.length === 40;
    return { customers, hasPreviousPage, hasNextPage, status: 200 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't fetch Customers at this time. Try again later", status: 400 }
  }
}

export async function addCustomer(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  try {
    const { user } = await getSession();
    if (!user) {
      return { message: 'You are not authorized to perform this action', status: 401 }
    }
    const customer = await prisma.customer.create({
      data: { firstName, lastName, email, phone, userId: user.id }
    })

    revalidatePath('/tickets/new')
    revalidatePath('/customers')
    return { message: 'Customer added Successfully', status: 201, id: customer.id }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't add Customer at this time. Try again later", status: 400, id: 0 }
  }
}

export async function newSaleTicket(data: saleData) {
  try {
    const { user } = await getSession();
    if (!user) {
      return { message: 'You are not authorized to perform this action', status: 401 }
    }

    const quantityCheck = await prisma.inventory.findMany({
      where: { id: { in: data.items.map(item => item.id) } }
    })
          
    const invalidItems = quantityCheck.filter((item, index) => {
      return item.quantity < data.items[index].quantity;
    });
    
    // If there are any invalid items, return an error response
    if (invalidItems.length > 0) {
      return {
        message: invalidItems.map(item => `You can't sell more than ${item.quantity} of ${item.name}`).join(', '),
        status: 400
      };
    }

    await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          customerId: data.customer,
          sellerId: user.id,
          type: 'SALE',
          saleTicket: {
            create: {
              serviceForSale: {
                createMany: { data: data.services.map(service => ({ serviceId: service.id, amount: service.amount })) }
              },
              itemsSold: {
                createMany: { data: data.items.map(item => ({ inventoryId: item.id, quantity: item.quantity })) }
              },
            }
          },
          price: 0,
          payment: {
            create: {
              amount: data.payment.price,
              method: data.payment.method,
              note: data.payment.note
            }
          }
        },
        include: { saleTicket: { include: { itemsSold: { include: { inventory: true } }, serviceForSale: true } } }
      })

      const itemPrice = ticket.saleTicket?.itemsSold.reduce((acc, item) => acc + item.quantity * item.inventory.price, 0);
      const servicePrice = ticket.saleTicket?.serviceForSale.reduce((acc, service) => acc + service.amount, 0);
      const total_price = (itemPrice || 0) + (servicePrice || 0);

      const updatedInventoryQueries = data.items.map(item => ({
        where: { id: item.id },
        data: { quantity: { decrement: item.quantity } }
      }));

      await Promise.all(
        updatedInventoryQueries.map(query => tx.inventory.update({ ...query }))
      )

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { price: total_price }
      })

    })

    revalidatePath('/tickets')
    revalidatePath('/')

    return { message: 'Ticket created Successfully', status: 201 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't create Ticket at this time. Try again later", status: 400 }
  }
}


export async function newRepairTicket(data: repairData) { 
  try {
    const { user } = await getSession();
    if (!user) {
      return { message: 'You are not authorized to perform this action', status: 401 }
    }

    const quantityCheck = await prisma.inventory.findMany({
      where: { id: { in: data.products.map(item => item.productId) } }
    })
          
    const invalidItems = quantityCheck.filter((item, index) => {
      return item.quantity < data.products[index].quantity;
    });
    
    // If there are any invalid items, return an error response
    if (invalidItems.length > 0) {
      return {
        message: invalidItems.map(item => `You can't sell more than ${item.quantity} of ${item.name}`).join(', '),
        status: 400
      };
    }

    await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          customerId: data.customer,
          sellerId: user.id,
          type: 'REPAIR',
          repairTicket: {
            create: {
              repairable: {
                createMany: { data: data.repairables.map(repairable => ({ repairableId: repairable.id, problem: repairable.problem })) }
              },
              serviceForRepair: {
                createMany: { data: data.services.map(service => ({ serviceId: service.id, amount: service.amount })) }
              },
              itemUsedForRepair: {
                createMany: { data: data.products.map(product => ({ inventoryId: product.productId, quantity: product.quantity })) }
              },
            } 
          },
          price: 0,
          payment: {
            create: { amount: data.payment.amount, method: data.payment.method, note: data.payment.note }
          }
        },
        include: { repairTicket: { include: { repairable: true, serviceForRepair: true, itemUsedForRepair: { include: { inventory: true } } } } }
      })

      const servicePrice = ticket.repairTicket?.serviceForRepair.reduce((acc, service) => acc + service.amount, 0)
      const productPrice = ticket.repairTicket?.itemUsedForRepair.reduce((acc, item) => acc + item.quantity * item.inventory.price, 0);
      const totalPrice = (servicePrice || 0) + (productPrice || 0);

      const updatedInventoryQueries = data.products.map( item => ({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      }));

      await Promise.all(
        updatedInventoryQueries.map(query => tx.inventory.update({ ...query }))
      )

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { price: totalPrice }
      })

    })

    revalidatePath('/tickets')
    revalidatePath('/')
    return { message: 'Ticket created Successfully', status: 201 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't create Ticket at this time. Try again later", status: 400 }
  }

}


export async function getAllTickets({ page, type, search }: { page: number, type?: 'SALE' | 'REPAIR', search?: string }) {
  try {
    const query: Prisma.TicketFindManyArgs = {
      include: {
        saleTicket: { include: { itemsSold: { include: { inventory: true } }, serviceForSale: true }, },
        seller: { select: { firstName: true, lastName: true } },
        customer: { select: { firstName: true, lastName: true } },
        payment: true
      },
      skip: (page - 1) * 40,
      take: 40,
      orderBy: { createdAt: 'desc' }
    };

    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      if (isNaN(parseInt(search))) {
        whereClause.OR = [
          { customer: { firstName: { contains: search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: search, mode: 'insensitive' } } },
          { seller: { firstName: { contains: search, mode: 'insensitive' } } },
          { seller: { lastName: { contains: search, mode: 'insensitive' } } },
          { saleTicket: { itemsSold: { some: { inventory: { name: { contains: search, mode: 'insensitive' } } } } } },
          { saleTicket: { serviceForSale: { some: { service: { name: { contains: search, mode: 'insensitive' }} } } } },
          { repairTicket: { itemUsedForRepair: { some: { inventory: { name: { contains: search, mode: 'insensitive' } } } } } },
          { repairTicket: { serviceForRepair: { some: { service: { name: { contains: search, mode: 'insensitive' } } } } } },
        ];
      } else {
        whereClause.OR = [
          { id: parseInt(search)},
          { price: parseInt(search)},
          { payment: { amount: parseInt(search)}}
        ];
      }
    }

    if (Object.keys(whereClause).length > 0) {
      query.where = whereClause;
    }

    const tickets: any = await prisma.ticket.findMany(query);

    const hasPreviousPage = page > 1;
    const hasNextPage = tickets.length === 40;
    return { tickets, hasPreviousPage, hasNextPage, status: 200 };
  } catch (error) {
    console.error(error);
    return { message: "Couldn't fetch Tickets at this time. Try again later", status: 400 };
  }
}


export async function getSingleTicket(id: number) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        saleTicket: { include: { itemsSold: { include: { inventory: true } }, serviceForSale: { include: { service: true }} } },
        repairTicket: { include: { repairable: { include: { repairable: true }}, itemUsedForRepair: { include: { inventory: true } }, serviceForRepair: { include: { service: true }} } },
        seller: true,
        customer: true,
        payment: true
      }
    });

    return { ticket, status: 200 };
  } catch (error) {
    console.error(error);
    return { message: "Couldn't fetch Ticket at this time. Try again later", status: 400 };
  }
}

export async function addPayment(id: number, data: { amount: number; method: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'; note?: string }) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { payment: { create: { amount: data.amount, method: data.method, note: data.note } } }
    });

    revalidatePath('/tickets')
    return { message: 'Payment Added Successfully', status: 200 }
  } catch (error) {
    console.error(error);
    return { message: "Couldn't update Ticket at this time. Try again later", status: 400 };
  }
}


export async function closeTicket(id: number) {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    revalidatePath('/tickets')
    return { message: 'Ticket Closed Successfully', status: 200 }
  } catch (error) {
    console.error(error);
    return { message: "Couldn't update Ticket at this time. Try again later", status: 400 };
  }
}

export async function addItemToTicket(ticketId: number, itemId: number, quantity: number, type: 'SALE' | 'REPAIR'){
  try {
    const item = await prisma.inventory.findUnique({ where: { id: itemId } });
    if (item && item?.quantity < quantity) {
      return { message: `You can't add more than ${item.quantity} of ${item.name}`, status: 400 }
    }

    if (type === 'SALE'){
      await prisma.saleTicket.update({
        where: { id: ticketId },
        data: { itemsSold: { create: { inventoryId: itemId, quantity } } }
      });
    } else {
      await prisma.repairTicket.update({
        where: { id: ticketId },
        data: { itemUsedForRepair: { create: { inventoryId: itemId, quantity } } }
      });    
    }

    revalidatePath('/tickets')
    return { message: 'Ticket Closed Successfully', status: 200 }

  } catch (error) {
    console.error(error)
    return { message: "Couldn't add Item to Ticket at this time. Try again later", status: 400 }
  }
}


export async function addRepairableToTicket(ticketId: number, repairableId: number, problem: string){
  try {
    await prisma.repairTicket.update({
      where: { id: ticketId },
      data: { repairable: { create: { repairableId, problem } } }
    });

    revalidatePath('/tickets')
    return { message: 'Repairable Added Successfully', status: 200 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't add Repairable to Ticket at this time. Try again later", status: 400 }
  }
}