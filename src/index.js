require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
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


const NOTIFICATION_ROLE_DEFINITIONS = [
  { name: "إشعارات الأخبار", color: 0xD6B56D, title: "الأخبار", description: "إعلانات وأخبار Karen Flight.", emoji: "📰" },
  { name: "إشعارات الرحلات", color: 0x3977C3, title: "الرحلات", description: "مواعيد الرحلات والحجوزات والإعلانات المتعلقة بها.", emoji: "✈️" },
  { name: "إشعارات التحديثات", color: 0x58A58C, title: "التحديثات", description: "تحديثات الشركة والسيرفر والخدمات.", emoji: "🔔" },
  { name: "إشعارات الفعاليات", color: 0xA58AC7, title: "الفعاليات", description: "الفعاليات والمسابقات والأنشطة.", emoji: "🎉" }
];

async function runAddNotificationRoles(guild) {
  await guild.roles.fetch();

  const results = [];
  for (const definition of NOTIFICATION_ROLE_DEFINITIONS) {
    let role = guild.roles.cache.find((item) => item.name === definition.name);
    let created = false;

    if (!role) {
      role = await guild.roles.create({
        name: definition.name,
        color: definition.color,
        permissions: [],
        mentionable: true,
        reason: "Karen Flight notification roles"
      });
      created = true;
    }

    results.push({ role, created });
  }

  return results;
}

async function runLockEveryoneChannelTools(guild) {
  await guild.channels.fetch();

  const everyone = guild.roles.everyone;
  const targets = guild.channels.cache.filter((channel) =>
    typeof channel.isThread === "function" ? !channel.isThread() : true
  );

  let updated = 0;
  let failed = 0;

  for (const channel of targets.values()) {
    try {
      await channel.permissionOverwrites.edit(everyone, {
        ManageChannels: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }, {
        reason: "Disable channel management and thread creation for @everyone"
      });
      updated++;
    } catch (error) {
      failed++;
      console.error(`Could not update channel ${channel.id} (${channel.name}):`, error);
    }
  }

  return { updated, failed, total: targets.size };
}

function isTicketChannel(channel) {
  return Boolean(channel && channel.type === ChannelType.GuildText && /ticketOwner=\d+/.test(channel.topic || ""));
}

function getTicketOwner(channel) {
  return channel?.topic?.match(/ticketOwner=(\d+)/)?.[1] || null;
}

function hasTicketStaff(member) {
  return Boolean(member?.roles?.cache?.some((role) => ["Administration", "Owner"].includes(role.name)));
}

async function openTicket(interaction) {
  if (!interaction.inGuild()) {
    return interaction.reply({ content: "فتح التكت متاح داخل السيرفر فقط.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = interaction.guild;
    const ownerId = interaction.user.id;
    await guild.channels.fetch();
    await guild.roles.fetch();

    const existing = guild.channels.cache.find((channel) =>
      channel.type === ChannelType.GuildText &&
      channel.topic?.includes(`ticketOwner=${ownerId}`) &&
      !channel.topic?.includes("ticketClosed=")
    );

    if (existing) {
      return interaction.editReply({ content: `عندك تكت مفتوح بالفعل: ${existing}` });
    }

    const staffRole = guild.roles.cache.find((role) => role.name === "Administration");
    if (!staffRole) {
      return interaction.editReply({ content: "ما لقيت رتبة Administration. شغّل أمر /setup أولاً." });
    }

    let category = guild.channels.cache.find((channel) =>
      channel.type === ChannelType.GuildCategory && channel.name === "『 التكتات ・🎫』"
    );

    if (!category) {
      category = await guild.channels.create({
        name: "『 التكتات ・🎫』",
        type: ChannelType.GuildCategory,
        reason: "Karen Flight ticket system"
      });
    }

    const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 18) || "member";
    const openedAt = Date.now();

    const ticket = await guild.channels.create({
      name: `ticket-${safeName}`.slice(0, 90),
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `ticketOwner=${ownerId};ticketOpened=${openedAt}`,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: ownerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
        { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages] }
      ],
      reason: `Support ticket opened by ${interaction.user.tag}`
    });

    const embed = new EmbedBuilder()
      .setColor(0xA3A785)
      .setTitle("تكت الدعم الفني")
      .setDescription(`أهلًا ${interaction.user}، اكتب تفاصيل طلبك هنا وبيساعدك فريق الإدارة.`)
      .addFields({ name: "الحالة", value: "بانتظار استلام الإدارة" })
      .setFooter({ text: "Karen Flight • Support" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kf-claim").setLabel("استلام التكت").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("kf-unclaim").setLabel("إلغاء الاستلام").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("kf-close").setLabel("إغلاق التكت").setStyle(ButtonStyle.Danger)
    );

    await ticket.send({ content: `<@&${staffRole.id}> • ${interaction.user}`, embeds: [embed], components: [row], allowedMentions: { users: [ownerId], roles: [staffRole.id] } });
    return interaction.editReply({ content: `تم فتح تكتك بنجاح: ${ticket}` });
  } catch (error) {
    console.error("Open ticket error:", error);
    return interaction.editReply({ content: "تعذر فتح التكت. تأكد أن البوت يملك Manage Channels وView Channels وSend Messages، وأن صلاحياته تسمح له بإنشاء رومات داخل تصنيف التكتات." }).catch(() => {});
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Karen Flight is online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;


  if (interaction.commandName === "ticket-panel") {
    if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "تحتاج صلاحية Manage Server.", ephemeral: true });
    }
    const embed = new EmbedBuilder().setColor(0xA3A785).setTitle("الدعم الفني • Karen Flight").setDescription("اضغط **فتح تكت** للتواصل مع الإدارة بشكل خاص.");
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("kf-open").setLabel("فتح تكت").setStyle(ButtonStyle.Primary).setEmoji("🎫"));
    await interaction.channel.send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: "تم إرسال لوحة التكتات في هذا الروم.", ephemeral: true });
  }

  if (interaction.commandName === "boarding-staff-info") {
    if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "تحتاج صلاحية Manage Server.", ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor(0xA3A785)
      .setTitle("دليل موظفي صعود الطائرة • Karen Flight")
      .setDescription("موظفو صعود الطائرة مسؤولون عن تنظيم مرحلة صعود المسافرين والتأكد من انتقالهم للطائرة بشكل مرتب.")
      .addFields(
        { name: "المهام الأساسية", value: [
          "• استقبال المسافرين وتوجيههم إلى بوابة الصعود.",
          "• إعلان بدء الصعود حسب تعليمات مسؤول الرحلة.",
          "• تنظيم دخول المسافرين للطائرة ومنع التزاحم.",
          "• متابعة قائمة المسافرين أو الحجوزات إذا كانت مستخدمة في الرحلة.",
          "• إبلاغ الإدارة أو قائد الرحلة عن أي مشكلة أو تأخير."
        ].join("\n") },
        { name: "أثناء الرحلة", value: "التزم بتعليمات قائد الرحلة، وابقَ متاحاً للتنسيق إلى أن ينتهي الصعود ويتم تسليم المهمة." },
        { name: "قواعد العمل", value: [
          "• تعامل مع المسافرين باحترام ووضوح.",
          "• لا تعلن بدء الصعود أو إغلاقه من نفسك؛ اتبع توقيت المسؤول.",
          "• لا تغيّر بيانات الحجز أو قائمة المسافرين دون إذن.",
          "• استخدم روم موظفي البوردنق للتنسيق وتحديث حالة الصعود."
        ].join("\n") }
      )
      .setFooter({ text: "Karen Flight • Boarding Staff" })
      .setTimestamp();
    await interaction.channel.send({ embeds: [embed] });
    return interaction.reply({ content: "تم إرسال شرح موظفي صعود الطائرة في هذا الروم.", ephemeral: true });
  }

  if (interaction.commandName === "application-panel") {
    if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "تحتاج صلاحية Manage Server.", ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor(0xA3A785)
      .setTitle("التقديمات • Karen Flight")
      .setDescription("إذا تبي تنضم إلى طاقم Karen Flight، اضغط الزر بالأسفل واختر القسم ثم عبّئ الاستمارة.");
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kf-apply-start").setLabel("بدء التقديم").setStyle(ButtonStyle.Success).setEmoji("📝")
    );
    await interaction.channel.send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: "تم إرسال لوحة التقديمات في هذا الروم.", ephemeral: true });
  }

  if (interaction.commandName === "lock-everyone-channel-tools") {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "تحتاج صلاحية Manage Server لاستخدام الأمر.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const result = await runLockEveryoneChannelTools(interaction.guild);
      const embed = new EmbedBuilder()
        .setColor(result.failed ? 0xD6B56D : 0xA3A785)
        .setTitle("تم تطبيق صلاحيات @everyone")
        .setDescription("تم منع @everyone من إدارة الرومات وإنشاء Public Threads وPrivate Threads.")
        .addFields(
          { name: "الرومات والتصنيفات المعدّلة", value: String(result.updated), inline: true },
          { name: "تعذّر تعديلها", value: String(result.failed), inline: true }
        )
        .setFooter({ text: "Karen Flight • Permissions" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Lock channel tools error:", error);
      await interaction.editReply({
        content: "تعذر تطبيق الصلاحيات. تأكد أن البوت يملك Manage Roles وManage Channels."
      });
    }
    return;
  }

  if (interaction.commandName === "add-notification-roles") {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: "هذا الأمر يعمل داخل السيرفر فقط.", ephemeral: true });
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: "تحتاج صلاحية Manage Server لاستخدام الأمر.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const results = await runAddNotificationRoles(interaction.guild);
      const created = results.filter((item) => item.created);
      const embed = new EmbedBuilder()
        .setColor(0xA3A785)
        .setTitle("تمت إضافة رولات الإشعار")
        .setDescription(results.map(({ role }) => `• ${role}`).join("\n"))
        .addFields(
          { name: "الرولات الجديدة", value: String(created.length), inline: true },
          { name: "إجمالي رولات الإشعار", value: String(results.length), inline: true }
        )
        .setFooter({ text: "Karen Flight • Notification Roles" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Notification roles error:", error);
      await interaction.editReply({
        content: "ما قدرت أضيف الرولات. تأكد أن البوت يملك Manage Roles وأن رتبته أعلى من الرولات الجديدة."
      });
    }
    return;
  }

  if (interaction.commandName !== "setup") return;

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

client.on(Events.InteractionCreate, async (interaction) => {
  function createApplicationModal(position, device) {
  const modal = new ModalBuilder()
    .setCustomId(`kf-apply-form:${encodeURIComponent(position)}:${device}`)
    .setTitle("استمارة التقديم");
  const name = new TextInputBuilder().setCustomId("app-name").setLabel("اسمك").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80);
  const age = new TextInputBuilder().setCustomId("app-age").setLabel("عمرك").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3);
  const why = new TextInputBuilder().setCustomId("app-why").setLabel("ليش تبي تقدم؟").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
  const activity = new TextInputBuilder().setCustomId("app-activity").setLabel("قد إيش تفاعلك؟").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
  const oath = new TextInputBuilder().setCustomId("app-oath").setLabel("القسم").setPlaceholder("والله ماغدر بالسيرفر").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(120);
  modal.addComponents(
    new ActionRowBuilder().addComponents(name),
    new ActionRowBuilder().addComponents(age),
    new ActionRowBuilder().addComponents(why),
    new ActionRowBuilder().addComponents(activity),
    new ActionRowBuilder().addComponents(oath)
  );
  return modal;
}

// Application flow: panel -> position -> device -> application modal.
  if (interaction.isButton() && interaction.customId === "kf-apply-start") {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("kf-apply-position")
      .setPlaceholder("اختر القسم اللي تبي تقدم عليه")
      .addOptions(
        { label: "Administration", value: "administration" },
        { label: "Pilot", value: "Pilot" },
        { label: "First Officer", value: "First Officer" },
        { label: "Cabin Crew", value: "Cabin Crew" },
        { label: "Ground Staff", value: "Ground Staff" },
        { label: "Boarding Staff", value: "Boarding Staff" }
      );
    return interaction.reply({
      content: "اختر نوع التقديم:",
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === "kf-apply-position") {
    const selectedPosition = interaction.values[0];
    const position = selectedPosition.toLowerCase() === "administration" ? "Administration" : selectedPosition;
    if (position === "Administration") {
      return interaction.showModal(createApplicationModal("Administration", "none"));
    }
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`kf-apply-device:${position}`)
      .setPlaceholder("اختر نوع جهازك")
      .addOptions(
        { label: "iPhone", value: "iphone" },
        { label: "Android", value: "android" },
        { label: "PlayStation", value: "playstation" },
        { label: "PC", value: "pc" }
      );
    return interaction.update({
      content: "اختر نوع جهازك لإكمال التقديم.",
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith("kf-apply-device:")) {
    const position = interaction.customId.slice("kf-apply-device:".length);
    const allowed = ["Pilot", "First Officer", "Cabin Crew", "Ground Staff", "Boarding Staff"];
    if (!allowed.includes(position)) {
      return interaction.update({ content: "اختيار القسم غير صالح. ابدأ التقديم من جديد.", components: [] });
    }
    return interaction.showModal(createApplicationModal(position, interaction.values[0]));
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("kf-apply-form:")) {
    const [, encodedPosition, device] = interaction.customId.split(":");
    const position = decodeURIComponent(encodedPosition || "");
    const validPositions = ["Administration", "Pilot", "First Officer", "Cabin Crew", "Ground Staff", "Boarding Staff"];
    const validDevices = ["iphone", "android", "playstation", "pc"];
    const validDevice = position === "Administration" ? device === "none" : validDevices.includes(device);
    if (!validPositions.includes(position) || !validDevice) {
      return interaction.reply({ content: "بيانات التقديم غير صالحة. حاول مرة ثانية من لوحة التقديم.", ephemeral: true });
    }

    await interaction.guild.channels.fetch();
    const channel = interaction.guild?.channels.cache.find((item) =>
      item.type === ChannelType.GuildText && item.name === "『التقديمات・🗒️』"
    );
    if (!channel) {
      return interaction.reply({ content: "ما لقيت روم 『التقديمات・🗒️』. تأكد من اسم الروم وصلاحية البوت.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isOwner = interaction.user.id === interaction.guild.ownerId ||
      member.roles.cache.some((role) => role.name.toLowerCase() === "owner");

    // Five-day cooldown, checked against application posts in the applications channel.
    if (!isOwner) {
      const cooldownMs = 5 * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - cooldownMs;
      let before;
      let recentApplication = null;
      while (true) {
        const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
        if (!batch.size) break;
        for (const message of batch.values()) {
          if (message.createdTimestamp < cutoff) continue;
          const embed = message.embeds[0];
          const footer = embed?.footer?.text || "";
          const description = embed?.description || "";
          if (footer.includes(`Applicant ID: ${interaction.user.id}`) ||
              description.includes(`<@${interaction.user.id}>`) ||
              description.includes(`<@!${interaction.user.id}>`)) {
            if (!recentApplication || message.createdTimestamp > recentApplication.createdTimestamp) {
              recentApplication = message;
            }
          }
        }
        const oldest = batch.last();
        if (!oldest || oldest.createdTimestamp < cutoff || batch.size < 100) break;
        before = oldest.id;
      }

      if (recentApplication) {
        const availableAt = Math.floor((recentApplication.createdTimestamp + cooldownMs) / 1000);
        return interaction.reply({
          content: `قدمت قبل أقل من 5 أيام. تقدر تقدم مرة ثانية <t:${availableAt}:R>.`,
          ephemeral: true
        });
      }
    }

    const oathAnswer = interaction.fields.getTextInputValue("app-oath").trim();

    const application = new EmbedBuilder()
      .setColor(0xA3A785)
      .setTitle("طلب تقديم جديد")
      .setDescription(`**المتقدم:** ${interaction.user}\n**القسم:** ${position}`)
      .addFields(
        { name: "الاسم", value: interaction.fields.getTextInputValue("app-name"), inline: true },
        { name: "العمر", value: interaction.fields.getTextInputValue("app-age"), inline: true },
        { name: "نوع الجهاز", value: position === "Administration" ? "غير مطلوب لهذا القسم" : ({ iphone: "iPhone", android: "Android", playstation: "PlayStation", pc: "PC" })[device], inline: true },
        { name: "ليش تبي تقدم؟", value: interaction.fields.getTextInputValue("app-why") },
        { name: "قد إيش تفاعلك؟", value: interaction.fields.getTextInputValue("app-activity") },
        { name: "الإقرار", value: oathAnswer }
      )
      .setFooter({ text: `Karen Flight • Applications • Applicant ID: ${interaction.user.id}` })
      .setTimestamp();

    try {
      await channel.send({ embeds: [application], allowedMentions: { users: [interaction.user.id] } });
      return interaction.reply({ content: "تم إرسال تقديمك بنجاح! تقدر تقدم مرة ثانية بعد 5 أيام.", ephemeral: true });
    } catch (error) {
      console.error("Application submission error:", error);
      return interaction.reply({ content: "ما قدرت أرسل التقديم. تأكد أن البوت يملك صلاحية View Channel وSend Messages وEmbed Links في روم التقديمات.", ephemeral: true });
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    try {
      // Application buttons are handled by the application interaction listener above.
      if (interaction.customId === "kf-apply-start") return;
      if (interaction.customId === "kf-open") return await openTicket(interaction);
      if (!isTicketChannel(interaction.channel)) return interaction.reply({ content: "هذا الزر ليس في تكت.", ephemeral: true });
      if (!hasTicketStaff(interaction.member)) return interaction.reply({ content: "هذا الإجراء للمشرفين برول Administration فقط.", ephemeral: true });

      if (interaction.customId === "kf-claim" || interaction.customId === "kf-unclaim") {
        const claimed = interaction.channel.topic?.match(/ticketClaimed=(\d+)/)?.[1];
        if (interaction.customId === "kf-claim") {
          if (claimed) return interaction.reply({ content: `التكت مستلم بالفعل من <@${claimed}>.`, ephemeral: true });
          await interaction.channel.setTopic(`${interaction.channel.topic};ticketClaimed=${interaction.user.id}`);
          return interaction.reply({ content: `تم استلام التكت بواسطة ${interaction.user}.` });
        }
        if (!claimed) return interaction.reply({ content: "التكت غير مستلم.", ephemeral: true });
        if (claimed !== interaction.user.id && !interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: "فقط المستلم أو الإدارة العليا يمكنها إلغاء الاستلام.", ephemeral: true });
        await interaction.channel.setTopic(interaction.channel.topic.replace(/;ticketClaimed=\d+/, ""));
        return interaction.reply({ content: "تم إلغاء استلام التكت." });
      }

      if (interaction.customId === "kf-close") {
        const modal = new ModalBuilder().setCustomId("kf-close-reason").setTitle("إغلاق التكت");
        const input = new TextInputBuilder().setCustomId("reason").setLabel("سبب إغلاق التكت").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }
    } catch (error) {
      console.error("Ticket button error:", error);
      if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: "صار خطأ أثناء تنفيذ العملية.", ephemeral: true }).catch(() => {});
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "kf-close-reason") {
    if (!isTicketChannel(interaction.channel) || !hasTicketStaff(interaction.member)) return interaction.reply({ content: "هذا الإجراء للمشرفين فقط.", ephemeral: true });
    const reason = interaction.fields.getTextInputValue("reason");
    const ownerId = getTicketOwner(interaction.channel);
    const openedAt = Number(interaction.channel.topic.match(/ticketOpened=(\d+)/)?.[1] || 0);
    const closedAt = Date.now();
    const summary = new EmbedBuilder().setColor(0xA3A785).setTitle("تم إغلاق التكت").addFields(
      { name: "صاحب التكت", value: ownerId ? `<@${ownerId}>` : "غير معروف", inline: true },
      { name: "من فتح التكت", value: ownerId ? `<@${ownerId}>` : "غير معروف", inline: true },
      { name: "من أغلق التكت", value: `${interaction.user}`, inline: true },
      { name: "وقت فتح التكت", value: openedAt ? `<t:${Math.floor(openedAt/1000)}:F>` : "غير معروف", inline: true },
      { name: "وقت الإغلاق", value: `<t:${Math.floor(closedAt/1000)}:F>`, inline: true },
      { name: "سبب الإغلاق", value: reason }
    ).setFooter({ text: "Karen Flight • Ticket Closure" });
    if (!ownerId) {
      return interaction.reply({ content: "ما قدرت أحدد صاحب التكت، لذلك ما حذفت الروم حفاظًا على بياناته.", ephemeral: true });
    }

    let dmSent = false;
    try {
      const user = await client.users.fetch(ownerId);
      await user.send({ embeds: [summary] });
      dmSent = true;
    } catch (error) {
      console.error("Ticket closure DM failed:", error);
    }

    await interaction.reply({
      content: dmSent
        ? "تم إرسال ملخص إغلاق التكت لصاحبه بالخاص. سيتم حذف روم التكت الآن."
        : "تعذر إرسال الملخص بالخاص (قد تكون الرسائل الخاصة مقفلة). سيتم حذف روم التكت الآن.",
      ephemeral: true
    });

    await interaction.channel.delete(`Ticket closed by ${interaction.user.tag}. Reason: ${reason}`);
  }
});
