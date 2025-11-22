import {Client} from '@heroiclabs/nakama-js'

const client = new Client(process.env.NAKAMA_SERVER_KEY as string, "127.0.0.1", "7350", false, 10000)

export default client
