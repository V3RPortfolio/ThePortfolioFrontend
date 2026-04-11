import type React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {enUS} from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
);


interface LineChartProps {
    title: string;
    data: {
        x: (number|Date)[];
        y: number[];
        dataPointId: string[];
        label: string;
    }[];
    timeSeriesUnit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    xLabels?: string[];
    yLabels?: string[];

    xAxisTitle?: string;
    yAxisTitle?: string;

    onDataPointClick?: (row:any) => void;

}
const LineChart: React.FC<LineChartProps> = ({
    title,
    data,
    xLabels,
    yLabels,
    xAxisTitle,
    yAxisTitle,
    timeSeriesUnit,
    onDataPointClick
}) => {
    const options:ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
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
                type: !!timeSeriesUnit ? 'time' : 'linear',
                title: {
                    display: !!xAxisTitle,
                    text: xAxisTitle,
                },
                time: !!timeSeriesUnit ?{
                    unit: timeSeriesUnit
                }: undefined
            },
            y: {
                title: {
                    display: !!yAxisTitle,
                    text: yAxisTitle,
                },
                adapters: {
                    date: {
                        locale: enUS
                    }
                }
            },
        },
    };

    const dataset = data.map((series) => {
        const randomBorderColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
        const randomBackgroundColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`;
        
        return {
            label: series.label,
            data: series.y.map((yValue, index) => {
                return { x: series.x[index], y: yValue }
            }),
            borderColor: randomBorderColor,
            backgroundColor: randomBackgroundColor,
        }
    });

    if(onDataPointClick) {
        options.onClick = (event, elements, chart) => {
            console.debug('Data point clicked:', { event, elements, chart });
            if (elements.length > 0) {
                // Retrieve the data point index
                const dataIndex = elements[0].index;
                const datasetIndex = elements[0].datasetIndex;
                
                // Access label and value
                if(dataIndex < data[datasetIndex].dataPointId.length) {
                    onDataPointClick(data[datasetIndex].dataPointId[dataIndex]);
                }
                
                
            }
        }
    }

    return <div className="relative h-auto w-full line-chart-container">
        <Line
            options={options}
            data={{
                datasets: dataset,
                xLabels,
                yLabels,
            }}
        />
    </div>;
}

export default LineChart;