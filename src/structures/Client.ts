import { Client, Collection, VoiceConnection, StreamDispatcher } from 'discord.js';
import { Queue } from '../interfaces/Queue'

class Lambda extends Client {
  public connections: Collection<string, VoiceConnection> = new Collection();

  public queue: Collection<string, Queue> = new Collection();

  public dispatchers: Collection<string, StreamDispatcher> = new Collection();
}

export default Lambda;
