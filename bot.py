import logging
import telegram
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import talib
import requests
import matplotlib.pyplot as plt
import io

# Set up logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# Telegram bot token
TOKEN = '6723919110:AAF1GB2qAT4pfdJjLoXZV-HDrcdBsazE2NU'

# Initialize the bot
bot = telegram.Bot(token=TOKEN)

def start(update, context):
    update.message.reply_text('Welcome to the Coin Analysis Bot! Please send me the name of the coin you want to analyze.')

def analyze_coin(update, context):
    coin_name = update.message.text.upper()
    chat_id = update.message.chat_id
    
    try:
        # Fetch historical data for the coin (You'll need to replace this with your actual API call)
        url = f'https://pro-api.coinmarketcap.com/v1/cryptocurrency/airdrop'
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        close_prices = [entry[1] for entry in data['prices']]
        
        # Perform analysis
        # Example: Simple Moving Average (SMA) for 14 periods
        sma = talib.SMA(close_prices, timeperiod=14)
        
        # Example: Relative Strength Index (RSI) for 14 periods
        rsi = talib.RSI(close_prices, timeperiod=14)
        
        # Example: Bollinger Bands (BBANDS) for 20 periods, 2 standard deviations
        upperband, middleband, lowerband = talib.BBANDS(close_prices, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)
        
        # Example: Fibonacci Retracement Levels
        fib_levels = talib.FIB(close_prices)
        
        # Plot the analysis
        plt.figure(figsize=(12, 6))
        plt.plot(close_prices, label='Close Prices')
        plt.plot(sma, label='SMA(14)')
        plt.plot(rsi, label='RSI(14)')
        plt.plot(upperband, label='Upper Bollinger Band')
        plt.plot(middleband, label='Middle Bollinger Band')
        plt.plot(lowerband, label='Lower Bollinger Band')
        plt.legend()
        plt.title(f"Analysis for {coin_name}")
        plt.xlabel("Period")
        plt.ylabel("Price")
        
        # Save the plot to a bytes object
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        
        # Send the plot to the user
        bot.send_photo(chat_id=chat_id, photo=buf)
        buf.close()
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        bot.send_message(chat_id=chat_id, text="An error occurred while analyzing the coin. Please try again later.")

def main():
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler('start', start))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, analyze_coin))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
