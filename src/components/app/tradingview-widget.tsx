'use client';

import React, { useEffect, useRef } from 'react';

const symbolMap: { [key: string]: string } = {
  'EUR/USD': 'FX:EURUSD',
  'EUR/USD (OTC)': 'FX:EURUSD',
  'EUR/JPY': 'FX:EURJPY',
  'EUR/JPY (OTC)': 'FX:EURJPY',
  'GBP/USD': 'FX:GBPUSD',
  'GBP/USD (OTC)': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY',
  'USD/JPY (OTC)': 'FX:USDJPY',
  'AUD/USD': 'FX:AUDUSD',
  'AUD/USD (OTC)': 'FX:AUDUSD',
  'USD/CAD': 'FX:USDCAD',
  'USD/CAD (OTC)': 'FX:USDCAD',
  'USD/CHF': 'FX:USDCHF',
  'USD/CHF (OTC)': 'FX:USDCHF',
  'AUD/JPY': 'FX:AUDJPY',
  'AUD/JPY (OTC)': 'FX:AUDJPY',
  'GBP/JPY': 'FX:GBPJPY',
  'GBP/JPY (OTC)': 'FX:GBPJPY',
  'EUR/GBP': 'FX:EURGBP',
  'EUR/GBP (OTC)': 'FX:EURGBP',
  'BTC/USD': 'BINANCE:BTCUSDT',
  'ETH/USD': 'BINANCE:ETHUSDT',
};

function getTradingViewSymbol(asset: string): string {
  if (!asset) return 'FX:EURUSD';
  const cleanAsset = asset.trim();
  if (symbolMap[cleanAsset]) {
    return symbolMap[cleanAsset];
  }
  // Remove (OTC), slashes and special characters
  const rawPair = cleanAsset.replace(/\s*\(OTC\)/i, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (rawPair.length === 6) {
    return `FX:${rawPair}`;
  }
  return rawPair ? `FX:${rawPair}` : 'FX:EURUSD';
}

type TradingViewWidgetProps = {
  asset: string;
  interval: string;
};

const TradingViewWidget: React.FC<TradingViewWidgetProps> = React.memo(({ asset, interval }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const symbol = getTradingViewSymbol(asset);
    const validInterval = (interval && ['1', '3', '5', '15', '30', '60', '120', '240', 'D', 'W'].includes(interval))
      ? interval
      : '1';

    // Clear previous widget
    container.innerHTML = '';

    // Create sub-container required by TradingView Embed
    const widgetSubContainer = document.createElement('div');
    widgetSubContainer.className = 'tradingview-widget-container__widget';
    widgetSubContainer.style.width = '100%';
    widgetSubContainer.style.height = '100%';

    // Create TradingView Script tag with configuration
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: validInterval,
      timezone: 'America/Sao_Paulo',
      theme: 'dark',
      colorTheme: 'dark',
      style: '1',
      locale: 'br',
      backgroundColor: '#000000',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      enable_publishing: false,
      hide_side_toolbar: true,
      hide_top_toolbar: true,
      hide_legend: true,
      save_image: false,
      calendar: false,
      hide_volume: true,
      disabled_features: [
        'create_volume_indicator_by_default'
      ],
      studies: [
        'STD;Bollinger_Bands'
      ],
      studies_overrides: JSON.stringify({
        'bollinger bands.median.visible': false,
        'bollinger bands.basis.visible': false,
        'Bollinger Bands.Basis.visible': false,
        'Bollinger Bands.median.visible': false,
        'Bollinger Bands.Basis.color': 'rgba(0, 0, 0, 0)',
        'Bollinger Bands.Basis.transparency': 100,
        'Bollinger Bands.median.color': 'rgba(0, 0, 0, 0)',
        'Bollinger Bands.median.transparency': 100,
        'bollinger bands.basis.color': 'rgba(0, 0, 0, 0)',
        'bollinger bands.basis.transparency': 100,
        'bollinger bands.median.color': 'rgba(0, 0, 0, 0)',
        'bollinger bands.median.transparency': 100,
        'Bollinger Bands.Upper.color': '#FF0000',
        'Bollinger Bands.Upper.linewidth': 2,
        'Bollinger Bands.Upper.transparency': 0,
        'Bollinger Bands.Upper.visible': true,
        'Bollinger Bands.Lower.color': '#22C55E',
        'Bollinger Bands.Lower.linewidth': 2,
        'Bollinger Bands.Lower.transparency': 0,
        'Bollinger Bands.Lower.visible': true,
        'Bollinger Bands.Background.color': 'rgba(34, 197, 94, 0.05)',
        'Bollinger Bands.Background.transparency': 95,
        'bollinger bands.upper.color': '#FF0000',
        'bollinger bands.upper.linewidth': 2,
        'bollinger bands.lower.color': '#22C55E',
        'bollinger bands.lower.linewidth': 2
      }),
      overrides: {
        'mainSeriesProperties.showOHLC': false,
        'paneProperties.backgroundType': 'solid',
        'paneProperties.background': '#000000',
        'paneProperties.backgroundGradientStartColor': '#000000',
        'paneProperties.backgroundGradientEndColor': '#000000',
        'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.04)',
        'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.04)',
        'scalesProperties.backgroundColor': '#000000',
        'scalesProperties.textColor': '#888888'
      },
      support_host: 'https://www.tradingview.com'
    });

    container.appendChild(widgetSubContainer);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [asset, interval]);

  return (
    <div 
      className="tradingview-widget-container w-full h-full min-h-[300px] relative bg-black [color-scheme:dark]"
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '300px', backgroundColor: '#000000', colorScheme: 'dark' }}
    />
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;