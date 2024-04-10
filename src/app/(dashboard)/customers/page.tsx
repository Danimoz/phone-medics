import { getPaginatedCustomers } from "@/actions/tickets"
import Pagination from "@/components/elements/pagination";
import Search from "@/components/elements/search";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExportCustomers from "./exportCustomers";


export default async function Customers({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search as string || ""
  const { customers, hasNextPage, hasPreviousPage } = await getPaginatedCustomers(page, search);

  if (!customers) return (
    <div className="p-4 h-screen flex justify-center items-center">
      <h1 className="text-2xl font-bold">Customers</h1>
      <p>Couldn&apos;t fetch Customers at this time. Try again later</p>
    </div>
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Customers</h1>

      <ExportCustomers />
      
      <section className="border shadow-sm rounded-lg mt-6">
        <Search placeholder='Search Customers ...' />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>  
              <TableHead className="hidden md:table-cell">Created By</TableHead>  
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.firstName}</TableCell>
                <TableCell>{customer.lastName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.createdBy.firstName} {customer.createdBy.lastName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
      </section>
    </div>
  )
}