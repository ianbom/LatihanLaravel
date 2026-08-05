import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);



const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            position: 'bottom' as const,
        },

        tooltip: {
            enabled: true,
        },
    },
};

export default function PieChart({productOrderTotal}:any) {
    const productName = (productOrderTotal.map((item: any) => item.product_name)) 
    const totalOrder = (productOrderTotal.map((item: any) => item.total_buyed)) 


    const data = {
    labels: productName
    ,

    datasets: [
        {
            label: 'Jumlah Barang',

            // Gunakan number, bukan string.
            data: totalOrder,

            backgroundColor: [
                '#111827',
                '#6b7280',
                '#d1d5db',
            ],

            borderColor: [
                '#ffffff',
                '#ffffff',
                '#ffffff',
            ],

            borderWidth: 2,
        },
    ],
};

    return (
        <div className="h-[400px] w-full">
            Ini donat chart
            <Doughnut
                data={data}
                options={options}
            />
        </div>
    );
}