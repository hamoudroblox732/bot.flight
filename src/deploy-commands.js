require("dotenv").config();

const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const required = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName("admin-channel-permissions").setDescription("تعديل صلاحيات الإدارة والرياكشنات").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false).toJSON(),
  new SlashCommandBuilder().setName("application-panel").setDescription("إرسال لوحة التقديمات").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false).toJSON(),
  new SlashCommandBuilder().setName("ticket-panel").setDescription("إرسال لوحة فتح التكتات").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false).toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering Karen Flight guild commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("تم تسجيل الأوامر في السيرفر المحدد فقط:", commands.map((command) => "/" + command.name).join(", "));
  } catch (error) {
    console.error("Command deployment failed:", error);
    process.exit(1);
  }
})();
