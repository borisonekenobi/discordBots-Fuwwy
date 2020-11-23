require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs')
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const moneyType = 'm Kinah';
const startBal = 10;
const cmdList = [
    '!help', 'pulls up this list',
    '!add <any command>', 'to add people/pets to the lists',
    '!money', 'sends money to a random person',
    '!pet', 'calls a random pet the best',
    '!game', 'chooses a random game for you to play',
    '!furry', 'calls a random person a furry'
];

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.channels.get('738439111412809730').send(':green_circle: Bot has started.')
});

const consoleListener = process.openStdin();
consoleListener.addListener("data", res => {
    try {
        const consoleMsg = res.toString().toLocaleLowerCase().trim().split(/ +/g).join(" ");
        if (consoleMsg === 'test') {
            console.log('test successful');
        } else if (consoleMsg === 'restart' || consoleMsg === 'reboot') {
            bot.channels.get('738439111412809730').send(':yellow_circle: Bot is restarting.')
                .then(() => bot.destroy())
                .then(() => bot.login(TOKEN));
        } else if (consoleMsg === 'stop') {
            bot.channels.get('738439111412809730').send(':red_circle: Bot has stopped.')
                .then(() => bot.destroy());
            process.exit(0)
        }
    } catch (err) {
        console.error(err);
    }
});

bot.on('message', msg => {
    try {
        const msgContent = msg.content.toLocaleLowerCase();
        //Test connection to bot
        if (msgContent === 'test' || msgContent === '!test') {
            msg.reply('`msg.reply()` test successful'); //Tests msg.reply()
            msg.channel.send('`msg.channel.send()` test successful'); //Tests msg.channel.send()
            msg.channel.send(createEmbed(undefined, '`msg.channel.send(createEmbed())` test successful', undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, undefined, undefined)); //Tests msg.channel.send(createEmbed ())

            //Displays help list
        } else if (msgContent === '!help') {
            msg.channel.send(createEmbed('#C930FF', 'Commands:', undefined, undefined, undefined, undefined, undefined, undefined, cmdList, undefined, undefined, undefined));

            //Gives money to mentioned/random person
        } else if (msgContent.startsWith('!money')) {
            const info = msgInfo(msg);

            let userID = info[2];
            const authorID = info[1];

            let lines = [];
            const allArgs = [];
            const IDs = [];

            main_code:
                if (checkUser(authorID, 'other-files/' + info[0] + '.users')) {
                    if (userID === undefined) {
                        createFile('other-files/' + info[0] + '.users');
                        const data = fs.readFileSync('other-files/' + info[0] + '.users', 'utf8');
                        lines = data.split("\n");
                        let args = [];
                        if (lines.length <= 2) {
                            msg.channel.send(createEmbed('#FF0000', 'There is only 1 player!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                            break main_code;
                        } else {
                            do {
                                args = lines[Math.floor(Math.random() * (lines.length - 1))].split(" ");
                                userID = args[0];
                            } while (isAuthorUser(authorID, userID));
                        }
                    }

                    for (let i = 0; i < lines.length; i++) {
                        allArgs.push(lines[i].split(" "));
                        IDs.push(allArgs[i][0]);
                    }

                    do {
                        if (i === IDs.length) {
                            msg.channel.send(createEmbed('#FF0000', 'That player is not part of the game!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, 'Use !add money <user mention> to add player', undefined, [], undefined, undefined, undefined));
                            break main_code;
                        }
                    } while (i < IDs.length);

                    const takeMoney = Math.floor(Math.random() * 100) + 1;
                    msg.channel.send(createEmbed('#98E107', 'Money Sent', undefined, undefined, undefined, undefined, '<@' + info[1] + '> has given ' + takeMoney + moneyType + ' to <@' + userID + '>', undefined, [/*msg.author.username + ' Balance:', '10', '<@' + userID + '> Balance', takeMoney*/], undefined, undefined, undefined));

                    const userMoney = IDs.indexOf(userID);
                    const authorMoney = IDs.indexOf(authorID);

                    allArgs[userMoney][1] = Number(allArgs[userMoney][1]) + takeMoney;
                    allArgs[authorMoney][1] = allArgs[authorMoney][1] - takeMoney;

                    fs.writeFileSync('other-files/' + info[0] + '.users', '', function (err) {
                        if (err) throw err;
                    });

                    for (let i = 0; i < allArgs.length - 1; i++) {
                        fs.appendFileSync('other-files/' + info[0] + '.users', allArgs[i][0] + ' ' + allArgs[i][1] + '\n', function (err) {
                            if (err) throw err;
                        });
                    }
                } else {
                    msg.channel.send(createEmbed('#FF0000', 'You are not part of the game!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                }

            //Shows person their balance
        } else if (msgContent === '!bal' || msgContent === '!balance') {
            const info = msgInfo(msg);

            if (checkUser(info[1], 'other-files/' + info[0] + '.users')) {
                createFile('other-files/' + info[0] + '.users')
                const data = fs.readFileSync('other-files/' + info[0] + '.users', 'utf8');
                const lines = data.split("\n");
                const args = lines[Math.floor(Math.random() * (lines.length - 1))].split(" ");
                const userBal = args[1];
                const username = msg.author.username;

                msg.channel.send(createEmbed('#00FF00', username + ' Balance:', undefined, undefined, undefined, undefined, userBal + moneyType, undefined, [], undefined, undefined, undefined));
            } else {
                msg.channel.send(createEmbed('#FF0000', 'You are not part of the game!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
            }
            //Add players/pets #FF5959
        } else if (msgContent.startsWith('!add')) {
            const info = msgInfo(msg);
            const msgArgs = msgContent.split(" ");
            if (msgArgs[1] === "money" || msgArgs[1] === "pet" || msgArgs[1] === "game" || msgArgs[1] === "furry") {
                if (msgArgs[1] === "money") {
                    if (info[2] === undefined) {
                        msg.channel.send(createEmbed('#FF0000', 'You need to mention a user!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                    } else {
                        msgArgs[2] = info[2];

                        createFile('other-files/' + info[0] + '.users')
                        const data = fs.readFileSync('other-files/' + info[0] + '.users', 'utf8');
                        const lines = data.split("\n");
                        let j = 0;
                        for (let i = 0; i <= lines.length - 1; i++) {
                            let args = lines[i].split(" ");
                            if (args[0] === msgArgs[2]) {
                                msg.channel.send(createEmbed('#FF0000', msg.mentions.users.first().username + ' is already part of the game!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                                j = 1;
                                break;
                            }
                        }
                        if (j === 0) {
                            fs.appendFileSync('other-files/' + info[0] + '.users', info[2] + ' ' + startBal + '\n', function (err) {
                                if (err) throw err;
                            });
                            msg.channel.send(createEmbed('#FF5959', msg.mentions.users.first().username + ' has joined', undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, undefined, undefined));
                        }
                    }

                } else if (msgArgs[1] === "pet") {
                    if (msgArgs[2] === undefined) {
                        msg.channel.send(createEmbed('#FF0000', 'You need to give the name of the pet!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                    } else {
                        createFile('other-files/' + info[0] + '.pet');
                        const data = fs.readFileSync('other-files/' + info[0] + '.pet', 'utf8');
                        const lines = data.split("\n");
                        let j = 0;
                        for (let i = 0; i <= lines.length - 1; i++) {
                            if (lines[i] === msgArgs[2]) {
                                msg.channel.send(createEmbed('#FF0000', msgArgs[2] + ' is already on the list of pets!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                                j = 1;
                                break;
                            }
                        }
                        if (j === 0) {
                            fs.appendFileSync('other-files/' + info[0] + '.pet', msgArgs[2] + '\n', function (err) {
                                if (err) throw err;
                            });
                            msg.channel.send(createEmbed('#FF5959', msgArgs[2] + ' has been added to the list of pets!', undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, undefined, undefined));
                        }
                    }

                } else if (msgArgs[1] === "game") {
                    createFile('other-files/' + info[0] + '.game');
                    const data = fs.readFileSync('other-files/' + info[0] + '.game', 'utf8');
                    const lines = data.split("\n");
                    const game = msgArgs[2];
                    let j = 0;
                    for (let i = 0; i <= lines.length - 1; i++) {
                        if (lines[i] === game) {
                            msg.channel.send(createEmbed('#FF0000', game + ' is already on the list of games!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                            j = 1;
                            break;
                        }
                    }
                    if (j === 0) {
                        fs.appendFileSync('other-files/' + info[0] + '.game', game + '\n', function (err) {
                            if (err) throw err;
                        });
                        msg.channel.send(createEmbed('#FF5959', game + ' has been added to the list of games!', undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, undefined, undefined));
                    }

                } else if (msgArgs[1] === "furry") {
                    createFile('other-files/' + info[0] + '.furry');
                    const data = fs.readFileSync('other-files/' + info[0] + '.furry', 'utf8');
                    const lines = data.split("\n");
                    let j = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i] === info[2]) {
                            msg.channel.send(createEmbed('#FF0000', msg.mentions.users.first().username + ' is already a furry!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
                            j = 1;
                            break;
                        }
                    }
                    if (j === 0) {
                        fs.appendFileSync('other-files/' + info[0] + '.furry', info[2] + '\n', function (err) {
                            if (err) throw err;
                        });
                        msg.channel.send(createEmbed('#FF5959', msg.mentions.users.first().username + ' has been added to the list of furries!', undefined, undefined, undefined, undefined, undefined, undefined, [], undefined, undefined, undefined));
                    }

                }
            } else {
                msg.channel.send(createEmbed('#FF0000', 'That\'s an invalid command!', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, undefined, undefined, [], undefined, undefined, undefined));
            }

            //Tells person what to play
        } else if (msgContent === '!game') {
            const info = msgInfo(msg);

            createFile('other-files/' + info[0] + '.game')
            const data = fs.readFileSync('other-files/' + info[0] + '.game', 'utf8');
            const lines = data.split("\n");
            const game = lines[Math.floor(Math.random() * (lines.length - 1))];

            const allGames = [];
            for (let i = 0; i < lines.length - 1; i++) {
                allGames.push("Game #" + (i + 1) + ':');
                allGames.push(lines[i]);
            }

            msg.channel.send(createEmbed('#00DEFF', 'Play ' + game + '.', undefined, undefined, undefined, undefined, undefined, undefined, allGames, undefined, undefined, undefined));

            //Tells a random person they are a furry
        } else if (msgContent === '!furry') {
            const info = msgInfo(msg);

            createFile('other-files/' + info[0] + '.furry');
            const data = fs.readFileSync('other-files/' + info[0] + '.furry', 'utf8');
            const lines = data.split("\n");
            const furry = lines[Math.floor(Math.random() * (lines.length - 1))];

            const allFurries = [];
            for (let i = 0; i < lines.length - 1; i++) {
                allFurries.push("Furry #" + (i + 1) + ':');
                allFurries.push('<@' + lines[i] + '>');
            }

            msg.channel.send(createEmbed('#F63F7C', '<@!' + furry + '> is a furry! Good luck coming out...', undefined, undefined, undefined, undefined, undefined, undefined, allFurries, undefined, undefined, undefined));

            //Tells a random pet they are the best
        } else if (msgContent === '!pet') {
            const info = msgInfo(msg);

            createFile('other-files/' + info[0] + '.pet');
            const data = fs.readFileSync('other-files/' + info[0] + '.pet', 'utf8');
            const lines = data.split("\n");
            const pet = lines[Math.floor(Math.random() * (lines.length - 1))];

            const allPets = [];
            for (let i = 0; i < lines.length - 1; i++) {
                allPets.push("Pet #" + (i + 1) + ':');
                allPets.push(lines[i]);
            }

            msg.channel.send(createEmbed('#FFFF00', pet + ' is the best!', undefined, undefined, undefined, undefined, undefined, undefined, allPets, undefined, undefined, undefined));
        }
    } catch (err) {
        console.error(err);
        msg.channel.send(createEmbed('#FF0000', 'An Error Occurred', undefined, 'ERROR', 'https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png', undefined, 'Contact administrator for help.', undefined, [], undefined, undefined, undefined));
    }
});

function msgInfo(msg) {
    const server = msg.guild.id;
    const author = msg.author;
    const authorID = author.id;
    const user = msg.mentions.users.first();
    let userId = undefined;
    if (user !== undefined) {
        userId = user.id;
    }
    return [server, authorID, userId];
}

function createFile(path) {
    if (fs.existsSync(path)) {

    } else {
        fs.appendFileSync(path, '', function (err) {
            if (err) throw thing
                ;
        });
    }
}

function checkUser(userID, path) {
    createFile(path);
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split("\n");
    const allArgs = [];
    const IDs = [];
    for (let i = 0; i < lines.length; i++) {
        allArgs.push(lines[i].split(" "));
        IDs.push(allArgs[i][0]);
    }

    for (let i = 0; i < IDs.length; i++) {
        return userID === IDs[i];
    }
}

function isAuthorUser(authorID, userID) {
    return authorID === userID;
}

function createEmbed(Color = '#000000', Title = '', URL = '', Author = '', AuthorImage = '', AuthorURL = '', Description = '', Thumbnail = '', Fields = [], Image = '', Footer = '', FooterURL = '') {
    const embed = new Discord.RichEmbed()
        .setColor(Color)
        .setTitle(Title)
        .setURL(URL)
        .setAuthor(Author, AuthorImage, AuthorURL)
        .setDescription(Description)
        .setThumbnail(Thumbnail)
        .setImage(Image)
        .setTimestamp()
        .setFooter(Footer, FooterURL);

    for (let i = 0; i <= Fields.length - 1; i += 2) {
        const name = Fields[i];
        const value = Fields[i + 1];
        embed.addField(name, value, true);
    }

    return embed;
}