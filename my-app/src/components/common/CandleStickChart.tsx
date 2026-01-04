'use client';

import { createChart, IChartApi, ISeriesApi, UTCTimestamp, IPriceLine, LineStyle } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

// Supported data formats
interface ApexChartData {
  x: string | Date;
  y: [number, number, number, number];
}

interface LightweightChartData {
    time: string | number | Date;
    open: number;
    high: number;
    low: number;
    close: number;
}

// Component props
interface ChartProps {
  data: (ApexChartData | LightweightChartData)[];
  prediction?: 'Up' | 'Down' | 'Neutral' | null;
}

const CandleStickChart: React.FC<ChartProps> = ({ data, prediction }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const predictionLineRef = useRef<IPriceLine | null>(null);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
        }
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
      };
  }, []);

  // Main chart effect
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: { background: { color: '#0A0A0A' }, textColor: '#E0E0E0' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            crosshair: { mode: 1 },
            timeScale: {
                borderColor: '#404040',
                timeVisible: true,      // <-- FIX: Show the time
                secondsVisible: false,  // <-- FIX: But not the seconds
            },
        });

        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderDownColor: '#ef5350',
          borderUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          wickUpColor: '#26a69a',
        });
    }
    
    const formattedData = data.map(item => {
        const time = new Date('x' in item ? item.x : (item as LightweightChartData).time).getTime() / 1000 as UTCTimestamp;
        const [open, high, low, close] = 'y' in item ? item.y : [item.open, item.high, item.low, item.close];
        return { time, open, high, low, close };
      }).sort((a, b) => a.time - b.time);

    if(candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(formattedData);
        chartRef.current.timeScale().fitContent();

        // Clear old markers and lines
        candlestickSeriesRef.current.setMarkers([]);
        if (predictionLineRef.current) {
            candlestickSeriesRef.current.removePriceLine(predictionLineRef.current);
            predictionLineRef.current = null;
        }

        if (formattedData.length > 0) {
            const lastCandle = formattedData[formattedData.length - 1];

            // Add a marker to the last candle
            candlestickSeriesRef.current.setMarkers([
                {
                    time: lastCandle.time,
                    position: 'aboveBar',
                    color: '#38bdf8',
                    shape: 'arrowDown',
                    text: 'Current',
                },
            ]);

            // Create a prediction line
            if (prediction) {
                let predictionPrice = lastCandle.close;
                let predictionColor = '#9CA3AF'; 
                const priceMove = lastCandle.close * 0.02;

                if (prediction === 'Up') {
                    predictionPrice += priceMove;
                    predictionColor = '#26a69a';
                } else if (prediction === 'Down') {
                    predictionPrice -= priceMove;
                    predictionColor = '#ef5350';
                }

                predictionLineRef.current = candlestickSeriesRef.current.createPriceLine({
                    price: predictionPrice,
                    color: predictionColor,
                    lineWidth: 2,
                    lineStyle: LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: `Prediction: ${prediction}`,
                });
            }
        }
    }
  }, [data, prediction]);

  return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '400px' }} />;
};

export default CandleStickChart;
