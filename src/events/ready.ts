import { Client } from "discord.js"
import { IEvent } from "../interfaces/event"
import { clientCommands } from '../main'
const prefix = process.env.cmdPrefix as string

module.exports = class Ready implements IEvent {
    public async execute(client: Client) {
        console.log(`Logged in as ${client?.user?.tag}! cmdPrefix: ${prefix}`)
        console.log(`------------------------ Commands ------------------------`)
        console.log(clientCommands)
        console.log(`----------------------------------------------------------`)
    }
}
