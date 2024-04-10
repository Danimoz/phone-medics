'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ExportCustomers() {
  const [loading, setLoading] = useState(false);

  async function getCSV() {
    setLoading(true);
    const res = await fetch('/api/exports/customers');
    if (!res.ok) {
      setLoading(false);
      return
    }
    const { customers } = await res.json();
    customers.unshift({ id: 'ID', firstName: 'First Name', lastName: 'LastName', email: 'Email', phone: 'Phone', createdAt: 'Date Created', userID: 'Created by' });
    const csv = customers.map((row: any) => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.setAttribute('download', 'customers.csv');
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