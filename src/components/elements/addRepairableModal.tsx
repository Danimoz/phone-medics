'use client';

import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandList, CommandEmpty, CommandItem, CommandGroup, CommandInput } from "../ui/command";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Repairable } from "@prisma/client";
import { toast } from "sonner";
import SubmitButton from "./submitbutton";
import { addRepairableToTicket } from "@/actions/tickets";

interface AddRepairableModalProps {
  id: number;
}

export default function AddRepairableModal({ id }: AddRepairableModalProps){
  const [repairables, setRepairables] = useState<Repairable[]>([]);
  const [selectedRepairable, setSelectedRepairable] = useState({ repairableName: '', repairableId: 0 });
  
  useEffect(() => {
    async function getItems() {
      const res = await fetch('/api/repairables');
      if (!res.ok) {
        toast.error('An error occurred');
        return
      }
      const { repairables } = await res.json();      
      setRepairables(repairables);
    }

    getItems()
  }, [])

  async function handleSubmit(formData: FormData){
    if (!selectedRepairable.repairableName || selectedRepairable.repairableId === 0) {
      toast.error('Please select a repairable');
      return
    }
    const problem = formData.get('problem') as string;
    if (!problem) {
      toast.error('Please enter a problem');
      return
    }

    const res = await addRepairableToTicket(id, selectedRepairable.repairableId, problem);
    if (res.status !== 200) {
      toast.error('An error occurred');
      return
    }
    toast.success('Repairable added successfully');
    setSelectedRepairable({ repairableName: '', repairableId: 0 });
  }

  return (
    <Sheet>
      <SheetTrigger className="bg-primary rounded-lg p-3 text-white">Add Repairable</SheetTrigger>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle>Add Repairable</SheetTitle>
        </SheetHeader>
        <form action={handleSubmit}>
          <div className="mt-6 mb-3">
            <h3 className="text-lg font-semibold">Product</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' role="combobox" className='w-full my-1'>
                  {selectedRepairable.repairableName 
                    ? repairables?.find((repairable) => repairable.id === selectedRepairable.repairableId)?.name
                    : "Select Repairable..."
                  }
                  <ChevronsUpDown className="shrink-0 opacity-50 ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search Repairable..." />
                  <CommandList>
                    <CommandEmpty>No Repairable found.</CommandEmpty>
                    <CommandGroup>
                      {repairables?.map((repairable) => (
                        <CommandItem
                          key={repairable.id.toString()} 
                          value={repairable.name}
                          onSelect={(currentValue) => {
                            setSelectedRepairable({ repairableName: currentValue, repairableId: repairable.id });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", repairable.name === selectedRepairable.repairableName ? "opacity-100": 'opacity-0')} />
                          {repairable.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 mb-3">
            <Label>Problem</Label>
            <Input placeholder="Enter Problem" name='problem' />
          </div>

          <SubmitButton buttonText="Add Item" />
        </form>
      </SheetContent>
    </Sheet>
  )
}