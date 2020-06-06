import 'dotenv/config';
import { Message } from 'discord.js';
import { Song } from './interfaces/Queue';
import ytdl from 'ytdl-core';

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
        if (!connection) {
          connection = await member.voice?.channel?.join();
          if (connection) client.connections.set(guild.id, connection);
          else return message.reply('error');
        }

        if (!args[0]) return message.reply('need to put link');

        const url = args[0];
        const queue = client.queue.get(guild.id);
        let songs: Song[] = [];
        if (queue) songs = queue.songs;
        client.queue.set(guild.id, { songs: [...songs, { url, requester: author.id }] })

        const dispacther = await connection.play(ytdl(url, { filter: 'audioonly' }));
        client.dispatchers.set(guild.id, dispacther)
        await message.react('✅');
        break;
      }
      default: {
        await message.reply('unknown command.');
      }
    }
  }
});
