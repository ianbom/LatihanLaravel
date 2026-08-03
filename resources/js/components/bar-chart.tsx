import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';



const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        title: {
            display: true,
            text: 'Produk Terbaru',
        },

        legend: {
            display: false,
        },
    },
};

export default function BarChart({products}: any) { 

    const labels = products.map((product: any) => product.product_name);
    const stocks = products.map((product: any) => product.stock);
    
    const data = {
    labels: labels,
    datasets: [
        {
            label: 'Data Stok',
            data: stocks,
        },
    ],
};

    return (
        <div className="h-[400px]">
            <Bar data={data} options={options} />
        </div>
    );
}
