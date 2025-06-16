import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface AgeChartProps {
  data: { ageRange: string; count: number }[];
}

export default function AgeChart({ data }: AgeChartProps) {
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
      type: 'doughnut',
      data: {
        labels: data.map(item => item.ageRange),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: [
            'hsl(207, 90%, 54%)',
            'hsl(142, 71%, 45%)',
            'hsl(36, 100%, 50%)',
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
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
