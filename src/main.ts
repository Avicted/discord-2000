import { Message } from "discord.js";
const Discord = require('discord.js');

const client = new Discord.Client()
const cmdPrefix = process.env.cmdPrefix

client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}! cmdPrefix: ${cmdPrefix}`)
})

client.on('message', (msg: Message) => {
    console.log(msg.content)
    if (msg.content === `${cmdPrefix}ping`) {
        msg.reply('Pong!')
    }
})

client.login(process.env.token)
