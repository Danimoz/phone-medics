import { getItems } from "@/actions/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProductActions from "./actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Search from "@/components/elements/search";
import Pagination from "@/components/elements/pagination";

export default async function Products({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}){
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const { items: products, hasNextPage, hasPreviousPage } = await getItems(page, search)
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Products</h1>

      <section className="border shadow-sm rounded-lg mt-6">
        <Search placeholder='Search Products ...' />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden sm:table-cell">Quantity</TableHead>
              <TableHead className="hidden md:table-cell">Cost Price</TableHead>
              <TableHead>Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>₦ {product.price.toLocaleString()}</TableCell>
                <TableCell>{product.quantity} in stock</TableCell>
                <TableCell>₦ {product.costPrice.toLocaleString()}</TableCell>
                <TableCell>{product.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <ProductActions id={product.id} name={product.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
      </section>
    </div>
  )
}