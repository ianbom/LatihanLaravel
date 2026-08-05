import { PolarArea } from "react-chartjs-2";
import 'chart.js/auto';


export default function PolarChart(){ 

    const data = { 
    labels: [
        'Red',
        'Green',
        'Yellow',
        'Blue',
        'Purple',
        'Orange'
    ],
    datasets: [
        {
        label: 'My First Dataset',
        data: [14, 3, 8, 7, 9, 10],
        backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(201, 203, 207, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(201, 203, 207)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
        ],
        borderWidth: 1
        }
    ]
};

    const options = { 
        plugins: { 
            title: { 
                display: true, 
                text: 'Polar Area Chart'
            }
        }
    }


    return (
        <PolarArea data={data} options={options}/>
    )
}