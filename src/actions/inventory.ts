'use server';

import prisma from "@/lib/prisma";
import { generateSKU } from "@/lib/utils";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function addItem(formData: FormData){
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const quantity = parseInt(formData.get('quantity') as string)
  const description = formData.get('description') as string
  const costPrice = parseFloat(formData.get('costPrice') as string)
  const isActive = formData.get('isActive') === 'on' ? true : false

  const sku = generateSKU(name, description)
  const { user } = await getSession();
  if (!user) {
    return { message: 'You are not authorized to perform this action', status: 401 }
  }

  try {
    await prisma.inventory.create({
      data: { name, price, quantity, description, isActive, sku, costPrice, userId: user.id }
    })
    revalidatePath('/products')
    return { message: 'Item added Successfully', status: 201 }
  } catch(error) {
    console.error(error)
    return { message: "Couldn't add Item at this time. Try again later", status: 400 }
  }
}

export async function getItems(page: number, search?: string){
  try {
    let items;

    if (search) {
      items = await prisma.inventory.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        },
        skip: (page - 1) * 40,
        take: 40
      });
    } else {
      items = await prisma.inventory.findMany({
        skip: (page - 1) * 40,
        take: 40
      });
    }

    const hasPreviousPage = page > 1;
    const hasNextPage = items.length === 40;
    return { items, hasPreviousPage, hasNextPage, status: 200 }
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching items');
  }
}

export async function getAllItems(){
  try {
    const items = await prisma.inventory.findMany()
    return { items, status: 200 }
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching items');
  }
}

export async function restockItem(id: number, quantity: number){
  try {
    await prisma.inventory.update({
      where: { id },
      data: { quantity: { increment: quantity}}
    })
    revalidatePath('/products')
    return { message: 'Item Restocked Successfully', status: 200 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't restock Item at this time. Try again later", status: 400 }
  }
}

export async function addService(formData: FormData){
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { user } = await getSession();
  if (!user) {
    return { message: 'You are not authorized to perform this action', status: 401 }
  }

  const sku = generateSKU(name, description)
  try {
    await prisma.service.create({
      data: { name, description, userId: user.id, sku }
    })
    revalidatePath('/tickets/new')
    return { message: 'Service added Successfully', status: 201 }
  } catch(error) {
    console.error(error)
    return { message: "Couldn't add Service at this time. Try again later", status: 400 }
  }
}

export async function getServices(){
  try {
    const services = await prisma.service.findMany()
    return { services, status: 200 }
  } catch (error) {
    console.error(error)
    throw new Error('Error fetching services');
  }
}


export async function addRepairable(formData: FormData){
  const name = formData.get('name') as string
  const problem = formData.get('problem') as string

  try {
    await prisma.repairable.create({
      data: { name, problem }
    })
    revalidatePath('/tickets/new')
    return { message: 'Repairable added Successfully', status: 201 }
  } catch(error) {
    console.error(error)
    return { message: "Couldn't add Repairable at this time. Try again later", status: 400 }
  }
}

export async function getRepairables(){
  try {
    const repairables = await prisma.repairable.findMany()
    return { repairables, status: 200 }
  } catch (error) {
    console.error(error)
    return { message: "Couldn't fetch Repairables at this time. Try again later", status: 400 }
  }
}