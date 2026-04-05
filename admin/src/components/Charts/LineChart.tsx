import type React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


interface LineChartProps {
    title: string;
    data: {
        x: number[];
        y: number[];
        label: string;
    }[];
    xLabels?: string[];
    yLabels?: string[];

    xAxisTitle?: string;
    yAxisTitle?: string;
}
const LineChart: React.FC<LineChartProps> = ({
    title,
    data,
    xAxisTitle,
    yAxisTitle
}) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            x: {
                type: 'linear' as const,
                title: {
                    display: !!xAxisTitle,
                    text: xAxisTitle,
                },
            },
            y: {
                title: {
                    display: !!yAxisTitle,
                    text: yAxisTitle,
                },
            },
        },
    };

    const dataset = data.map((series) => {
        const randomBorderColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
        const randomBackgroundColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`;
        return {
            label: series.label,
            data: series.y.map((yValue, index) => ({ x: series.x[index], y: yValue })),
            borderColor: randomBorderColor,
            backgroundColor: randomBackgroundColor,
        }
    });

    return <Line
        options={options}
        data={{
            datasets: dataset,
        }}
    />;
}

export default LineChart;