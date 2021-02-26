import { IEvent } from '../interfaces/event'
import { client, clientCommands } from '../main'
const prefix = process.env.CMD_PREFIX as string

module.exports = class Ready implements IEvent {
    public async execute(): Promise<void> {
        console.log(`Logged in as ${client?.user?.tag}! CMD_PREFIX: ${prefix}`)
        console.log(`------------------------ Commands ------------------------`)
        console.log(clientCommands)
        console.log(`----------------------------------------------------------`)
    }
}
