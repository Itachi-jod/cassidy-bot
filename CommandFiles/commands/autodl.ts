import { getFbVideoInfo } from "fb-downloader-scrapper";

export const meta: CassidySpectra.CommandMeta = {
  name: "autodl",
  description: "Autodownloader for Facebook videos. Automatically detects and downloads media from Facebook URLs. Upcoming support: Spotify, YouTube, YouTube Music, Twitter, and Instagram.",
  version: "1.0.0",
  author: "0xVoid",
  requirement: "2.5.0",
  category: "Media",
  icon: "📥",
};
function formatDuration(durationMs: number) {
  const units = [
    { unit: 'hr', factor: 3600000 },
    { unit: 'min', factor: 60000 },
    { unit: 'sec', factor: 1000 },
    { unit: 'ms', factor: 1 },
  ];
  for (const { unit, factor } of units) {
    if (durationMs >= factor) {
      const value = durationMs / factor;
      return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
    }
  }
  return '0 ms';
}
export async function entry() { }
export async function event({
  output,
  input
}: CommandContext) {
  try {
    const prompt = input.links[0];
    //checkpoint
    if (!prompt == undefined) {
      //sorry fbpicture(link) is not yet supported
      if (prompt.match(/^https:\/\/(www\.)?(facebook.com\/share\/v|fb\.watch)/)?.length > 0) {
        const data = await getFbVideoInfo(prompt);
        let Title = data.title;
        // Function to wrap unmatched text with **
        function wrapUnmatched(text: any) {
          return `**${text}**`;
        }

        // Convert HTML entities to emojis
        const emojiMatch = Title.match(/&#x([0-9a-fA-F-]+);?/g);

        if (emojiMatch) {
          emojiMatch.forEach(match => {
            try {
              const hexStr = match.replace(/&#x|;/g, '').toUpperCase();
              const codePoints = hexStr.split('-').map(part => parseInt(part, 16));
              const emoji = String.fromCodePoint(...codePoints);
              Title = Title.replace(match, emoji);
            } catch (error) {
              // If the conversion fails, remove the unmatched entity
              Title = Title.replace(match, '');
            }
          });
        }

        // Wrap text starting with # with **
        Title = Title.replace(/#\w+/g, match => wrapUnmatched(match));
        if (data.hd || data.sd) {
          output.react("📥");
          await output.reply({
            body: `${Title}\nDuration:${formatDuration(data.duration_ms)}`,
            attachment: await global.utils.getStreamFromURL(data.hd || data.sd)
          });
          output.react("✅")
        } else {
          output.react("❌");
        }
      }
    }
  } catch (err) {
    output.reply(require("util").inspect(err));
  }
}
