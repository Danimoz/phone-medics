import { getStaffs } from "@/actions/auth";
import Pagination from "@/components/elements/pagination";
import Search from "@/components/elements/search";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";


interface SearchParams {
  search?: string;
  page?: string;
}

export default async function StaffPage({ searchParams }: { searchParams: SearchParams }) { 
  const search = searchParams.search || ''; 
  const currentPage = Number(searchParams.page) || 1;
  
  const { staffs, hasPreviousPage, hasNextPage } = await getStaffs(currentPage, search)

  if (!staffs) return (
    <div className="p-4 h-screen flex justify-center items-center">
      <h1 className="text-2xl font-bold">Staffs</h1>
      <p>Couldn&apos;t fetch Staffs at this time</p>
    </div>
  )

  return (
    <main>
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff</h1>
        <Button size='sm' variant='outline' asChild>
          <Link href='/signup'>Add Staff</Link>
        </Button>
      </section>

      <section className="border shadow-sm rounded-lg mt-6">
        <Search placeholder='Search Staff ...' />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs?.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.firstName}</TableCell>
                <TableCell>{staff.lastName}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size='sm' variant='destructive'>Delete Staff</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
      </section>
    </main>
  )
} 