'use client'

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProductsCSV(){
  const [loading, setLoading] = useState(false);

  async function getCSV() {
    setLoading(true);
    const res = await fetch('/api/export-products');
    if (!res.ok) {
      console.error('An error occurred');
      return
    }
    const { products } = await res.json();
    products.unshift({ id: 'ID', name: 'Name', sku: 'SKU', costPrice: 'Cost Price', price: 'Price', quantity: 'Quantity' });
    const csv = products.map((row:any) => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.setAttribute('download', 'products.csv');
    a.click();
    setLoading(false);
  }

  return (
    <div className="mt-6">
      <Button size='sm' variant='default' onClick={getCSV}>
        {loading ? 'Loading...' : 'Export CSV'}
      </Button>
    </div>
  )
}