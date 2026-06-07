// index.js

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  SlashCommandBuilder,
  email,
} = require("discord.js");
(async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName("news")
      .setDescription("ニュースを投稿する")
      .addStringOption((opt) =>
        opt.setName("title").setDescription("タイトル").setRequired(true),
      )
      .addStringOption((opt) =>
        opt.setName("content").setDescription("内容").setRequired(true),
      ),
    new SlashCommandBuilder().setName("list").setDescription("ニュース一覧"),
    new SlashCommandBuilder()
      .setName("remove")
      .setDescription("ニュースを削除する")
      .addStringOption((opt) =>
        opt.setName("id").setDescription("id").setRequired(true),
      ),
  ].map((cmd) => cmd.toJSON());
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  async function sndNews(name, content) {
    const url = "https://news.daikonsv.f5.si/news";

    const res = await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        name,
        content,
        date: Math.floor(Date.now() / 1000),
      }),
      headers: {
        "Content-Type": "application/json",
        "X-RSS-Token": process.env.RSS_TOKEN,
      },
    });

    if (!res.ok) {
      console.error("Failed to send news:", res.status, await res.text());
    }

    return res;
  }
  async function rmNews(id) {
    const url = "https://news.daikonsv.f5.si/news";

    const res = await fetch(url, {
      method: "DELETE",
      body: JSON.stringify({
        id,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-RSS-Token": process.env.RSS_TOKEN,
      },
    });

    if (!res.ok) {
      console.error("Failed to rem news:", res.status, await res.text());
    }

    return res;
  }
  async function lsNews() {
    const url = "https://news.daikonsv.f5.si/news";

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RSS-Token": process.env.RSS_TOKEN,
      },
    });

    if (!res.ok) {
      console.error("Failed to get news:", res.status, await res.text());
    }

    return res;
  }
  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (
      interaction.commandName === "news" &&
      interaction.guildId === "1511987902324932628"
    ) {
      if (!interaction.member.roles.cache.has("1511989488405184583")) {
        await interaction.reply({
          content: "権限が足りません",
          ephemeral: true,
        });
        return;
      }

      const title = interaction.options.getString("title");
      const content = interaction.options.getString("content");

      await interaction.deferReply({ ephemeral: true });

      await sndNews(title, content);

      await interaction.editReply({ content: "送信しました！" });
    }

    if (
      interaction.commandName === "remove" &&
      interaction.guildId === "1511987902324932628"
    ) {
      if (!interaction.member.roles.cache.has("1511989488405184583")) {
        await interaction.reply({
          content: "権限が足りません",
          ephemeral: true,
        });
        return;
      }

      const id = interaction.options.getString("id");

      await interaction.deferReply({ ephemeral: true });

      await rmNews(id);

      await interaction.editReply({ content: "削除しました" });
    }
    if (
      interaction.commandName === "list" &&
      interaction.guildId === "1511987902324932628"
    ) {
      if (
        /*!interaction.member.roles.cache.has("1511989488405184583")*/ false
      ) {
        await interaction.reply({
          content: "権限が足りません",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
let list = await lsNews();
list = await list.json(); 
      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            author: {
              name: "RSS Field", url: "https://news.daikonsv.f5.si"
            },
            description: "```json\n" + JSON.stringify(list, null, 2) + "\n```",
            title: "",
          }),
        ],
      });
    }
  });

  client.login(process.env.DISCORD_TOKEN);
})();
