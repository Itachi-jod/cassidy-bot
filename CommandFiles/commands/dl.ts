// Import required modules for downloading media from Facebook, TikTok, and making HTTP requests
import { getFbVideoInfo } from "fb-downloader-scrapper";
import Tiktok from "@tobyg74/tiktok-api-dl";
import axios from 'axios';

// Define metadata for the autodl command
export const meta: CassidySpectra.CommandMeta = {
  name: "autodl",
  description:
    "Autodownloader for Facebook, Tiktok, and Youtube videos. Automatically detects and downloads media from Facebook URLs. Upcoming support: Spotify, Twitter, and Instagram.",
  version: "1.1.0",
  author: "0xVoid",
  requirement: "2.5.0",
  icon: "📥",
  category: "Media",
  role: 1,
  noWeb: true,
};

// Convert HTML entities to emojis and format hashtags in text
function convertHtmlEntitiesToEmoji(text: string): string {
  // Match HTML entities for emojis
  const emojiMatch = text.match(/&#x([0-9a-fA-F-]+);?/g);
  if (emojiMatch) {
    emojiMatch.forEach(match => {
      try {
        // Extract and parse hexadecimal code points
        const hexStr = match.replace(/&#x|;/g, '').toUpperCase();
        const codePoints = hexStr.split('-').map(part => parseInt(part, 16));
        // Convert code points to emoji
        const emoji = String.fromCodePoint(...codePoints);
        text = text.replace(match, emoji);
      } catch (error) {
        // Remove invalid entities
        text = text.replace(match, '');
      }
    });
  }

  // Wrap hashtags in bold for formatting
  text = text.replace(/#\w+/g, match => `**${match}**`);

  return text;
}

// Handle enabling/disabling the autodl feature
export async function entry({
  output,
  input,
  threadsDB,
  args,
}: CommandContext) {
  // Check if user has admin privileges
  if (!input.isAdmin) {
    return output.reply("You cannot enable/disable this feature.");
  }
  // Retrieve current autodl status
  const isEna = (await threadsDB.queryItem(input.threadID, "autodl"))?.autodl;
  // Determine new state based on arguments or toggle current state
  let choice =
    args[0] === "on" ? true : args[0] === "off" ? false : isEna ? !isEna : true;
  // Update autodl setting in database
  await threadsDB.setItem(input.threadID, {
    autodl: choice,
  });

  // Respond with success message
  return output.reply(`✅ ${choice ? "Enabled" : "Disabled"} successfully!`);
}

// Handle automatic downloading of media from URLs
export async function event({ output, input, threadsDB }: CommandContext) {
  try {
    // Check if autodl is enabled for the thread
    const cache = await threadsDB.getCache(input.threadID);
    if (cache.autodl === false) {
      return;
    }
    // Get the first URL from input
    const prompt = input.links[0];
    if (!prompt == undefined) {
      // Handle Facebook video URLs
      if (prompt.match(/^https:\/\/(www\.)?(facebook.com\/share\/v|fb\.watch)/)?.length > 0) {
        // Fetch video information
        const data = await getFbVideoInfo(prompt);
        // Convert title entities to emojis
        let Title = convertHtmlEntitiesToEmoji(data.title);

        // Download and send video if available
        if (data.hd || data.sd) {
          output.react("📥");
          await output.reply({
            body: `${Title}`,
            attachment: await global.utils.getStreamFromURL(data.hd || data.sd)
          });
          output.react("✅");
        } else {
          output.react("❌");
        }
      }

      // Handle TikTok video URLs
      if (prompt.match(/^https:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vt\.tiktok\.com\/[\w-]+\/?)$/)?.length > 0) {
        // Download TikTok video
        const data = await Tiktok.Downloader(prompt, { version: "v3" })
        // Convert description entities to emojis
        let Title = convertHtmlEntitiesToEmoji(data.result.desc)
        // Download and send video if available
        if (data.result.videoHD) {
          output.react("📥");
          await output.reply({
            body: `${Title}`,
            attachment: await global.utils.getStreamFromURL(data.result.videoHD)
          });
          output.react("✅");
        } else {
          output.react("❌");
        }
      }

      // Handle YouTube video URLs
      if (prompt.match(/^https:\/\/(www\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}(\?.*)?$/)) {
        // Fetch video via external API
        const response = await axios.get('https://dl-production-90be.up.railway.app/api/ytdl', {
          params: {
            link: prompt,
            quality: 'high'
          }
        });
        const { title, url } = response.data;
        // Convert title entities to emojis
        let Title = convertHtmlEntitiesToEmoji(title)
        try {
          // Download and send video
          output.react("📥");
          await output.reply({
            body: `${Title}`,
            attachment: await global.utils.getStreamFromURL(url)
          });
          output.react("✅");
        } catch {
          output.react("❌");
        }
      }
    }
  } catch (err) {
    // Reply with error details if an exception occurs
    output.reply(require("util").inspect(err));
  }
}
