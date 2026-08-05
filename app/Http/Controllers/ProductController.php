<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function dashboard()
    {
        $products = Product::all();

        $productOrderTotal = DB::select( 
            'SELECT products.product_name, SUM(order_items.quantity) AS total_buyed FROM products 
            JOIN order_items ON order_items.product_id = products.id
            GROUP BY products.product_name
            ORDER BY total_buyed asc'
        );
        // return response()->json(['productOrderTotal' => $productOrderTotal]);

        //revenue permonth
        $startDate = now()->startOfMonth()->subMonths(5)->format('Y-m-d');
        $endDate = now()->endOfMonth()->format('Y-m-d');

        $orders = Order::whereBetween('order_date', [$startDate, $endDate])
                  ->withSum('items as total_price', DB::raw('quantity * unit_price'))
                  ->get();

        $revenueByMonth = $orders
            ->groupBy(function ($orders){
            return $orders->order_date->format('Y-m');
        })->map(function ($orderInMonth, $month){ 
            return [ 
                'month' => $month,
                'revenue' => $orderInMonth->sum('total_price'),
            ];
        })->values();



        // $customers = Customer::all(); 
        // $ordersId = Order::where('order_status', 'completed')->pluck('id'); 
        // $orderItems = OrderItem::whereIn('order_id', $ordersId);
        // $orderRevenue = $orderItems->sum(DB::Raw('quantity * unit_price'));
        // return response()->json(['orderRevenue' => $orderRevenue]);

        // $customers = Customer::with('orders.items')
        // ->withSum(['items as total_spent' => function($query){ 
        //     $query->whereHas('order', function($orderQuery){ 
        //         $orderQuery->where('order_status', 'completed');
        //     });
        // }], DB::raw('quantity * unit_price'))
        // ->get(); 
        // return response()->json(['customers' => $customers]);


        // customer total pembelian  
        $customers = Customer::with('orders.items')
            ->whereHas('orders', function ($orders){ 
                $orders->where('order_status', 'completed');
            })
            ->with('orders', function($orders){ 
            $orders->where('order_status', 'completed');
            })->get();   
        
        $customerTotalSpent = $customers->map(function ($customers, $key) {
            $customerSpent = $customers->orders->sum(function ($order){ 
                return $order->items->sum(function ($orderItem){ 
                    return $orderItem->quantity * $orderItem->unit_price;
                });
            });

            return [ 
                'name' => $customers->full_name, 
                'total_spent' => $customerSpent
            ];
        })->values();
        // return response()->json(['customerTotalSpent' => $customerTotalSpent]);





        $startDate = now()->startOfMonth()->subMonths(5)->format('Y-m-d');
        $endDate = now()->endOfMonth()->format('Y-m-d');

        $orders = Order::whereBetween('order_date', [$startDate, $endDate])
                  ->withSum('items as total_price', DB::raw('quantity * unit_price'))
                  ->get();

        $revenueByMonth = $orders
            ->groupBy(function ($orders){
            return $orders->order_date->format('Y-m');
        })->map(function ($orderInMonth, $month){ 
            return [ 
                'month' => $month,
                'revenue' => $orderInMonth->sum('total_price'),
            ];
        })->values();

        // customers dan jumlah ordernya 

        $customers = Customer::withCount('orders')->get(); 
        // return response()->json(['customers' => $customers]);

        
      
        
                  
        // return response()->json([ 
        //     'startDate' => $startDate,
        //     'endDate' => $endDate,
        //     'revenueByMonth' => $revenueByMonth,
        // ]);
        

        return Inertia::render('dashboard', ['products' => $products, 'revenueByMonth' => $revenueByMonth, 'productOrderTotal' =>$productOrderTotal]);
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
