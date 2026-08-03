import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: [
        'Barang 1',
        'Barang 2',
        'Barang 3',
    ],

    datasets: [
        {
            label: 'Jumlah Barang',

            // Gunakan number, bukan string.
            data: [5, 10, 15],

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

export default function PieChart() {
    return (
        <div className="h-[400px] w-full">
            <Doughnut
                data={data}
                options={options}
            />
        </div>
    );
}