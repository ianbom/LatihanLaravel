import 'chart.js/auto';
import { Line } from 'react-chartjs-2';






export default function LineChart({revenueByMonth}: any){

    const month = revenueByMonth.map((revenueByMonth : any) => revenueByMonth.month);
    const revenue = revenueByMonth.map((revenueByMonth : any) => revenueByMonth.revenue);

    const data = { 
        labels: month,
        datasets: [
            {
                label: 'Revenue By Month',
                data:revenue,
            },
        ],
    }

    const options = { 
        title: { 
            display: true, 
            text: 'Revenue by month'
        }
    }

    return ( 
        <>
        <Line data={data} options={options}/>
        </>
    )
}