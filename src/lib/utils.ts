import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSKU(name: string, description?: string) {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const namePrefix = name.slice(0, 3).toUpperCase();

  if (description) {
    const descriptionPrefix = description.slice(0, 3).toUpperCase();
    return `${namePrefix}-${descriptionPrefix}-${randomString}`;
  } else {
    return `${namePrefix}-${randomString}`;
  }
}