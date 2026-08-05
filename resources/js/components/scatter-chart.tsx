import { Scatter } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ScatterChart(){ 

    const data = { 
        datasets: [
            {
                label: 'Scatter Dataset',
                data: [
                    { x: 1, y: 2 },
                    { x: 2, y: 4 },
                    { x: 3, y: 5 },
                ],
            },
        ],
    }

const options = {
    plugins: {
        title: {
            display: true,
            text: 'Scatter Chart',
        },

        legend: {
            display: false,
        },
    },
};

    return ( 
        <Scatter data={data} options={options} />
    )
}