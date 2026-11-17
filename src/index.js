require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  Events
} = require("discord.js");

const required = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const ROLE_DEFINITIONS = [
  { name: "Owner", color: 0xD6B56D, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewAuditLog] },
  { name: "Administration", color: 0xB84A4A, permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ViewAuditLog] },
  { name: "Management", color: 0xA58AC7, permissions: [PermissionFlagsBits.ManageMessages] },
  { name: "Pilot", color: 0x3977C3, permissions: [] },
  { name: "First Officer", color: 0x5796C9, permissions: [] },
  { name: "Cabin Crew", color: 0xD18AAB, permissions: [] },
  { name: "Ground Staff", color: 0x58A58C, permissions: [] },
  { name: "Passenger", color: 0x8A929B, permissions: [] }
];

const STAFF_ROLES = ["Owner", "Administration", "Management"];
const CREW_ROLES = [...STAFF_ROLES, "Pilot", "First Officer", "Cabin Crew", "Ground Staff"];

const CHANNEL_GROUPS = [
  {
    name: "『 الإدارة ・⚙️』",
    access: "staff",
    channels: [
      { name: "『الإعلانات・📢』", type: "notice", title: "الإعلانات الرسمية", description: "هنا تنشر إدارة Karen Flight الأخبار والتنبيهات والقرارات الرسمية. تابع الروم باستمرار حتى ما يفوتك أي تحديث.", rules: ["الإدارة فقط تنشر الإعلانات.", "ممنوع النقاش أو إرسال الرسائل العشوائية هنا."] },
      { name: "『إدارة-الشركة・🔒』", type: "staff", title: "إدارة الشركة", description: "روم خاص بالإدارة لتنظيم شؤون الشركة ومتابعة المهام والقرارات الداخلية.", rules: ["للاستخدام الإداري فقط.", "حافظ على سرية معلومات الشركة."] },
      { name: "『سجل-الإدارة・📋』", type: "staff", title: "سجل الإدارة", description: "توثيق الملاحظات والإجراءات الإدارية المهمة داخل الشركة.", rules: ["اكتب ملخصاً واضحاً لكل إجراء.", "لا تحذف أو تعدّل سجلات الآخرين دون صلاحية."] }
    ]
  },
  {
    name: "『 المعلومات ・📚』",
    access: "public",
    channels: [
      { name: "『القوانين・📜』", type: "notice", title: "قوانين Karen Flight", description: "القوانين الأساسية لأعضاء الشركة والمسافرين.", rules: ["احترم جميع الأعضاء والموظفين.", "ممنوع السب أو الإزعاج أو إثارة المشاكل.", "التزم بتعليمات الإدارة وطاقم الرحلة.", "لا تنتحل صفة موظف أو طيار.", "استخدم كل روم للغرض المخصص له.", "ممنوع نشر روابط أو إعلانات دون إذن الإدارة.", "قد تتخذ الإدارة إجراءً عند مخالفة القوانين."] },
      { name: "『مميزات・🌟』", type: "notice", title: "مميزات الشركة", description: "تُعلن هنا مزايا الانضمام إلى Karen Flight والفعاليات والخدمات المتاحة للأعضاء.", rules: ["تابع التحديثات لمعرفة المميزات الجديدة.", "أي ميزة غير معلنة رسمياً لا تعتبر معتمدة."] },
      { name: "『الرتب・🎖️』", type: "notice", title: "الرتب والمسميات", description: "شرح الرتب والمسميات الوظيفية في Karen Flight.", rules: ["Owner: مالك الشركة.", "Administration: الإدارة.", "Management: الإدارة التشغيلية.", "Pilot: طيار.", "First Officer: مساعد طيار.", "Cabin Crew: طاقم الضيافة.", "Ground Staff: الخدمات الأرضية.", "Passenger: مسافر أو عضو."] },
      { name: "『التقديم・📝』", type: "notice", title: "التقديم للوظائف", description: "اقرأ شروط التقديم واتبع الطريقة التي تعلنها الإدارة. إذا كان التقديم عبر موقع الشركة، استخدم رابط الموقع الرسمي الذي تنشره الإدارة فقط.", rules: ["تأكد من صحة بياناتك قبل الإرسال.", "يُمنع تقديم معلومات غير صحيحة.", "لا تكرر التقديم لنفس الوظيفة دون السماح بذلك.", "قرار القبول النهائي للإدارة."] },
      { name: "『الأسئلة・❔』", type: "chat", title: "الأسئلة والاستفسارات", description: "اسأل هنا عن الشركة والوظائف والرحلات. اكتب سؤالك بوضوح وانتظر رد الموظف المختص.", rules: ["ابحث أولاً في الرومات المعلوماتية.", "لا تكرر السؤال أو تعمل منشن جماعي.", "كن محترماً في النقاش."] }
    ]
  },
  {
    name: "『 التواصل ・💬』",
    access: "public",
    channels: [
      { name: "『الشات・💬』", type: "chat", title: "الدردشة العامة", description: "مساحة للأعضاء للتعارف والنقاش والتواصل.", rules: ["التزم بقوانين السيرفر.", "ابتعد عن السب والإزعاج والسبام.", "استخدم الرومات المتخصصة للمواضيع المناسبة."] },
      { name: "『الصور・📸』", type: "chat", title: "الصور واللقطات", description: "شارك صور ولقطات رحلاتك وتجاربك في PTFS.", rules: ["انشر محتوى مناسباً للسيرفر.", "لا تنشر صوراً خاصة بأشخاص دون إذنهم.", "ممنوع الإعلانات غير المصرح بها."] },
      { name: "『الاقتراحات・💡』", type: "chat", title: "اقتراحات الأعضاء", description: "شارك أفكارك لتطوير Karen Flight والسيرفر.", rules: ["اشرح اقتراحك باختصار ووضوح.", "تجنب تكرار الاقتراحات.", "الاقتراحات تُراجع ولا يعني ذلك اعتمادها تلقائياً."] },
      { name: "『الدعم・🎫』", type: "chat", title: "الدعم والمساعدة", description: "اكتب مشكلتك أو استفسارك هنا، ولا تشارك كلمات المرور أو رموز الدخول.", rules: ["اشرح المشكلة مع ذكر التفاصيل الضرورية فقط.", "لا ترسل معلومات تسجيل الدخول.", "لا تكرر طلب المساعدة بشكل مزعج."] }
    ]
  },
  {
    name: "『 الرحلات ・✈️』",
    access: "public",
    channels: [
      { name: "『جدول-الرحلات・📅』", type: "notice", title: "جدول الرحلات", description: "تُنشر هنا مواعيد الرحلات المجدولة وأوقاتها ونقاط التجمع.", rules: ["تأكد من التاريخ والتوقيت قبل التسجيل.", "قد تتغير المواعيد بإعلان رسمي.", "التزم بتعليمات المنظمين."] },
      { name: "『حجز-الرحلات・🎟️』", type: "chat", title: "حجز الرحلات", description: "استخدم هذا الروم للاستفسار عن الحجز أو التسجيل في الرحلات وفق تعليمات كل إعلان.", rules: ["اتبع نموذج الحجز الذي تنشره الإدارة.", "لا تحجز باسم شخص آخر دون إذنه.", "انتظر تأكيد الحجز من الموظف المختص."] },
      { name: "『معلومات-الرحلات・📋』", type: "notice", title: "معلومات الرحلات", description: "تفاصيل الرحلات، أرقامها، الوجهات، الطائرات المستخدمة، ومتطلبات المشاركة.", rules: ["اعتمد على آخر إعلان رسمي.", "اسأل في روم الأسئلة عند وجود استفسار."] },
      { name: "『رحلات-مباشرة・🛫』", type: "chat", title: "الرحلات المباشرة", description: "تنسيق الرحلات الجارية ومشاركة التحديثات المهمة أثناء الفعالية.", rules: ["اتبع توجيهات قائد الرحلة.", "لا ترسل رسائل خارج موضوع الرحلة أثناء التنسيق."] },
      { name: "『تقارير-الرحلات・📝』", type: "chat", title: "تقارير الرحلات", description: "إرسال تقارير ما بعد الرحلة والملاحظات التشغيلية.", rules: ["اكتب رقم الرحلة وتاريخها إن توفر.", "اذكر الملاحظات بوضوح واحترام.", "لا تنشر بيانات شخصية."] }
    ]
  },
  {
    name: "『 الطاقم ・👨‍✈️』",
    access: "crew",
    channels: [
      { name: "『الطيارين・🧑‍✈️』", type: "chat", title: "روم الطيارين", description: "تنسيق الطيارين ومناقشة الجداول والتدريبات والإجراءات الداخلية.", rules: ["للطاقم المخوّل فقط.", "التزم بتوجيهات الإدارة التشغيلية.", "لا تشارك معلومات دخول الحسابات."] },
      { name: "『مساعدي-الطيارين・🛩️』", type: "chat", title: "روم مساعدي الطيارين", description: "تنسيق مساعدي الطيارين والتدريب والتجهيز للرحلات.", rules: ["للمساعدين والرتب الإدارية.", "حافظ على تنظيم النقاش."] },
      { name: "『طاقم-الضيافة・🛎️』", type: "chat", title: "روم طاقم الضيافة", description: "تنسيق خدمات المسافرين وتجهيز المقصورة والتواصل بين أفراد الضيافة.", rules: ["لأعضاء طاقم الضيافة والإدارة.", "التزم بتعليمات قائد الطاقم."] },
      { name: "『الخدمات-الأرضية・🧳』", type: "chat", title: "روم الخدمات الأرضية", description: "تنسيق الاستقبال والتجهيزات الأرضية ومواعيد الحضور.", rules: ["للموظفين المخوّلين.", "اكتب التحديثات المهمة بوضوح."] },
      { name: "『اجتماعات-الطاقم・📢』", type: "notice", title: "اجتماعات الطاقم", description: "إعلانات الاجتماعات والتدريبات ومواعيد حضور الموظفين.", rules: ["تابع مواعيد الاجتماعات.", "إذا تعذّر حضورك، أبلغ الإدارة بالطريقة المعتمدة."] }
    ]
  }
];

function makeEmbed(channel) {
  const embed = new EmbedBuilder()
    .setColor(0xA3A785)
    .setTitle(channel.title)
    .setDescription(channel.description)
    .addFields({
      name: channel.type === "chat" ? "إرشادات الاستخدام" : "القوانين والتعليمات",
      value: channel.rules.map((rule, index) => `**${index + 1}.** ${rule}`).join("\n")
    })
    .setFooter({ text: "Karen Flight • PTFS Virtual Airline" })
    .setTimestamp();
  return embed;
}

async function ensureRole(guild, definition) {
  let role = guild.roles.cache.find((item) => item.name === definition.name);
  if (!role) {
    role = await guild.roles.create({
      name: definition.name,
      color: definition.color,
      permissions: definition.permissions,
      mentionable: false,
      reason: "Karen Flight server setup"
    });
  }
  return role;
}

function buildOverwrites(guild, roles, access, type) {
  const everyone = {
    id: guild.roles.everyone.id,
    allow: [PermissionFlagsBits.ViewChannel],
    deny: []
  };

  if (type === "notice") {
    everyone.deny.push(PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions);
  }

  const overwrites = [everyone];
  const allowedNames = access === "staff"
    ? STAFF_ROLES
    : access === "crew"
      ? CREW_ROLES
      : type === "notice"
        ? STAFF_ROLES
        : [];

  for (const name of allowedNames) {
    const role = roles.get(name);
    if (role) {
      overwrites.push({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles
        ]
      });
    }
  }

  if (access !== "public") {
    overwrites[0].deny.push(PermissionFlagsBits.ViewChannel);
  }

  return overwrites;
}

async function ensureCategory(guild, name, position) {
  let category = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  );
  if (!category) {
    category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      position,
      reason: "Karen Flight server setup"
    });
  }
  return category;
}

async function ensureTextChannel(guild, category, definition, access, roles) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText &&
      item.name === definition.name &&
      item.parentId === category.id
  );

  let created = false;
  if (!channel) {
    channel = await guild.channels.create({
      name: definition.name,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: definition.description.slice(0, 1024),
      permissionOverwrites: buildOverwrites(guild, roles, access, definition.type),
      reason: "Karen Flight server setup"
    });
    created = true;
  }

  if (created) {
    await channel.send({
      embeds: [makeEmbed(definition)],
      allowedMentions: { parse: [] }
    });
  }

  return { channel, created };
}

async function runSetup(guild) {
  await guild.channels.fetch();
  await guild.roles.fetch();

  const roles = new Map();
  for (const definition of ROLE_DEFINITIONS) {
    const role = await ensureRole(guild, definition);
    roles.set(definition.name, role);
  }

  let categoriesCreated = 0;
  let channelsCreated = 0;
  let channelsFound = 0;

  for (let index = 0; index < CHANNEL_GROUPS.length; index++) {
    const group = CHANNEL_GROUPS[index];
    const before = guild.channels.cache.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === group.name
    );
    const category = await ensureCategory(guild, group.name, index);
    if (!before) categoriesCreated++;

    for (const definition of group.channels) {
      const result = await ensureTextChannel(guild, category, definition, group.access, roles);
      if (result.created) channelsCreated++;
      else channelsFound++;
    }
  }

  return { categoriesCreated, channelsCreated, channelsFound, rolesCreated: roles.size };
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Karen Flight is online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "setup") return;

  if (!interaction.inGuild()) {
    return interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: "تحتاج صلاحية Manage Server لاستخدام هذا الأمر.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const result = await runSetup(interaction.guild);
    const embed = new EmbedBuilder()
      .setColor(0xA3A785)
      .setTitle("تم تجهيز Karen Flight")
      .setDescription("اكتمل إعداد الهيكل الأساسي للسيرفر. الرومات الموجودة مسبقاً لم يتم تكرارها.")
      .addFields(
        { name: "التصنيفات الجديدة", value: String(result.categoriesCreated), inline: true },
        { name: "الرومات الجديدة", value: String(result.channelsCreated), inline: true },
        { name: "رومات موجودة", value: String(result.channelsFound), inline: true },
        { name: "الرتب التي تم التأكد منها", value: String(result.rolesCreated), inline: true }
      )
      .setFooter({ text: "Karen Flight • Setup" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Setup error:", error);
    await interaction.editReply({
      content: "تعذر إكمال الإعداد. تأكد أن البوت يملك Manage Channels وManage Roles وView Channels وSend Messages، وأن رتبة البوت أعلى من الرتب التي ينشئها."
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
