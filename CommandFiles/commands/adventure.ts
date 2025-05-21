import { UNISpectra } from "@cassidy/unispectra";


const zones: Zone[] = [
  { key: "shadow_valley", name: "Shadow Valley", description: "A misty valley with hidden relics." },
  { key: "flame_peaks", name: "Flame Peaks", description: "Volcanic peaks with rare ores." },
  { key: "mist_isles", name: "Mist Isles", description: "Foggy islands with ancient ruins." },
  { key: "frost_caverns", name: "Frost Caverns", description: "Icy caves with frozen treasures." },
  { key: "sand_dunes", name: "Sand Dunes", description: "Endless dunes hiding a lost caravan." },
  { key: "sky_temples", name: "Sky Temples", description: "Floating temples with mystical artifacts." },
  { key: "dark_forest", name: "Dark Forest", description: "A haunted forest with cursed relics." },
  { key: "crystal_lake", name: "Crystal Lake", description: "A shimmering lake with magical crystals." },
  { key: "thunder_cliffs", name: "Thunder Cliffs", description: "Stormy cliffs with electrified gems." },
  { key: "abyss_ruins", name: "Abyss Ruins", description: "Sunken ruins with forgotten secrets." },
  { key: "ownirv2_company", name: "Ownirv2 Company", description: "Explore the world of aggni members of ownirsV2 Company." },
];

const outcomes: Outcome[] = [
  { type: "loot", description: "Discovered a hidden cache!", rewards: { coins: 150, itemKey: "crystal_shard", quantity: 2 } },
  { type: "enemy", description: "Fought off a bandit ambush!", rewards: { coins: 100 } },
  { type: "obstacle", description: "Navigated a treacherous path!", rewards: { coins: 50 } },
  { type: "treasure", description: "Unearthed an ancient chest!", rewards: { coins: 200, itemKey: "golden_amulet", quantity: 1 } },
  { type: "beast", description: "Defeated a wild beast guarding treasure!", rewards: { coins: 120, itemKey: "beast_fang", quantity: 3 } },
  { type: "trap", description: "Escaped a deadly trap with minor loot!", rewards: { coins: 80, itemKey: "rusty_key", quantity: 1 } },
  { type: "mystic", description: "Encountered a mystic spirit and gained wisdom!", rewards: { coins: 100, itemKey: "spirit_essence", quantity: 2 } },
  { type: "riddle", description: "Solved a riddle to unlock a secret stash!", rewards: { coins: 180, itemKey: "silver_coin", quantity: 5 } },
];

const command: Command = {
  meta: {
    name: "adventure",
    otherNames: ["explore"],
    version: "1.0.0",
    author: "Aljur Pogoy",
    description: "Register as an adventurer or explore mystical zones to gain rewards and items!",
    category: "Adventure Games",
    usage: "adventure register <name> | adventure <zone_key> | adventure list | adventure inventory | adventure trade <item> <quantity> <target_userID> | adventure rest",
  },
  style: {
    title: {
      content: `${UNISpectra.charm} ADVENTURE 〘 🌍 〙`,
      line_bottom: "default",
      text_font: "double_struck",
    },
    content: {
      text_font: "fancy",
      line_bottom_inside_x: "default",
      content: null,
    },
    footer: {
      content: "Developed by: Aljur Pogoy",
      text_font: "fancy",
    },
  },
  async entry(ctx: CommandContext) {
    const { output, input, usersDB, args } = ctx;
    const userID = input.sid;
    const subcommand = (args[0] || "").toLowerCase();

    if (!usersDB) {
      try {
        return await output.replyStyled(
          [
            `❌ Internal error: Data cache not initialized. Contact bot admin. ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure to see zones`
          ].join("\n"),
          command.style
        );
      } catch (e) {
        return await output.reply(
          [
            `❌ Internal error: Data cache not initialized. Contact bot admin. ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure to see zones`
          ].join("\n")
        );
      }
    }

    let userData: UserData = await usersDB.getItem(userID);
    if (!userData) {
      userData = { adventure: { inventory: {} }, money: 0, exp: 0, battlePoints: 0 };
    }
    if (!userData.adventure) {
      userData.adventure = { inventory: {} };
    }

    if (subcommand === "register") {
      if (!args[1]) {
        try {
          return await output.replyStyled(
            [
              `❌ You need to provide a name! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `Use: adventure register <name>`,
              `Example: adventure register Shadow_Warrior`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ You need to provide a name! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `Use: adventure register <name>`,
              `Example: adventure register Shadow_Warrior`
            ].join("\n")
          );
        }
      }

      const name = args.slice(1).join("_");

      if (userData?.name) {
        try {
          return await output.replyStyled(
            [
              `❌ You're already registered as **${userData.name}**! ${UNISpectra.charm}`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ You're already registered as **${userData.name}**! ${UNISpectra.charm}`
            ].join("\n")
          );
        }
      }

      const existing = await usersDB.queryItemAll(
        { "value.name": { $regex: `^${name}$`, $options: "i" } },
        "adventure"
      );
      if (Object.keys(existing).length > 0) {
        try {
          return await output.replyStyled(
            [
              `❌ Name **${name}** is already taken! Choose another. ${UNISpectra.charm}`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ Name **${name}** is already taken! Choose another. ${UNISpectra.charm}`
            ].join("\n")
          );
        }
      }

      const newUserData: UserData = {
        ...userData,
        name,
        adventure: { ...userData.adventure, inventory: userData.adventure.inventory || {} },
        money: userData.money || 0,
        exp: userData.exp || 0,
        battlePoints: userData.battlePoints || 0,
      };

      await usersDB.setItem(userID, newUserData);

      return await output.replyStyled(
        [
          `✅ Registered as **${name}**! ${UNISpectra.charm}`,
          `${UNISpectra.standardLine}`,
          `Start exploring with: adventure <zone_key>`,
          `Check inventory with: adventure inventory`
        ].join("\n"),
        command.style
      );
    }

    if (!userData.name) {
      try {
        return await output.replyStyled(
          [
            `❌ You're not registered! ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure register <name>`,
            `Example: adventure register Shadow_Warrior`
          ].join("\n"),
          command.style
        );
      } catch (e) {
        return await output.reply(
          [
            `❌ You're not registered! ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure register <name>`,
            `Example: adventure register Shadow_Warrior`
          ].join("\n")
        );
      }
    }

    if (subcommand === "list") {
      let content = [`📋 **Adventurer List** ${UNISpectra.charm}`];
      const allUsers = await usersDB.queryItemAll(
        { "value.name": { $exists: true } },
        "adventure",
        "money"
      );

      for (const [userId, data] of Object.entries(allUsers)) {
        if (data.name) {
          const inventory = data.adventure?.inventory || {};
          const items = Object.entries(inventory)
            .map(([key, item]) => `${key.replace("_", " ")}: ${item.quantity || 0}`)
            .join(", ") || "None";
          content.push(
            `${UNISpectra.standardLine}`,
            `🌍 **${data.name}**`,
            `**User ID**: ${userId}`,
            `**Inventory**: ${items}`,
            `**Coins**: ${data.money || 0} 💵`
          );
        }
      }

      if (content.length === 1) {
        content.push(`${UNISpectra.standardLine}`, `No adventurers registered yet! ${UNISpectra.charm}`);
      }

      try {
        return await output.replyStyled(content.join("\n"), command.style);
      } catch (e) {
        return await output.reply(content.join("\n"));
      }
    }

    if (subcommand === "inventory") {
      const inventory = userData.adventure.inventory || {};
      const items = Object.entries(inventory)
        .map(([key, { quantity }]) => `${key.replace("_", " ")}: ${quantity}`)
        .join(", ") || "No items yet!";
      const content = [
        `👤 **${userData.name}** ${UNISpectra.charm}`,
        `${UNISpectra.standardLine}`,
        `**Items**: ${items}`,
        `**Coins**: ${userData.money || 0} 💵`,
        `${UNISpectra.standardLine}`,
        `> 𝖳𝗋𝖺𝖽𝖾 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁: 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗍𝗋𝖺𝖽𝖾 <𝗂𝗍𝖾𝗆> <𝗊𝗎𝖺𝗇𝗍𝗂𝗍𝗒> <𝗍𝖺𝗋𝗀𝖾𝗍_𝗎𝗌𝖾𝗋𝖨𝖣>`,
        `> 𝖱𝖾𝖼𝗈𝗏𝖾𝗋 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁: 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗋𝖾𝗌𝗍`
      ];

      try {
        return await output.replyStyled(content.join("\n"), command.style);
      } catch (e) {
        return await output.reply(content.join("\n"));
      }
    }

    if (subcommand === "trade") {
      if (args.length < 4) {
        try {
          return await output.replyStyled(
            [
              `❌ You need to provide item, quantity, and target user ID! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `**Use:** adventure trade <item> <quantity> <target_userID>`,
              `**Example:** adventure trade crystal_shard 2 123456`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ You need to provide item, quantity, and target user ID! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `**Use:** adventure trade <item> <quantity> <target_userID>`,
              `**Example:** adventure trade crystal_shard 2 123456`
            ].join("\n")
          );
        }
      }

      const itemKey = args[1].toLowerCase();
      const quantity = parseInt(args[2]);
      const targetUserID = args[3];

      if (isNaN(quantity) || quantity <= 0) {
        try {
          return await output.replyStyled(
            [
              `❌ Invalid quantity! Must be a positive number. ${UNISpectra.charm}`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ Invalid quantity! Must be a positive number. ${UNISpectra.charm}`
            ].join("\n")
          );
        }
      }

      const userInventory = userData.adventure.inventory || {};
      if (!userInventory[itemKey] || userInventory[itemKey].quantity < quantity) {
        try {
          return await output.replyStyled(
            [
              `❌ You don't have enough **${itemKey.replace("_", " ")}**! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `**Check your inventory with:** adventure inventory`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ You don't have enough **${itemKey.replace("_", " ")}**! ${UNISpectra.charm}`,
              `${UNISpectra.standardLine}`,
              `**Check your inventory with:** adventure inventory`
            ].join("\n")
          );
        }
      }

      const targetUserData = await usersDB.getItem(targetUserID);
      if (!targetUserData || !targetUserData.name) {
        try {
          return await output.replyStyled(
            [
              `❌ Target user **${targetUserID}** not found or not registered! ${UNISpectra.charm}`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ Target user **${targetUserID}** not found or not registered! ${UNISpectra.charm}`
            ].join("\n")
          );
        }
      }

      if (targetUserID === userID) {
        try {
          return await output.replyStyled(
            [
              `❌ You can't trade with yourself! ${UNISpectra.charm}`
            ].join("\n"),
            command.style
          );
        } catch (e) {
          return await output.reply(
            [
              `❌ You can't trade with yourself! ${UNISpectra.charm}`
            ].join("\n")
          );
        }
      }
      const newUserData: UserData = { ...userData };
      newUserData.adventure.inventory[itemKey].quantity -= quantity;
      if (newUserData.adventure.inventory[itemKey].quantity === 0) {
        delete newUserData.adventure.inventory[itemKey];
      }

      const newTargetUserData: UserData = { ...targetUserData };
      newTargetUserData.adventure.inventory = newTargetUserData.adventure.inventory || {};
      newTargetUserData.adventure.inventory[itemKey] = {
        quantity: (newTargetUserData.adventure.inventory[itemKey]?.quantity || 0) + quantity,
      };

      await usersDB.setItem(userID, newUserData);
      await usersDB.setItem(targetUserID, newTargetUserData);

      try {
        return await output.replyStyled(
          [
            `✅ **${userData.name} traded!** ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Traded: ${quantity} **${itemKey.replace("_", " ")}** to **${targetUserData.name}** (ID: ${targetUserID})`,
            `Check inventory with: adventure inventory`
          ].join("\n"),
          command.style
        );
      } catch (e) {
        return await output.reply(
          [
            `✅ **${userData.name} traded!** ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `**Traded:** ${quantity} **${itemKey.replace("_", " ")}** to **${targetUserData.name}** (ID: ${targetUserID})`,
            `**Check inventory with:** adventure inventory`
          ].join("\n")
        );
      }
    }

    if (subcommand === "rest") {
      const newUserData: UserData = { ...userData };
      const itemRecovered = outcomes[Math.floor(Math.random() * outcomes.length)].rewards?.itemKey || "random_item";
      const quantityRecovered = Math.floor(Math.random() * 3) + 1;

      newUserData.adventure.inventory = newUserData.adventure.inventory || {};
      newUserData.adventure.inventory[itemRecovered] = {
        quantity: (newUserData.adventure.inventory[itemRecovered]?.quantity || 0) + quantityRecovered,
      };

      await usersDB.setItem(userID, newUserData);

      try {
        return await output.replyStyled(
          [
            `✅ **${userData.name} rested!** ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `**Recovered**: ${quantityRecovered} **${itemRecovered.replace("_", " ")}**`,
            `Check inventory with: adventure inventory`
          ].join("\n"),
          command.style
        );
      } catch (e) {
        return await output.reply(
          [
            `✅ **${userData.name} rested!** ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `**Recovered**: ${quantityRecovered} **${itemRecovered.replace("_", " ")}**`,
            `Check inventory with: adventure inventory`
          ].join("\n")
        );
      }
    }

    if (!args[0]) {
      let content = [` **Adventures ZONE** ${UNISpectra.charm}`];
      zones.forEach((z) => {
        content.push(
          `${UNISpectra.standardLine}`,
          `🌍 ${z.name}`,
          `**Key:** ${z.key}`,
          `**Description:** ${z.description}`
        );
      });
      content.push(
        `${UNISpectra.standardLine}`,
        `> 𝖴𝗌𝖾 #𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 <𝗓𝗈𝗇𝖾_𝗄𝖾𝗒> 𝗍𝗈 𝖾𝗑𝗉𝗅𝗈𝗋𝖾`,
        `**𝖤𝗑𝖺𝗆𝗉𝗅𝖾:** #𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗌𝗁𝖺𝖽𝗈𝗐_𝗏𝖺𝗅𝗅𝖾𝗒`,
        `**𝖴𝗌𝖾** #𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗅𝗂𝗌𝗍 𝗍𝗈 𝗌𝖾𝖾 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾𝗋𝗌`,
        `**𝖢𝗁𝖾𝖼𝗄 𝗂𝗇𝗏𝖾𝗇𝗍𝗈𝗋𝗒 𝗐𝗂𝗍𝗁:** 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗂𝗇𝗏𝖾𝗇𝗍𝗈𝗋𝗒`,
        `**𝖳𝗋𝖺𝖽𝖾 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁:** 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗍𝗋𝖺𝖽𝖾`,
        `**𝖱𝖾𝖼𝗈𝗏𝖾𝗋 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁:** 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗋𝖾𝗌𝗍`
      );

      try {
        return await output.replyStyled(content.join("\n"), command.style);
      } catch (e) {
        return await output.reply(content.join("\n"));
      }
    }

    const zoneKey = args[0].toLowerCase();
    const zone = zones.find((z) => z.key === zoneKey);

    if (!zone) {
      try {
        return await output.replyStyled(
          [
            `❌ Invalid zone key! ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure to see zones`,
            `Example: adventure shadow_valley`
          ].join("\n"),
          command.style
        );
      } catch (e) {
        return await output.reply(
          [
            `❌ Invalid zone key! ${UNISpectra.charm}`,
            `${UNISpectra.standardLine}`,
            `Use: adventure to see zones`,
            `Example: adventure shadow_valley`
          ].join("\n")
        );
      }
    }

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const newUserData: UserData = { ...userData };

    newUserData.money = (newUserData.money || 0) + (outcome.rewards?.coins || 0);

    if (outcome.rewards?.itemKey) {
      newUserData.adventure.inventory = newUserData.adventure.inventory || {};
      newUserData.adventure.inventory[outcome.rewards.itemKey] = {
        quantity: (newUserData.adventure.inventory[outcome.rewards.itemKey]?.quantity || 0) + (outcome.rewards.quantity || 0),
      };
    }

    await usersDB.setItem(userID, newUserData);

    const content = [
      `✅ Adventured in **${zone.name}**! ${UNISpectra.charm}`,
      `${UNISpectra.standardLine}`,
      `**Event**: ${outcome.description}`,
      outcome.rewards?.coins ? `**Earned**: ${outcome.rewards.coins} coins 💵` : "",
      outcome.rewards?.itemKey ? `**Found**: ${outcome.rewards.quantity} **${outcome.rewards.itemKey.replace("_", " ")}**` : "",
      `${UNISpectra.standardLine}`,
      `> 𝖢𝗁𝖾𝖼𝗄 𝗂𝗇𝗏𝖾𝗇𝗍𝗈𝗋𝗒 𝗐𝗂𝗍𝗁: 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗂𝗆𝗏𝖾𝗇𝗍𝗈𝗋𝗒`,
      `> 𝖳𝗋𝖺𝖽𝖾 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁: 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗍𝗋𝖺𝖽𝖾`,
      `> 𝖱𝖾𝖼𝗈𝗏𝖾𝗋 𝗂𝗍𝖾𝗆𝗌 𝗐𝗂𝗍𝗁: 𝖺𝖽𝗏𝖾𝗇𝗍𝗎𝗋𝖾 𝗋𝖾𝗌𝗍`
    ].filter(Boolean);

    try {
      return await output.replyStyled(content.join("\n"), command.style);
    } catch (e) {
      return await output.reply(content.join("\n"));
    }
  },
};

export default command;
