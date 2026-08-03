import { Form } from "@inertiajs/react"

interface Product {
    id: number
    product_name: string
    category: string
    price: number
    stock: number
}

interface ListProductProps {
    products: Product[]
}

export default function ListProduct({ products }: ListProductProps) {
   
    function storeProduct(){ 

    }

    return (

        <>
            <h1>ini list product</h1>

            {products.length === 0 ? (
                <h1>Produk ga ada</h1>
            ) : (
                <>
                    <h2>Halo ini listnya</h2>

                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="rounded-lg border p-4 shadow-sm"
                        >
                            <h2 className="text-lg font-semibold">
                                {product.product_name}
                            </h2>

                            <p>
                                Harga: Rp
                                {product.price.toLocaleString('id-ID')}
                            </p>

                            <p>Stok: {product.stock}</p>
                        </div>
                    ))}
                </>
            )}


            <h1> Form create produk</h1>

            <Form  method="POST" action={'/store-product'} className="border border-black">

                <div>
                    <label>Nama Produk</label>
                    <input type="text" name="product_name" />
                </div>

                <div>
                    <label>Kategori</label>
                    <input type="text" name="category" />
                </div>

                <div>
                    <label>Price</label>
                    <input type="number" name="price" />
                </div>

                <div>
                    <label>Stock</label>
                    <input type="number" name="stock" />
                </div>

                <button className="bg-blue-500 text-white p-2 rounded mt-2" type="submit">Submit</button>
            </Form>
        </>
    )
}
