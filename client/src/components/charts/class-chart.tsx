import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface ClassChartProps {
  data: { kelas: string; count: number }[];
}

export default function ClassChart({ data }: ClassChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(item => item.kelas),
        datasets: [{
          label: 'Jumlah Santri',
          data: data.map(item => item.count),
          backgroundColor: 'hsl(207, 90%, 54%)',
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(0, 0%, 96%)'
            },
            ticks: {
              color: 'hsl(0, 0%, 62%)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'hsl(0, 0%, 62%)'
            }
          }
        }
      }
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
