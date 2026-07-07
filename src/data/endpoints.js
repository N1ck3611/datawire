// BreachHub API - All endpoints go through https://breachhub.org/api
export const BREACHHUB_ENDPOINTS = {
  // Snusbase
  snusbase: { name: 'snusbase', description: 'Snusbase search', path: '/snusbase', queryParam: 'query' },
  snusbase_combo_lookup: { name: 'snusbase-combo-lookup', description: 'Snusbase combo lookup', path: '/snusbase/combo-lookup', queryParam: 'query' },
  snusbase_hash_lookup: { name: 'snusbase-hash-lookup', description: 'Snusbase hash lookup', path: '/snusbase/hash-lookup', queryParam: 'hash' },
  snusbase_ip_whois: { name: 'snusbase-ip-whois', description: 'Snusbase IP WHOIS', path: '/snusbase/ip-whois', queryParam: 'ip' },
  
  // LeakOsint
  leakosint: { name: 'leakosint', description: 'LeakOSint search', path: '/leakosint', queryParam: 'query' },
  
  // LeakCheckV2
  leakcheck_v2: { name: 'leakcheck-v2', description: 'LeakCheck V2', path: '/leakcheck/v2', queryParam: 'query' },
  
  // Breachbase
  breachbase: { name: 'breachbase', description: 'BreachBase', path: '/breachbase', queryParam: 'query' },
  
  // IntelVault
  intelvault: { name: 'intelvault', description: 'IntelVault search', path: '/intelvault', queryParam: 'query' },
  intelvault_breaches: { name: 'intelvault-breaches', description: 'IntelVault breaches', path: '/intelvault/breaches', queryParam: 'query' },
  intelvault_stealer_logs: { name: 'intelvault-stealer-logs', description: 'IntelVault stealer logs', path: '/intelvault/stealer-logs', queryParam: 'query' },
  
  // BreachDirectory
  breachdirectory: { name: 'breachdirectory', description: 'BreachDirectory', path: '/breachdirectory', queryParam: 'query' },
  
  // HackCheck
  hackcheck: { name: 'hackcheck', description: 'HackCheck', path: '/hackcheck', queryParam: 'query' },
  
  // OsintKit
  osintkit: { name: 'osintkit', description: 'OsintKit', path: '/osintkit', queryParam: 'query' },
  
  // Breach.vip
  breachvip: { name: 'breachvip', description: 'BreachVIP', path: '/breachvip', queryParam: 'query' },
  
  // Cord.cat
  cordcat: { name: 'cordcat', description: 'Cord.cat lookup', path: '/cordcat', queryParam: 'query' },
  cordcat_user: { name: 'cordcat-user', description: 'Cord.cat user', path: '/cordcat/user', queryParam: 'id' },
  cordcat_invite: { name: 'cordcat-invite', description: 'Cord.cat invite', path: '/cordcat/invite', queryParam: 'code' },
  cordcat_guild_widget: { name: 'cordcat-guild-widget', description: 'Cord.cat guild widget', path: '/cordcat/guild-widget', queryParam: 'id' },
  cordcat_ip: { name: 'cordcat-ip', description: 'Cord.cat IP lookup', path: '/cordcat/ip', queryParam: 'ip' },
  
  // Intelx
  intelx: { name: 'intelx', description: 'IntelX search', path: '/intelx', queryParam: 'query' },
  
  // Osintcat
  osintcat_database: { name: 'osintcat-database', description: 'OSINTCat database search', path: '/osintcat/database-search', queryParam: 'query' },
  osintcat_ip: { name: 'osintcat-ip', description: 'OSINTCat IP lookup', path: '/osintcat/ip', queryParam: 'ip' },
  osintcat_twitter: { name: 'osintcat-twitter', description: 'OSINTCat Twitter OSINT', path: '/osintcat/twitter-osint', queryParam: 'username' },
  osintcat_machine_search: { name: 'osintcat-machine-search', description: 'OSINTCat machine search', path: '/osintcat/machine-viewer/search', queryParam: 'query' },
  osintcat_machine_info: { name: 'osintcat-machine-info', description: 'OSINTCat machine info', path: '/osintcat/machine-viewer/machines/{machine_id}/info', queryParam: 'machine_id', pathIncludesQuery: true },
  osintcat_machine_files: { name: 'osintcat-machine-files', description: 'OSINTCat machine files', path: '/osintcat/machine-viewer/machines/{machine_id}/files/treeview', queryParam: 'machine_id', pathIncludesQuery: true },
  osintcat_machine_download: { name: 'osintcat-machine-download', description: 'OSINTCat machine download', path: '/osintcat/machine-viewer/machines/{machine_id}/download', queryParam: 'machine_id', pathIncludesQuery: true, responseType: 'binary' },
  osintcat_file_info: { name: 'osintcat-file-info', description: 'OSINTCat file info', path: '/osintcat/machine-viewer/files/{file_id}/info', queryParam: 'file_id', pathIncludesQuery: true },
  osintcat_file_download: { name: 'osintcat-file-download', description: 'OSINTCat file download', path: '/osintcat/machine-viewer/files/{file_id}/download', queryParam: 'file_id', pathIncludesQuery: true, responseType: 'binary' },
  
  // xOsint
  xosint: { name: 'xosint', description: 'xOsint search', path: '/xosint/search', queryParam: 'query' },
  
  // See-know
  seeknow_search: { name: 'seeknow-search', description: 'See-Know search', path: '/seeknow/search', queryParam: 'query', method: 'POST' },
  seeknow_stealer: { name: 'seeknow-stealer', description: 'See-Know stealer', path: '/seeknow/stealer', queryParam: 'query', method: 'POST' },
  seeknow_discord_user: { name: 'seeknow-discord-user', description: 'See-Know Discord user', path: '/seeknow/discord/user', queryParam: 'id' },
  seeknow_discord_roblox: { name: 'seeknow-discord-roblox', description: 'See-Know Discord to Roblox', path: '/seeknow/discord/to-roblox', queryParam: 'id' },
  seeknow_github: { name: 'seeknow-github', description: 'See-Know GitHub username', path: '/seeknow/username/github', queryParam: 'username' },
  seeknow_twitter: { name: 'seeknow-twitter', description: 'See-Know Twitter username', path: '/seeknow/username/twitter', queryParam: 'username' },
  seeknow_tiktok: { name: 'seeknow-tiktok', description: 'See-Know TikTok username', path: '/seeknow/username/tiktok', queryParam: 'username' },
  seeknow_reddit: { name: 'seeknow-reddit', description: 'See-Know Reddit username', path: '/seeknow/username/reddit', queryParam: 'username' },
  seeknow_social: { name: 'seeknow-social', description: 'See-Know social username', path: '/seeknow/username/social', queryParam: 'username' },
  seeknow_history: { name: 'seeknow-history', description: 'See-Know username history', path: '/seeknow/username/history', queryParam: 'username' },
  seeknow_network_ip: { name: 'seeknow-network-ip', description: 'See-Know network IP', path: '/seeknow/network/ip', queryParam: 'ip' },
  seeknow_network_email: { name: 'seeknow-network-email', description: 'See-Know network email', path: '/seeknow/network/email-check', queryParam: 'email' },
  seeknow_network_phone: { name: 'seeknow-network-phone', description: 'See-Know network phone', path: '/seeknow/network/phone', queryParam: 'phone' },
  seeknow_domain_intel: { name: 'seeknow-domain-intel', description: 'See-Know domain intel', path: '/seeknow/domain/intel', queryParam: 'domain' },
  seeknow_domain_whois: { name: 'seeknow-domain-whois', description: 'See-Know domain WHOIS', path: '/seeknow/domain/whois', queryParam: 'domain' },
  seeknow_xbox: { name: 'seeknow-xbox', description: 'See-Know Xbox', path: '/seeknow/gaming/xbox', queryParam: 'gamertag' },
  seeknow_roblox: { name: 'seeknow-roblox', description: 'See-Know Roblox', path: '/seeknow/gaming/roblox', queryParam: 'username' },
  seeknow_minecraft: { name: 'seeknow-minecraft', description: 'See-Know Minecraft', path: '/seeknow/gaming/minecraft', queryParam: 'username' },
  
  // Seekria
  seekria_footprint: { name: 'seekria-footprint', description: 'Seekria user footprint', path: '/seekria/user-footprint', queryParam: 'query' },
  seekria_email_osint: { name: 'seekria-email-osint', description: 'Seekria email OSINT', path: '/seekria/email-osint', queryParam: 'email' },
  seekria_domain: { name: 'seekria-domain', description: 'Seekria domain lookup', path: '/seekria/domain-lookup', queryParam: 'domain' },
  seekria_discord: { name: 'seekria-discord', description: 'Seekria Discord', path: '/seekria/discord', queryParam: 'id' },
  seekria_roblox: { name: 'seekria-roblox', description: 'Seekria Roblox', path: '/seekria/roblox', queryParam: 'username' },
  seekria_minecraft: { name: 'seekria-minecraft', description: 'Seekria Minecraft', path: '/seekria/minecraft', queryParam: 'username' },
  seekria_ip: { name: 'seekria-ip', description: 'Seekria IP', path: '/seekria/ip', queryParam: 'ip' },
  seekria_dns: { name: 'seekria-dns', description: 'Seekria DNS resolver', path: '/seekria/dns-resolver', queryParam: 'domain' },
  seekria_email_breach: { name: 'seekria-email-breach', description: 'Seekria email breach', path: '/seekria/email-breach', queryParam: 'email' },
  seekria_username_breach: { name: 'seekria-username-breach', description: 'Seekria username breach', path: '/seekria/username-breach', queryParam: 'username' },
  seekria_phone_breach: { name: 'seekria-phone-breach', description: 'Seekria phone breach', path: '/seekria/phone-breach', queryParam: 'phone' },
  seekria_discord_profile: { name: 'seekria-discord-profile', description: 'Seekria Discord profile', path: '/seekria/discord-profile', queryParam: 'id' },
  seekria_discord_rat: { name: 'seekria-discord-rat', description: 'Seekria Discord to RAT', path: '/seekria/discord-to-rat', queryParam: 'id' },
  seekria_fivem: { name: 'seekria-fivem', description: 'Seekria FiveM', path: '/seekria/fivem', queryParam: 'identifier' },
  seekria_minecraft_osint: { name: 'seekria-minecraft-osint', description: 'Seekria Minecraft OSINT', path: '/seekria/minecraft-osint', queryParam: 'username' },
  seekria_name_history: { name: 'seekria-name-history', description: 'Seekria name history', path: '/seekria/name-history', queryParam: 'uuid' },
  seekria_laby: { name: 'seekria-laby', description: 'Seekria Laby stats', path: '/seekria/laby-stats', queryParam: 'username' },
  seekria_minecraft_texture: { name: 'seekria-minecraft-texture', description: 'Seekria Minecraft texture', path: '/seekria/minecraft-texture', queryParam: 'uuid' },
  seekria_tiktok: { name: 'seekria-tiktok', description: 'Seekria TikTok lookup', path: '/seekria/tiktok-lookup', queryParam: 'username' },
  seekria_tiktok_breach: { name: 'seekria-tiktok-breach', description: 'Seekria TikTok breach', path: '/seekria/tiktok-breach', queryParam: 'username' },
  seekria_snusbase: { name: 'seekria-snusbase', description: 'Seekria Snusbase breach', path: '/seekria/snusbase-breach', queryParam: 'query' },
  seekria_leakcheck: { name: 'seekria-leakcheck', description: 'Seekria LeakCheck breach', path: '/seekria/leakcheck-breach', queryParam: 'query' },
  
  // Wentyn
  wentyn: { name: 'wentyn', description: 'Wentyn search', path: '/wentyn', queryParam: 'query' },
  
  // HudsonRock
  hudsonrock_domain: { name: 'hudsonrock-domain', description: 'HudsonRock domain search', path: '/hudsonrock/search-by-domain', queryParam: 'domain' },
  hudsonrock_domain_overview: { name: 'hudsonrock-domain-overview', description: 'HudsonRock domain overview', path: '/hudsonrock/search-by-domain/overview', queryParam: 'domain' },
  hudsonrock_domain_assessment: { name: 'hudsonrock-domain-assessment', description: 'HudsonRock domain assessment', path: '/hudsonrock/search-by-domain/assessment', queryParam: 'domain' },
  hudsonrock_domain_discovery: { name: 'hudsonrock-domain-discovery', description: 'HudsonRock domain discovery', path: '/hudsonrock/search-by-domain/discovery', queryParam: 'domain' },
  hudsonrock_login_emails: { name: 'hudsonrock-login-emails', description: 'HudsonRock login emails', path: '/hudsonrock/search-by-login/emails', queryParam: 'login' },
  hudsonrock_login_usernames: { name: 'hudsonrock-login-usernames', description: 'HudsonRock login usernames', path: '/hudsonrock/search-by-login/usernames', queryParam: 'login' },
  hudsonrock_ip: { name: 'hudsonrock-ip', description: 'HudsonRock IP search', path: '/hudsonrock/search-by-ip', queryParam: 'ip' },
  hudsonrock_keyword: { name: 'hudsonrock-keyword', description: 'HudsonRock keyword search', path: '/hudsonrock/search-by-keyword', queryParam: 'keyword' },
  hudsonrock_keyword_urls: { name: 'hudsonrock-keyword-urls', description: 'HudsonRock keyword URLs', path: '/hudsonrock/search-by-keyword/urls', queryParam: 'keyword' },
  hudsonrock_stealer: { name: 'hudsonrock-stealer', description: 'HudsonRock stealer infection', path: '/hudsonrock/search-by-stealer/infection-analysis', queryParam: 'query' },
  
  // Leaksight
  leaksight: { name: 'leaksight', description: 'Leaksight', path: '/leaksight', queryParam: 'query' },
  
  // NBRS
  nbrs_roblox: { name: 'nbrs-roblox', description: 'NBRS Roblox', path: '/nbrs/roblox', queryParam: 'id' },
  
  // Room101
  room101_analyze: { name: 'room101-analyze', description: 'Room 101 analyze', path: '/room101/analyze', queryParam: 'username' },
  room101_search: { name: 'room101-search', description: 'Room 101 search', path: '/room101/search', queryParam: 'query' },
  room101_v2_search: { name: 'room101-v2-search', description: 'Room 101 v2 search', path: '/room101/v2/search', queryParam: 'query' },
  room101_user: { name: 'room101-user', description: 'Room 101 user', path: '/room101/user', queryParam: 'username' },
  room101_subreddit: { name: 'room101-subreddit', description: 'Room 101 subreddit', path: '/room101/subreddit', queryParam: 'name' },
  
  // SEON
  seon_phone: { name: 'seon-phone', description: 'SEON phone', path: '/seon/phone', queryParam: 'phone' },
  seon_email: { name: 'seon-email', description: 'SEON email', path: '/seon/email', queryParam: 'email' },
  seon_ip: { name: 'seon-ip', description: 'SEON IP', path: '/seon/ip', queryParam: 'ip' },
  seon_bin: { name: 'seon-bin', description: 'SEON BIN', path: '/seon/bin', queryParam: 'bin' },
  seon_verify: { name: 'seon-verify', description: 'SEON email verification', path: '/seon/email-verification', queryParam: 'email' },
  
  // Oathnet
  oathnet_breach: { name: 'oathnet-breach', description: 'Oathnet breach', path: '/oathnet/breach', queryParam: 'query' },
  oathnet_stealer: { name: 'oathnet-stealer', description: 'Oathnet stealer', path: '/oathnet/stealer', queryParam: 'query' },
  oathnet_stealer_subdomain: { name: 'oathnet-stealer-subdomain', description: 'Oathnet stealer subdomain', path: '/oathnet/stealer-subdomain', queryParam: 'domain' },
  oathnet_victims: { name: 'oathnet-victims', description: 'Oathnet victims list', path: '/oathnet/victims', queryParam: '' },
  oathnet_victim_log: { name: 'oathnet-victim-log', description: 'Oathnet victim info', path: '/oathnet/victims/{log_id}', queryParam: '', pathIncludesQuery: true },
  oathnet_victim_file: { name: 'oathnet-victim-file', description: 'Oathnet victim file', path: '/oathnet/victims/{log_id}/files/{file_id}', queryParam: '', pathIncludesQuery: true },
  oathnet_victim_archive: { name: 'oathnet-victim-archive', description: 'Oathnet victim archive', path: '/oathnet/victims/{log_id}/archive', queryParam: '', pathIncludesQuery: true },
  oathnet_discord_roblox: { name: 'oathnet-discord-roblox', description: 'Oathnet Discord to Roblox', path: '/oathnet/discord-to-roblox', queryParam: 'id' },
  oathnet_discord_userinfo: { name: 'oathnet-discord-userinfo', description: 'Oathnet Discord userinfo', path: '/oathnet/discord-userinfo', queryParam: 'id' },
  oathnet_discord_history: { name: 'oathnet-discord-history', description: 'Oathnet Discord username history', path: '/oathnet/discord-username-history', queryParam: 'id' },
  oathnet_steam: { name: 'oathnet-steam', description: 'Oathnet Steam', path: '/oathnet/steam', queryParam: 'id' },
  oathnet_xbox: { name: 'oathnet-xbox', description: 'Oathnet Xbox', path: '/oathnet/xbox', queryParam: 'gamertag' },
  oathnet_roblox_userinfo: { name: 'oathnet-roblox-userinfo', description: 'Oathnet Roblox userinfo', path: '/oathnet/roblox-userinfo', queryParam: 'id' },
  oathnet_mc_history: { name: 'oathnet-mc-history', description: 'Oathnet Minecraft history', path: '/oathnet/mc-history', queryParam: 'username' },
  oathnet_ip_info: { name: 'oathnet-ip-info', description: 'Oathnet IP info', path: '/oathnet/ip-info', queryParam: 'ip' },
  oathnet_holehe: { name: 'oathnet-holehe', description: 'Oathnet Holehe', path: '/oathnet/holehe', queryParam: 'email' },
  oathnet_ghunt: { name: 'oathnet-ghunt', description: 'Oathnet GHunt', path: '/oathnet/ghunt', queryParam: 'email' },
  oathnet_subdomain: { name: 'oathnet-subdomain', description: 'Oathnet extract subdomain', path: '/oathnet/extract-subdomain', queryParam: 'domain' },
  
  // Memory.lol
  memory: { name: 'memory', description: 'Memory.lol', path: '/memory', queryParam: 'username' },
  
  // NoSINT
  nosint_search: { name: 'nosint-search', description: 'NoSINT search', path: '/nosint/search', queryParam: 'query' },
  nosint_ip: { name: 'nosint-ip', description: 'NoSINT IP', path: '/nosint/ip', queryParam: 'ip' },
  
  // Reconly
  reconly: { name: 'reconly', description: 'Reconly', path: '/reconly', queryParam: 'query' },
  
  // Tiktok OSINT
  tiktok: { name: 'tiktok', description: 'TikTok OSINT', path: '/tiktok', queryParam: 'username' },
  
  // Binlist
  binlist: { name: 'binlist', description: 'Binlist', path: '/binlist', queryParam: 'bin' },
  
  // Inf0sec
  inf0sec: { name: 'inf0sec', description: 'Inf0sec', path: '/inf0sec', queryParam: 'query' },
  
  // VIN Recorder
  vin: { name: 'vin', description: 'VIN lookup', path: '/vin', queryParam: 'vin' },
  
  // PropertyRadar
  propertyradar_search: { name: 'propertyradar-search', description: 'PropertyRadar search', path: '/propertyradar/search', queryParam: 'query' },
  propertyradar_persons: { name: 'propertyradar-persons', description: 'PropertyRadar persons', path: '/propertyradar/persons', queryParam: 'query' },
  propertyradar_phone: { name: 'propertyradar-phone', description: 'PropertyRadar phone', path: '/propertyradar/phone', queryParam: 'phone' },
  propertyradar_email: { name: 'propertyradar-email', description: 'PropertyRadar email', path: '/propertyradar/email', queryParam: 'email' },
  propertyradar_skiptrace: { name: 'propertyradar-skiptrace', description: 'PropertyRadar skiptrace', path: '/propertyradar/skiptrace', queryParam: 'query' },
  
  // Datavoid
  datavoid_recovery: { name: 'datavoid-recovery', description: 'Datavoid recovery', path: '/datavoid/recovery', queryParam: 'query' },
  datavoid_us: { name: 'datavoid-us', description: 'Datavoid US', path: '/datavoid/us', queryParam: 'query' },
  datavoid_ca: { name: 'datavoid-ca', description: 'Datavoid CA', path: '/datavoid/ca', queryParam: 'query' },
  datavoid_il: { name: 'datavoid-il', description: 'Datavoid IL', path: '/datavoid/il', queryParam: 'query' },
  datavoid_stealer: { name: 'datavoid-stealer', description: 'Datavoid stealer', path: '/datavoid/stealer', queryParam: 'query' },
  datavoid_geocode: { name: 'datavoid-geocode', description: 'Datavoid geocode', path: '/datavoid/geocode', queryParam: 'address', method: 'POST' },
  datavoid_reverse_geocode: { name: 'datavoid-reverse-geocode', description: 'Datavoid reverse geocode', path: '/datavoid/reverse-geocode', queryParam: '', method: 'POST' },
  datavoid_automotive: { name: 'datavoid-automotive', description: 'Datavoid automotive', path: '/datavoid/automotive', queryParam: 'query' },
  datavoid_automotive_check: { name: 'datavoid-automotive-check', description: 'Datavoid automotive check', path: '/datavoid/automotive/check', queryParam: 'vin' },
  datavoid_company: { name: 'datavoid-company', description: 'Datavoid company', path: '/datavoid/company', queryParam: 'query' },
  datavoid_discord: { name: 'datavoid-discord', description: 'Datavoid Discord', path: '/datavoid/discord', queryParam: 'id' },
  datavoid_instagram: { name: 'datavoid-instagram', description: 'Datavoid Instagram', path: '/datavoid/instagram', queryParam: 'query', method: 'POST' },
  datavoid_twitter: { name: 'datavoid-twitter', description: 'Datavoid Twitter', path: '/datavoid/twitter', queryParam: 'query' },
  datavoid_google_docs: { name: 'datavoid-google-docs', description: 'Datavoid Google Docs', path: '/datavoid/google-docs', queryParam: 'query', method: 'POST' },
  datavoid_fivem: { name: 'datavoid-fivem', description: 'Datavoid FiveM', path: '/datavoid/fivem', queryParam: 'identifier' },
  datavoid_roblox: { name: 'datavoid-roblox', description: 'Datavoid Roblox', path: '/datavoid/roblox', queryParam: 'username' },
  
  // Checko
  checko: { name: 'checko', description: 'Checko', path: '/checko', queryParam: 'query' },
  
  // GitHub Osint
  github: { name: 'github', description: 'GitHub OSINT', path: '/github', queryParam: 'query' },
  
  // Discord Osint
  discord_user: { name: 'discord-user', description: 'Discord user', path: '/discord/user', queryParam: 'id' },
  discord_history: { name: 'discord-history', description: 'Discord history', path: '/discord/history', queryParam: 'query' },
  discord_export: { name: 'discord-export', description: 'Discord export', path: '/discord/export', queryParam: 'query' },
  discord_snowflake: { name: 'discord-snowflake', description: 'Discord snowflake', path: '/discord/snowflake', queryParam: 'id' },
  
  // Telegram Osint
  telegram_username: { name: 'telegram-username', description: 'Telegram username', path: '/telegram/username', queryParam: 'username' },
  telegram_id: { name: 'telegram-id', description: 'Telegram ID', path: '/telegram/id', queryParam: 'id' },
  telegram_phone: { name: 'telegram-phone', description: 'Telegram phone', path: '/telegram/phone', queryParam: 'phone' },
  
  // Snapchat Osint
  snapchat: { name: 'snapchat', description: 'Snapchat OSINT', path: '/snapchat', queryParam: 'username' },
  
  // Instagram Osint
  instagram: { name: 'instagram', description: 'Instagram OSINT', path: '/instagram', queryParam: 'query' },
  instagram_id: { name: 'instagram-id', description: 'Instagram ID', path: '/instagram/id', queryParam: 'id' },
  
  // Medal.tv Osint
  medal: { name: 'medal', description: 'Medal.tv OSINT', path: '/medal', queryParam: 'username' }
};
