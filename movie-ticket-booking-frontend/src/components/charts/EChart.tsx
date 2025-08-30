import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DatasetComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts';

// Register required components
echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, DatasetComponent, TitleComponent, CanvasRenderer]);

export interface EChartProps {
  option: EChartsCoreOption;
  className?: string;
  style?: React.CSSProperties;
}

const EChart: React.FC<EChartProps> = ({ option, className, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chartRef.current = chart;
    chart.setOption(option);

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(option, true);
    }
  }, [option]);

  return <div ref={ref} className={className} style={{ width: '100%', height: '320px', ...(style || {}) }} />;
};

export default EChart;
