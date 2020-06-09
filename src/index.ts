import 'dotenv/config';
import { Message } from 'discord.js';
import { Song } from './interfaces/Queue';
import ytdl from 'ytdl-core';
import { inspect } from 'util';
import { execSync } from 'child_process';
import Util from './util/Util';

import Lambda from './structures/Client';

const client = new Lambda();

client.login();

client.once('ready', () => console.log('hi'));

client.on('message', async (message: Message) => {
  const { author, channel, content, guild, member } = message;
  if (author.bot || !guild || !member) return;

  if (content.startsWith('!')) {
    const args = content.replace(/^\!/, '').split(' ');
    const command = args.shift()?.toLowerCase();
    const query = args.join(' ');

    switch(command) {
      case 'join': {
        const connection = await member.voice?.channel?.join();
        if (connection) {
          client.connections.set(guild.id, connection);
          await message.react('✅');
        }
        break;
      }
      case 'play': {
        let connection = client.connections.get(guild.id);
        const url = args[0];
        if (!connection) {
          if (!url) return message.reply('need to put link');
          connection = await member.voice?.channel?.join();
          if (connection) client.connections.set(guild.id, connection);
          else return message.reply('you are not in a voice channel.');
        }

        if (!args[0]) return message.reply('need to put link');

        const queue = client.queue.get(guild.id);
        let songs: Song[] = [];
        if (queue) songs = queue.songs;
        client.queue.set(guild.id, { songs: [...songs, { url, requester: author.id }] })

        const dispacther = await connection.play(ytdl(url, { filter: 'audioonly' }));
        client.dispatchers.set(guild.id, dispacther)
        await message.react('✅');
        break;
      }
      case 'pause': {
        const connection = client.connections.get(guild.id);
        const dispatcher = client.dispatchers.get(guild.id);
        if (!connection || !dispatcher) return message.reply('I am not playing music.');

        dispatcher.pause();

        await message.react('✅');
        break;
      }
      case 'resume': {
        const connection = client.connections.get(guild.id);
        const dispatcher = client.dispatchers.get(guild.id);
        if (!connection || !dispatcher) return message.reply('I am not playing music.');

        dispatcher.resume();

        await message.react('✅');
        break;
      }
      case 'compile':
      case 'comp':
      case 'ev':
      case 'eval': {
        if (author.id !== '385132696135008259') return;
        if (!query) return message.reply('you need to input an expression for me to run.');

        const value = (str: string) => Util.code(str, 'js')
          .replace(new RegExp(client.token as string, 'g'), () => '*'.repeat((client.token as string).length));
        const exec = (str: string) => execSync(str).toString();

        let res = 'null';
        const toEval = query.replace(/(^`{3}(\w+)?|`{3}$)/g, '');

        try {
          let evald = eval(toEval);

          if (Util.isPromise(evald)) res = `Promise Result: ${value(await Promise.resolve(evald))}`;
          else res = `Result: ${value(inspect(evald, { depth: 0, showHidden: true }))}`;
        } catch(err) {
          res = `Error: ${value(err.stack ?? err)}`;
        } finally {
          await channel.send(res, { split: true });
        }
        break;
      }
      default: {
        await message.reply('unknown command.');
      }
    }
  }
});
