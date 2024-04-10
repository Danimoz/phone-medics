'use client';

import { closeTicket } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface CloseTicketProps {
  ticketId: number;
  status: 'OPEN' | 'COMPLETED' | 'IN_PROGRESS' ;
}

export default function CloseTicket({ ticketId, status } : CloseTicketProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function ticketClose() {
    setIsLoading(true);
    const response = await closeTicket(ticketId);
    if (response.status !== 200){
      toast.error('Error closing ticket');
      setIsLoading(false);
      return
    }
    toast.success('Ticket closed successfully');
    setIsLoading(false);
  }

  return (
    <div>
      {status === 'OPEN' && (
        <Button 
          size='sm'
          onClick={ticketClose}
          variant='outline'
        >
          {isLoading ? 'Closing...' : 'Close Ticket'}
        </Button>
      )}
    </div>
  )
}