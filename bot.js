const TelegramBot = require('node-telegram-bot-api');
const talib = require('talib');
const axios = require('axios');
const fs = require('fs');

// Telegram bot token
const token = '7036767439:AAGoygrMpQr1xcV7VjkuASsT0PDM7dhKqAU';

// Initialize the bot
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Coin Analysis Bot! Please send me the name of the coin you want to analyze.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const coinName = msg.text.toUpperCase();

    try {
        // Fetch historical data for the coin (You'll need to replace this with your actual API call)
        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/airdrop';
        const response = await axios.get(url);
        const data = response.data;
        const closePrices = data.prices.map(entry => entry[1]);

        // Perform analysis
        const sma = talib.SMA(closePrices, 14);
        const rsi = talib.RSI(closePrices, 14);
        const { upperBand, middleBand, lowerBand } = talib.BBANDS(closePrices, 20, 2, 2, 0);
        const fibLevels = talib.FIB(closePrices);

        // Plot the analysis
        const plotData = `
            <html>
                <head>
                    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                </head>
                <body>
                    <div id="plot"></div>
                    <script>
                        var trace1 = {
                            x: ${JSON.stringify(Array.from({ length: closePrices.length }, (_, i) => i))},
                            y: ${JSON.stringify(closePrices)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Close Prices'
                        };
                        var trace2 = {
                            x: ${JSON.stringify(Array.from({ length: sma.length }, (_, i) => i))},
                            y: ${JSON.stringify(sma)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'SMA(14)'
                        };
                        var trace3 = {
                            x: ${JSON.stringify(Array.from({ length: rsi.length }, (_, i) => i))},
                            y: ${JSON.stringify(rsi)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'RSI(14)'
                        };
                        var trace4 = {
                            x: ${JSON.stringify(Array.from({ length: upperBand.length }, (_, i) => i))},
                            y: ${JSON.stringify(upperBand)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Upper Bollinger Band'
                        };
                        var trace5 = {
                            x: ${JSON.stringify(Array.from({ length: middleBand.length }, (_, i) => i))},
                            y: ${JSON.stringify(middleBand)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Middle Bollinger Band'
                        };
                        var trace6 = {
                            x: ${JSON.stringify(Array.from({ length: lowerBand.length }, (_, i) => i))},
                            y: ${JSON.stringify(lowerBand)},
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Lower Bollinger Band'
                        };
                        var data = [trace1, trace2, trace3, trace4, trace5, trace6];
                        Plotly.newPlot('plot', data);
                    </script>
                </body>
            </html>
        `;
        fs.writeFileSync('plot.html', plotData);

        // Send the plot to the user
        bot.sendPhoto(chatId, 'plot.html', { caption: `Analysis for ${coinName}` });
    } catch (error) {
        console.error('An error occurred:', error);
        bot.sendMessage(chatId, 'An error occurred while analyzing the coin. Please try again later.');
    }
});

console.log('Bot started...');
