import sys
import json
import os
from datetime import datetime
import matplotlib.pyplot as pl
import yfinance as yf
import plotly as plotly
import pandas as pd

class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout


def fetch_stock_fiveday(symbol):
    try:
        stock_data = yf.download(
            tickers = symbol,
            period = "1d",
            interval = "5m",
            group_by = 'ticker',
            threads = False,
        )
    except:
        print(f'Could not fetch any stock data for the ticker symbol: {symbol}', file=sys.stderr)

    return symbol, stock_data

def generate_chart(symbol,data):
    stock_data = data.reset_index()
    chart_filename = f"{symbol}-{datetime.now()}.jpeg"
    figure = plotly.graph_objects.Figure(data=[plotly.graph_objects.Candlestick(
            x=stock_data['Datetime'],
            open=stock_data['Open'],
            high=stock_data['High'],
            low=stock_data['Low'],
            close=stock_data['Close'],
    )])

    figure.layout.template = 'plotly_dark'
    figure.update_layout(
        xaxis_rangeslider_visible=False,
        width=1280,
        height=720,
        title=symbol,
    )

    figure.write_image(chart_filename)
    
    return chart_filename

def main():
    with HiddenPrints():
        data = json.loads(sys.argv[1])
        stock_ticker_symbol = data[0]['stock_ticker_symbol']

        symbol, stock_data = fetch_stock_fiveday(stock_ticker_symbol)
        chart_filename = generate_chart(stock_ticker_symbol, stock_data)

    print(chart_filename)
    sys.stdout.flush()
    os._exit(os.EX_OK)


if __name__ == "__main__":
    main()