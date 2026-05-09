const mineflayer = require('mineflayer');
const fs = require('fs');

// কনফিগ ফাইল পড়া
let config;
try {
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (err) {
  console.error('config.json পড়তে সমস্যা। ফাইল ঠিক আছে কিনা দেখুন।');
  process.exit(1);
}

// কমান্ড লাইন বা এনভায়রনমেন্ট ভেরিয়েবল দিয়ে ওভাররাইড করা যাবে (Railway এর জন্য)
const host = process.env.HOST || config.host;
const port = process.env.PORT || config.port;
const username = process.env.USERNAME || config.username;
const auth = process.env.AUTH || config.auth || 'offline';
const version = process.env.VERSION || config.version || '1.21.11';

function createBot() {
  const bot = mineflayer.createBot({
    host: host,
    port: parseInt(port),
    username: username,
    auth: auth,
    version: version,
    hideErrors: false
  });

  bot.on('login', () => {
    console.log(`✅ বট লগইন করেছে: ${bot.username}`);
    startAntiAFK(bot);
  });

  bot.on('kicked', (reason) => {
    console.log(`🥾 কিক করা হয়েছে: ${JSON.stringify(reason)}`);
    console.log('পুনরায় সংযোগের চেষ্টা করা হবে...');
  });

  bot.on('end', (reason) => {
    console.log(`🔚 সংযোগ বিচ্ছিন্ন: ${reason}`);
    console.log(`🔄 10 সেকেন্ড পর আবার সংযোগ চেষ্টা...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => {
    console.error('❌ ত্রুটি:', err.message);
  });

  function startAntiAFK(bot) {
    // এলোমেলো মুভমেন্ট চক্র
    setInterval(() => {
      if (!bot.entity) return;
      const actions = [
        () => bot.setControlState('forward', true),
        () => bot.setControlState('back', true),
        () => bot.setControlState('left', true),
        () => bot.setControlState('right', true),
        () => bot.setControlState('jump', true),
      ];

      // আগের সব মুভমেন্ট বন্ধ
      bot.clearControlStates();

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      randomAction();

      // এক সেকেন্ড পর সব কন্ট্রোল ছেড়ে দাও
      setTimeout(() => {
        bot.clearControlStates();
      }, 1000 + Math.random() * 2000); // 1-3 সেকেন্ড চলবে
    }, 1500 + Math.random() * 2000); // 1.5-3.5 সেকেন্ড পর পর দিক বদলাবে

    // প্রতি 20 সেকেন্ডে একটি জায়েন্ট চ্যাট করবে না, শুধু মুভ করবে
    // চাইলেও অটো-ইট/স্বয়ংক্রিয় খাবার যোগ করতে পারো।
  }
}

// প্রথমবার বট চালু
createBot();
