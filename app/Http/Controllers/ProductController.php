<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function dashboard(): Response
    {
        $products = Product::all();

        return Inertia::render('dashboard', ['products' => $products]);
    }

    public function index(): Response
    {
        $products = Product::all();

        return Inertia::render('list-product', ['products' => $products]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        Product::create($data);

        return redirect()->back()->with('success', 'Produk berhasil dibuat');
    }
}
