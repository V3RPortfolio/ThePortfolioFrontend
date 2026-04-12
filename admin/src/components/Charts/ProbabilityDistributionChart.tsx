import type React from "react";
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface ProbabilityDistributionDataset {
    values: number[];
    label: string;
    dataPointId?: string[];
}

interface ProbabilityDistributionChartProps {
    title: string;
    data: ProbabilityDistributionDataset[];
    xAxisTitle?: string;
    yAxisTitle?: string;
    /** Number of evenly-spaced points at which the KDE is evaluated. Defaults to 200. */
    numPoints?: number;
    onDataPointClick?: (dataPointId: string) => void;
}

// ─── KDE helpers ──────────────────────────────────────────────────────────────

/** Gaussian kernel */
function gaussianKernel(u: number): number {
    return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

/** Silverman's rule-of-thumb bandwidth */
function silvermanBandwidth(values: number[]): number {
    const n = values.length;
    if (n < 2) return 1;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);

    // IQR-based estimate for robustness using linear interpolation
    const sorted = [...values].sort((a, b) => a - b);
    const interp = (p: number) => {
        const pos = p * (n - 1);
        const lo = Math.floor(pos);
        const hi = Math.min(lo + 1, n - 1);
        return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
    };
    const iqr = interp(0.75) - interp(0.25);

    const sigma = Math.min(std, iqr / 1.34) || std || 1;
    return 1.06 * sigma * Math.pow(n, -0.2);
}

/** Evaluate KDE at a set of x positions */
function kde(values: number[], bandwidth: number, xPoints: number[]): number[] {
    const n = values.length;
    return xPoints.map((x) => {
        const sum = values.reduce((acc, xi) => acc + gaussianKernel((x - xi) / bandwidth), 0);
        return sum / (n * bandwidth);
    });
}

// ─── Colour palette drawn from the design-system CSS variables ────────────────

const PALETTE: Array<{ border: string; background: string }> = [
    { border: 'rgba(67, 24, 255, 1)',  background: 'rgba(67, 24, 255, 0.15)'  }, // primary-600
    { border: 'rgba(5, 205, 153, 1)',  background: 'rgba(5, 205, 153, 0.15)'  }, // tertiary-500
    { border: 'rgba(43, 54, 116, 1)',  background: 'rgba(43, 54, 116, 0.15)'  }, // secondary-600
    { border: 'rgba(238, 93, 80, 1)',  background: 'rgba(238, 93, 80, 0.15)'  }, // error
    { border: 'rgba(255, 206, 32, 1)', background: 'rgba(255, 206, 32, 0.15)' }, // warning
    { border: 'rgba(106, 210, 255, 1)',background: 'rgba(106, 210, 255, 0.15)'}, // info
];

// ─── Component ────────────────────────────────────────────────────────────────

const ProbabilityDistributionChart: React.FC<ProbabilityDistributionChartProps> = ({
    title,
    data,
    xAxisTitle,
    yAxisTitle,
    numPoints = 200,
    onDataPointClick,
}) => {
    // Determine global x range across all datasets
    const allValues = data.flatMap((d) => d.values);

    if (allValues.length === 0) {
        return (
            <div className="relative h-auto w-full probability-distribution-chart-container">
                <p className="text-caption text-muted">No data to display.</p>
            </div>
        );
    }

    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const padding = (globalMax - globalMin) * 0.1 || 1;
    const xStart = globalMin - padding;
    const xEnd = globalMax + padding;

    // Evenly-spaced evaluation points
    const xPoints = Array.from({ length: numPoints }, (_, i) =>
        xStart + (i / (numPoints - 1)) * (xEnd - xStart)
    );

    // Build Chart.js datasets
    const datasets = data.map((series, idx) => {
        const bw = silvermanBandwidth(series.values);
        const densities = kde(series.values, bw, xPoints);
        const color = PALETTE[idx % PALETTE.length];

        return {
            label: series.label,
            data: xPoints.map((x, i) => ({ x, y: densities[i] })),
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4,
        };
    });

    const options: ChartOptions<'line'> = {
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
            tooltip: {
                callbacks: {
                    label: (ctx) =>
                        `${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(4)}`,
                },
            },
        },
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: !!xAxisTitle,
                    text: xAxisTitle,
                },
            },
            y: {
                title: {
                    display: !!yAxisTitle,
                    text: yAxisTitle ?? 'Density',
                },
                beginAtZero: true,
            },
        },
    };

    if (onDataPointClick) {
        options.onClick = (_event, elements, chart) => {
            if (elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex;
                const dataIndex = elements[0].index;
                const series = data[datasetIndex];

                if (series.dataPointId && series.dataPointId.length > 0 && series.values.length > 0) {
                    // dataIndex points to a KDE evaluation position, not an original value.
                    // Map the clicked x-coordinate back to the nearest original data point.
                    const clickedX = (chart.data.datasets[datasetIndex].data[dataIndex] as { x: number }).x;
                    const nearestIdx = series.values.reduce(
                        (bestIdx, v, i) =>
                            Math.abs(v - clickedX) < Math.abs(series.values[bestIdx] - clickedX)
                                ? i
                                : bestIdx,
                        0
                    );
                    if (nearestIdx < series.dataPointId.length) {
                        onDataPointClick(series.dataPointId[nearestIdx]);
                    }
                }
            }
        };
    }

    return (
        <div className="relative h-auto w-full probability-distribution-chart-container">
            <Line
                options={options}
                data={{ datasets }}
            />
        </div>
    );
};

export default ProbabilityDistributionChart;
