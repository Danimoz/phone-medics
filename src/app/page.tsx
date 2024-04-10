import { getSession } from "@/actions/auth";
import Sidebar from "@/components/elements/sidebar";
import { redirect } from "next/navigation";
import { calculateDailySales } from "@/actions/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangePicker from "@/components/elements/dateRangePicker";
import Pagination from "@/components/elements/pagination";
import ExportCSV from "@/components/elements/exportCSV";

export default async function Home({ searchParams }: { searchParams: { startDate?: string, endDate?: string, page?: string } }) {
  const { user } = await getSession();
  if (!user || !user.isAdmin) {
    redirect('/tickets')
  }

  const startDate = searchParams.startDate || new Date().toISOString().split('T')[0];
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0];
  const page = Number(searchParams.page) || 1;
  const dailySales = await calculateDailySales({ startDate, endDate, page });

  if (!dailySales) {
    return <div>Something went wrong</div>
  }

  return (
    <main className="flex min-h-screen w-full">
      <Sidebar />
      <div className="container py-8">
        <div>
          <h1 className="text-4xl font-bold">Welcome to PhoneMedic</h1>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
              </CardHeader>
              <CardContent>
                <DateRangePicker />
                <div className="mt-4">
                  <h2 className="text-lg font-semibold">Total Sales: ₦ {dailySales?.price.toLocaleString()}</h2>
                  <h2 className="text-lg font-semibold">Total Amount Paid: ₦ {dailySales?.amountPaid.toLocaleString()}</h2>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex mt-6 p-1">
            <ExportCSV startDate={startDate} endDate={endDate} />
          </div>

          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySales?.report.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toDateString()}</TableCell>
                  <TableCell>{sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.items}</TableCell>
                  <TableCell>₦ {sale.costPrice?.toLocaleString()}</TableCell>
                  <TableCell>₦ {sale.price.toLocaleString()}</TableCell>
                  <TableCell>₦ {sale.amountPaid.toLocaleString()}</TableCell>
                  <TableCell>₦ {sale.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination hasNextPage={dailySales?.hasNextPage} hasPreviousPage={dailySales?.hasPreviousPage} />
        </div>
      </div>
    </main>
  );
}
