'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ExcelUploader(){
  return (
    <div className="flex gap-x-4">
      <Input type="file" accept=".xlsx" />
      <Button>Upload</Button>
    </div>
  )
}