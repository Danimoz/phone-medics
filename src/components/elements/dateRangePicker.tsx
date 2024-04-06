'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function DateRangePicker(){
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

  const handleChange = (type: string, date: string) => {
    if (type === 'start') {
      replace(`?startDate=${date}&endDate=${endDate}`);
    } else {
      replace(`?startDate=${startDate}&endDate=${date}`);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input type="date" id="startDate" value={startDate} onChange={(e) => handleChange('start', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input type="date" id="endDate" value={endDate} onChange={(e) => handleChange('end', e.target.value)} />
      </div>
    </div>
  )
}