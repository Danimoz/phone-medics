import { getAllTickets } from "@/actions/tickets";
import Pagination from "@/components/elements/pagination";
import Search from "@/components/elements/search";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Ticket } from "@prisma/client";

interface SearchParams {
  search?: string;
  page?: string;
  type?: 'SALE' | 'REPAIR';
}

type TTicket = Ticket 
  & { customer:  { firstName: string, lastName: string } }
  & { payment: { amount: number }[] } 
  & { seller: { firstName: string, lastName: string } };

export default async function TicketPage({ searchParams }: { searchParams: SearchParams }){
  const search = searchParams.search || '';
  const currentPage = Number(searchParams.page) || 1;
  const ticketType = searchParams.type || undefined;

  const { tickets, hasNextPage, hasPreviousPage } = await getAllTickets({ page: currentPage, type: ticketType, search: search });

  if (!tickets) return (
    <div className="p-4 h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <p>Couldn&apos;t fetch Tickets at this time. Try again later</p>
    </div>
  )
  
  return (
    <div className="p-4">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Button size='sm' variant='outline' asChild>
          <Link href='/tickets/new'>Create Ticket</Link>
        </Button>
      </section>

      <section className="border shadow-sm rounded-lg mt-6">
        <Search placeholder='Search Tickets ...' />

        <div className="border p-2 flex gap-x-4">
          <Button size='sm' variant={ticketType === 'SALE' ? 'default': 'outline'} asChild>
            <Link href='/tickets?type=SALE'>Sales</Link>
          </Button>
          <Button size='sm' variant={ticketType === 'REPAIR' ? 'default' : 'outline' } asChild>
            <Link href='/tickets?type=REPAIR'>Repairs</Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Seller</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Amount Paid</TableHead>
              <TableHead className=""></TableHead>  
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tickets as TTicket[])?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.createdAt.toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.type}</TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>{ticket.customer.firstName} {ticket.customer.lastName}</TableCell>
                <TableCell>{ticket.seller.firstName} {ticket.seller.lastName}</TableCell>
                <TableCell>₦ {ticket.price.toLocaleString()}</TableCell>
                <TableCell>
                  ₦ {ticket.payment.reduce((acc, payment) => acc + payment.amount, 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button size='sm' variant='outline' asChild>
                    <Link href={`/tickets/${ticket.id}`}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination hasNextPage={hasNextPage as boolean} hasPreviousPage={hasPreviousPage as boolean} />
      </section>
    </div>
  )
}