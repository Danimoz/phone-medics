'use client';

import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState } from "react";

export default function ExportCSV({ startDate, endDate }: { startDate: string, endDate: string }) {
  const [loading, setLoading] = useState(false);

  async function getCSV() {
    setLoading(true);
    const res = await fetch('/api/exports/report?startDate=' + startDate + '&endDate=' + endDate);
    if (!res.ok) {
      toast.error('An error occurred');
      setLoading(false);
      return
    }
    const { report } = await res.json();
    // add the header row
    report.unshift({ date: 'Date', id: 'ID', customer: 'Customer', items: 'Items', costPrice:"Cost Price", price: 'Sale Price',  amountPaid: 'Amount Paid', profit: 'Profit' });
    const csv = report.map((row:any) => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.setAttribute('download', 'report.csv');
    a.click();
    setLoading(false);
  }

  return (
    <div className="ml-auto">
      <Button size='sm' variant='default' onClick={getCSV}>
        {loading ? 'Loading...' : 'Export CSV'}
      </Button>
    </div>
  )
}