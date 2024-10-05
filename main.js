require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const API_KEY_BOT = process.env.API;
const bot = new TelegramBot(API_KEY_BOT, {
    polling: {
        interval: 300,
        autoStart: true
    }
});
let DAY_DATA = {};
let BEST_DAY_DATA = {};
const USERS = //стата за день | стата за лучший день
{
    "halareka": [
        "https://wakatime.com/share/@halareka/90a7773a-40b2-4326-b74a-e53954e77286.json", // json,coding activity,last 7 days,show title,future coding data
        "https://wakatime.com/share/@halareka/5a2397ec-5b67-41d1-ba9b-15f268fa026b.json"  // json,coding activity,all time,show title,future coding data
    ],
    "user2": "",
    "user3": "",
    "user4": "",
    "user5": "",
}
async function fetchDailyData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data && data.data) {
            DAY_DATA = data.data; //вытаскиваем стату за день
            return DAY_DATA;
        } else {
            console.error('Data property is missing in the response:', data);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
async function fetchBestData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        BEST_DAY_DATA = data; // лучший день парсинг
        return BEST_DAY_DATA;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
function calculateTotalTime(data) {
    let totalHours = 0;
    let totalMinutes = 0;
    data.forEach(entry => {
      totalHours += entry.grand_total.hours;
      totalMinutes += entry.grand_total.minutes;
    });
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
    return `${totalHours} hrs ${totalMinutes} mins`;
}
bot.onText("/stats", (msg) => {
    const chatId = msg.chat.id;
    // Inline buttons arranged in multiple rows
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'halareka', callback_data: '1' },],
                [{ text: 'user2', callback_data: '2' },],
                [{ text: 'user3', callback_data: '3' },],
                [{ text: 'user4', callback_data: '4' },],
                [{ text: 'user5', callback_data: '5' }]
            ]
        }
    };
    bot.sendMessage(chatId, 'Выберите пользователя для просмотра статистики:', options);
});
bot.on('callback_query', async (callbackQuery) => { 
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id; 
    const userSelection = callbackQuery.data;
    let firstUserName = 0 , data = 0 , best_data = 0;
    let responseMessage;
    switch (userSelection) {
        case '1':            
            firstUserName = Object.keys(USERS)[userSelection-1]; // Ник-нейм
            data = await fetchDailyData(USERS.halareka[0]); 
            best_data = await fetchBestData(USERS.halareka[1]); 
            responseMessage = `Statistics for <b>${firstUserName}</b> for the day \nDate: ${JSON.stringify(DAY_DATA[6].range.date)},\nCoding time: ${JSON.stringify(DAY_DATA[6].grand_total.text)}\n——————————————————\n\nStatistics for <b>${firstUserName}</b> for the best day \nDate: ${JSON.stringify(BEST_DAY_DATA.data.best_day.date)},\nCoding time: ${JSON.stringify(BEST_DAY_DATA.data.best_day.text)}\n——————————————————\n\nTotal time: ${JSON.stringify(BEST_DAY_DATA.data.grand_total.human_readable_total)}\n\nWeekly statistics: ${calculateTotalTime(DAY_DATA)}`;
            DAY_DATA = {}; BEST_DAY_DATA = {};
            break;
        case '2':
            responseMessage = 'Извините,данный юзер еще не добавлен:(';
            break;
        case '3':
            responseMessage = 'Извините,данный юзер еще не добавлен:(';
            break;
        case '4':
            responseMessage = 'Извините,данный юзер еще не добавлен:(';
            break;
        case '5':
            responseMessage = 'Извините,данный юзер еще не добавлен:(';
            break;
        default:
            responseMessage = 'Invalid selection';
    }
    bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML' });
    // удаление выбора.
    bot.deleteMessage(chatId, messageId).catch(error => {
        console.error("Failed to delete message:", error);
    });
});


