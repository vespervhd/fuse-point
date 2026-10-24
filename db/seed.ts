// Seed نرم‌استور با داده‌ی واقعی از ایندکس عمومی F-Droid
// اجرا: npx tsx db/seed.ts   (نیازمند data/index-v2.json)
import { readFileSync, existsSync } from "node:fs";
import { scryptSync, randomBytes } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as s from "./schema";

const FDROID = "https://f-droid.org/repo";
const INDEX_PATH = new URL("../data/index-v2.json", import.meta.url).pathname;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
if (!existsSync(INDEX_PATH)) throw new Error("data/index-v2.json not found — download it first");

const _dbUrl = process.env.DATABASE_URL!;
let _ssl: false | "require" | object;
if (process.env.DB_SSL === "disable") _ssl = false;
else if (process.env.DB_SSL_SERVERNAME) {
  _ssl = { servername: process.env.DB_SSL_SERVERNAME, rejectUnauthorized: true };
} else if (process.env.DB_SSL === "require" || !/localhost|127\.0\.0\.1/.test(_dbUrl)) {
  _ssl = "require";
} else _ssl = false;
const client = postgres(_dbUrl, { ssl: _ssl });
const db = drizzle(client, { schema: s });

// ─── دسته‌بندی‌ها ────────────────────────────────────────────────
// نام انگلیسی هر دسته — بدون این، حالت EN به نام فارسی برمی‌گردد
const CATEGORY_NAME_EN: Record<string, string> = {
  "tools": "Utilities",
  "internet": "Internet & Network",
  "communication": "Communication",
  "multimedia": "Multimedia",
  "productivity": "Productivity & Education",
  "security": "Security & Privacy",
  "personalization": "Personalization",
  "system": "System & Advanced Tools",
  "maps": "Maps & Navigation",
  "file-manager": "File Management",
  "media-player": "Audio & Video Players",
  "notes": "Notes",
  "pdf": "PDF Tools",
  "transfer": "File Transfer",
  "recorder": "Voice Recorders",
  "browser": "Web Browsers",
  "vpn": "VPN & Proxy",
  "network": "Network Tools",
  "store": "App Stores",
  "messenger": "Messengers",
  "sms": "SMS",
  "email": "Email",
  "podcast": "Podcasts",
  "gallery": "Gallery & Camera",
  "online-media": "Online Streaming",
  "tasks": "Task Management",
  "ebook": "E-book Readers",
  "habit": "Habit Trackers",
  "flashcard": "Flashcards",
  "radio": "Radio",
  "2fa": "Two-Factor Authentication",
  "encryption": "Encryption",
  "firewall": "Firewalls & Privacy",
  "adblock": "Ad Blockers",
  "password": "Password Managers",
  "launcher": "Launchers",
  "keyboard": "Keyboards",
  "terminal": "Terminals",
  "sync": "Sync & Backup",
};

// [slug, nameFa, icon, parentSlug]
const CATEGORIES: [string, string, string, string | null][] = [
  ["tools", "ابزارهای کاربردی", "🛠️", null],
  ["internet", "اینترنت و شبکه", "🌐", null],
  ["communication", "ارتباطات", "💬", null],
  ["multimedia", "چندرسانه‌ای", "🎬", null],
  ["productivity", "بهره‌وری و آموزش", "📚", null],
  ["security", "امنیت و حریم خصوصی", "🔒", null],
  ["personalization", "شخصی‌سازی", "🎨", null],
  ["system", "سیستم و ابزارهای پیشرفته", "⚙️", null],
  ["maps", "نقشه و مسیریابی", "🗺️", null],
  ["file-manager", "مدیریت فایل", "📁", "tools"],
  ["media-player", "پخش‌کننده صوت و ویدیو", "▶️", "tools"],
  ["notes", "یادداشت‌برداری", "📝", "tools"],
  ["pdf", "ابزارهای PDF", "📄", "tools"],
  ["transfer", "انتقال فایل", "📤", "tools"],
  ["recorder", "ضبط صدا", "🎙️", "tools"],
  ["browser", "مرورگر وب", "🧭", "internet"],
  ["vpn", "VPN و پروکسی", "🛡️", "internet"],
  ["network", "ابزارهای شبکه", "📡", "internet"],
  ["store", "فروشگاه نرم‌افزار", "🏪", "internet"],
  ["messenger", "پیام‌رسان‌ها", "✉️", "communication"],
  ["sms", "پیامک", "💭", "communication"],
  ["email", "ایمیل", "📧", "communication"],
  ["podcast", "پادکست", "🎧", "multimedia"],
  ["gallery", "گالری و دوربین", "📷", "multimedia"],
  ["online-media", "پخش آنلاین", "📺", "multimedia"],
  ["tasks", "مدیریت وظایف", "✅", "productivity"],
  ["ebook", "کتاب‌خوان", "📖", "productivity"],
  ["habit", "ردیاب عادت", "🔁", "productivity"],
  ["flashcard", "فلش‌کارت آموزشی", "🗂️", "productivity"],
  ["radio", "رادیو", "📻", "productivity"],
  ["2fa", "احراز هویت دوعاملی", "🔑", "security"],
  ["encryption", "رمزنگاری", "🔐", "security"],
  ["firewall", "فایروال و حریم خصوصی", "🧱", "security"],
  ["adblock", "مسدودکننده تبلیغات", "🚫", "security"],
  ["password", "مدیریت رمز عبور", "🗝️", "security"],
  ["launcher", "لانچر", "🚀", "personalization"],
  ["keyboard", "صفحه‌کلید", "⌨️", "personalization"],
  ["terminal", "ترمینال", "💻", "system"],
  ["sync", "همگام‌سازی و پشتیبان‌گیری", "🔄", "system"],
];

// ─── اپ‌های منتخب: [packageName, nameFa, categories[], featured?, editorChoice?] ──
const APPS: [string, string, string[], boolean?, boolean?][] = [
  ["org.videolan.vlc", "وی‌ال‌سی", ["media-player"], true, true],
  ["org.fdroid.fdroid", "اف‌دروید", ["store"], true, false],
  ["com.termux", "ترموکس", ["terminal"], true, true],
  ["org.schabi.newpipe", "نیوپایپ", ["online-media"], true, true],
  ["org.mozilla.fennec_fdroid", "فنک", ["browser"], true, false],
  ["net.osmand.plus", "ازماند", ["maps"], true, false],
  ["de.danoeh.antennapod", "آنتناپاد", ["podcast"], true, true],
  ["com.beemdevelopment.aegis", "ایجس", ["2fa"], true, false],
  ["org.torproject.torbrowser", "مرورگر تور", ["browser", "firewall"], false, false],
  ["com.aurora.store", "آرورا استور", ["store"], false, false],
  ["com.github.catfriend1.syncthingandroid", "سینک‌تینگ", ["sync", "transfer"], false, true],
  ["org.adaway", "اداوِی", ["adblock"], false, false],
  ["eu.faircode.netguard", "نت‌گارد", ["firewall"], false, false],
  ["org.isoron.uhabits", "لوپ", ["habit"], false, false],
  ["org.wikipedia", "ویکی‌پدیا", ["productivity"], false, false],
  ["org.k9mail", "تاندربرد", ["email"], false, false],
  ["im.vector.app", "المنت", ["messenger"], false, false],
  ["org.primftpd", "پرمیتیو FTPd", ["network", "transfer"], false, false],
  ["net.sourceforge.opencamera", "اوپن کمرا", ["gallery"], false, false],
  ["org.dslul.openboard", "اوپن‌بورد", ["keyboard"], false, false],
  ["org.sufficientlysecure.keychain", "اوپن‌کی‌چین", ["encryption"], false, false],
  ["com.github.androidpasswordstore.androidpasswordstore", "پس‌ورد استور", ["password"], false, false],
  ["org.shadowice.flocke.andotp", "andOTP", ["2fa"], false, false],
  ["net.gsantner.markor", "مارکور", ["notes"], false, true],
  ["org.tasks", "تسکس", ["tasks"], false, false],
  ["org.billthefarmer.diary", "دایری", ["notes"], false, false],
  ["com.ichi2.anki", "انکی‌دروید", ["flashcard"], false, false],
  ["com.artifex.mupdf.viewer.app", "MuPDF", ["pdf", "ebook"], false, false],
  ["com.nextcloud.client", "نکست‌کلاد", ["sync"], false, false],
  ["org.kde.kdeconnect_tp", "کی‌دی‌ای کانکت", ["transfer"], false, false],
  ["fr.neamar.kiss", "کیس لانچر", ["launcher"], false, false],
  ["com.sduduzog.slimlauncher", "اسلیم لانچر", ["launcher"], false, false],
  ["org.fossify.gallery", "گالری فاسیفای", ["gallery"], false, false],
  ["org.fossify.filemanager", "فایل‌منیجر فاسیفای", ["file-manager"], false, false],
  ["com.amaze.filemanager", "امیز", ["file-manager"], false, false],
  ["me.zhanghai.android.files", "متریال فایلز", ["file-manager"], false, false],
  ["org.torproject.android", "اربوت", ["vpn", "firewall"], false, false],
  ["com.b44t.messenger", "دلتا چت", ["messenger"], false, false],
  ["eu.siacs.conversations", "کانورسیشنز", ["messenger"], false, false],
  ["org.y20k.transistor", "ترانزیستور", ["radio"], false, false],
  ["org.gateshipone.odyssey", "اودیسه", ["media-player"], false, false],
  ["de.k3b.android.androFotoFinder", "ای‌فوتوفایندر", ["gallery"], false, false],
  ["com.github.axet.audiorecorder", "ضبط صوت", ["recorder"], false, false],
  ["org.koitharu.kotatsu", "کوتاتسو", ["ebook"], false, false],
  // ─── موج دوم: گسترش کاتالوگ (۱۴۰۵/۰۷/۲۴) ───
  ["acr.browser.lightning", "لایتنینگ", ["browser"]],
  ["com.duckduckgo.mobile.android", "داک‌داک‌گو", ["browser"]],
  ["com.stoutner.privacybrowser.standard", "پرایوسی بروزر", ["browser"]],
  ["org.jitsi.meet", "جیتسی میت", ["messenger"]],
  ["org.linphone", "لین‌فون", ["messenger"]],
  ["org.briarproject.briar.android", "برایار", ["messenger"], true, false],
  ["com.keylesspalace.tusky", "تاسکی", ["messenger"]],
  ["com.cheogram.android", "چئوگرام", ["messenger"]],
  ["eu.faircode.email", "فیر ایمیل", ["email"], true, false],
  ["de.tutao.tutanota", "توتا", ["email"]],
  ["org.fossify.messages", "پیام‌ها فاسیفای", ["sms"]],
  ["com.github.tmo1.sms_ie", "بکاپ پیامک", ["sms"]],
  ["com.github.yeriomin.smsscheduler", "زمان‌بند پیامک", ["sms"]],
  ["is.xyz.mpv", "ام‌پی‌وی", ["media-player"]],
  ["org.oxycblt.auxio", "آکسیو", ["media-player"]],
  ["org.fossify.musicplayer", "موزیک فاسیفای", ["media-player"]],
  ["org.xbmc.kore", "کوری", ["media-player"]],
  ["code.name.monkey.retromusic", "رترو موزیک", ["media-player"]],
  ["com.hardcodecoder.pulsemusic", "پالس موزیک", ["media-player"]],
  ["com.atul.musicplayer", "موزیک‌پلیر", ["media-player"]],
  ["com.martinmimigames.littlemusicplayer", "لیتل موزیک", ["media-player"]],
  ["com.metromusic", "مترو موزیک", ["media-player"]],
  ["com.craftworks.music", "کرافت موزیک", ["media-player"]],
  ["com.aaronroberts.naturesmusic", "موزیک طبیعت", ["media-player"]],
  ["com.bobek.metronome", "مترونوم", ["media-player"]],
  ["org.billthefarmer.tuner", "تیونر", ["media-player"]],
  ["com.github.libretube", "لیبرتیوب", ["online-media"], true, false],
  ["free.rm.skytube.oss", "اسکای‌تیوب", ["online-media"]],
  ["com.zionhuang.music", "وی‌میوزیک", ["online-media"]],
  ["org.jellyfin.mobile", "جلی‌فین", ["online-media"]],
  ["org.moire.ultrasonic", "اولتراسونیک", ["online-media"]],
  ["github.daneren2005.dsub", "دی‌ساب", ["online-media"]],
  ["com.maxrave.simpmusic", "سیمپ‌میوزیک", ["online-media"]],
  ["com.armanmaurya.internetradio", "اینترنت رادیو", ["radio"]],
  ["de.radiozeit.freiesradio.fdroid", "فرایز رادیو", ["radio"]],
  ["app.podiumpodcasts.podium", "پودیوم", ["podcast"]],
  ["com.jarsilio.android.scrambledeggsif", "اسکرمبلد اگزیف", ["gallery"]],
  ["org.fossify.camera", "دوربین فاسیفای", ["gallery"]],
  ["com.iakmds.librecamera", "لیبرکمرا", ["gallery"]],
  ["com.darkrockstudios.app.securecamera", "دوربین امن", ["gallery"]],
  ["com.dozingcatsoftware.vectorcamera", "وکتور کمرا", ["gallery"]],
  ["com.bookstash.app", "بوک‌استش", ["ebook"]],
  ["com.luchowl.flybook", "فلای‌بوک", ["ebook"]],
  ["org.secuso.privacyfriendlynotes", "یادداشت امن", ["notes"]],
  ["org.fossify.notes", "یادداشت فاسیفای", ["notes"]],
  ["it.niedermann.owncloud.notes", "نوتس نکست‌کلاد", ["notes"]],
  ["de.tnmgl.ntodotxt", "ان‌تودو", ["tasks"]],
  ["io.github.friesi23.mhabit", "ام‌هبیت", ["habit"]],
  ["com.dessalines.habitmaker", "هبیت‌میکر", ["habit"]],
  ["com.willbsp.habits", "هبیتس", ["habit"]],
  ["ws.xsoh.etar", "اتار", ["productivity"]],
  ["org.fossify.calendar", "تقویم فاسیفای", ["productivity"]],
  ["proton.android.authenticator.fdroid", "پروتون اتنتیکیتور", ["2fa"]],
  ["com.kunzisoft.keepass.libre", "کی‌پس لیبر", ["password"]],
  ["org.sorz.lab.tinykeepass", "تاینی کی‌پس", ["password"]],
  ["com.celzero.bravedns", "ری‌تینک‌دی‌ان‌اس", ["firewall", "adblock"]],
  ["com.doubleangels.nextdnsmanagement", "نکست‌دی‌ان‌اس", ["adblock"]],
  ["de.srlabs.snoopsnitch", "اسنوپ‌اسنیچ", ["firewall"]],
  ["dev.ukanth.ufirewall", "ای‌اف‌وال", ["firewall"]],
  ["com.acutis.firewall", "فایروال", ["firewall"]],
  ["de.blinkt.openvpn", "اوپن‌وی‌پی‌ان", ["vpn"]],
  ["io.nekohasekai.sfa", "اس‌اف‌ای", ["vpn"], true, false],
  ["co.adityarajput.fileflow", "فایل‌فلو", ["file-manager"]],
  ["com.martinmimigames.simplefileexplorer", "فایل اکسپلورر ساده", ["file-manager"]],
  ["org.localsend.localsend_app", "لوکال‌سند", ["transfer"], true, false],
  ["at.bitfire.davdroid", "داویکس۵", ["sync"]],
  ["com.machiav3lli.backup", "نئو بکاپ", ["sync"]],
  ["org.connectbot", "کانکت‌بات", ["terminal"]],
  ["com.tortel.syslog", "سیس‌لاگ", ["system"]],
  ["app.olauncher", "او‌لانچر", ["launcher"], true, false],
  ["app.mlauncher", "ام‌لانچر", ["launcher"]],
  ["app.cclauncher", "سی‌سی لانچر", ["launcher"]],
  ["app.easy.launcher", "ایزی لانچر", ["launcher"]],
  ["ademar.textlauncher", "تکست لانچر", ["launcher"]],
  ["dev.patrickgold.florisboard", "فلوریس‌بورد", ["keyboard"], true, false],
  ["com.menny.android.anysoftkeyboard", "انی‌سافت‌کیبورد", ["keyboard"]],
  ["com.dessalines.thumbkey", "تامب‌کی", ["keyboard"]],
  ["org.fossify.keyboard", "کیبورد فاسیفای", ["keyboard"]],
  ["clavirom.keyboard", "کلاوی‌روم", ["keyboard"]],
  ["dev.imranr.obtainium.fdroid", "اوبتنیوم", ["store"], true, false],
  ["com.machiav3lli.fdroid", "نئو استور", ["store"]],
  ["de.grobox.liberario", "ترانسپورتر", ["maps"]],
  ["com.vrem.wifianalyzer", "وای‌فای آنالایزر", ["network"]],
  ["com.daemon.ssh", "اس‌اس‌اچ دیمون", ["network"]],
  ["org.breezyweather", "بریزی ودر", ["tools"], true, false],
  ["cz.martykan.forecastie", "فورکاستی", ["tools"]],
  ["org.fossify.clock", "ساعت فاسیفای", ["tools"]],
  ["com.best.deskclock", "ساعت رومیزی", ["tools"]],
  ["com.bnyro.translate", "ترنسلیت یو", ["tools"]],
  ["com.bobek.compass", "قطب‌نما", ["tools"]],
  ["com.ferrarid.converterpro", "مبدل واحد", ["tools"]],
  ["com.atharok.barcodescanner", "باینری آی", ["tools"]],
  ["com.secuso.privacyFriendlyCodeScanner", "اسکنر کد امن", ["tools"]],
  ["com.todobom.opennotescanner", "اسکنر نوت", ["tools"]],
  ["com.github.andremiras.qrscan", "کیوآر اسکن", ["tools"]],
  ["org.proninyaroslav.libretorrent", "لیبرتورنت", ["tools"]],
  ["com.ominous.quickweather", "کوییک ودر", ["tools"]],
  ["app.weatheroverview", "ودر اورویو", ["tools"]],
  ["org.woheller69.level", "تراز", ["tools"]],
  ["org.fossify.voicerecorder", "ضبط صوت فاسیفای", ["recorder"]],
  ["com.dimowner.audiorecorder", "آدیو رکوردر", ["recorder"], true, false],
  ["com.orpheusdroid.screenrecorder", "اسکرین‌رکوردر", ["recorder"]],
  ["com.openrecorder.app", "اوپن رکوردر", ["recorder"]],
  ["org.torproject.torservices", "تور سرویسز", ['security']],
  ["com.streetwriters.notesnook", "نوتس‌نوک", ['productivity']],
  ["com.deniscerri.ytdl", "وای‌تی‌دی‌ال‌نیس", ['tools']],
  ["io.element.android.x", "المنت ایکس", ['communication']],
  ["org.openobservatory.ooniprobe", "اونی پروب", ['internet']],
  ["com.brouken.player", "جاست پلیر", ['media']],
  ["org.documentfoundation.libreoffice", "لیبره‌آفیس ویوئر", ['productivity']],
  ["com.derdilla.bloodPressureApp", "فشار خون", ['tools']],
  ["de.monocles.chat", "مونوکلز چت", ['communication']],
  ["com.podverse.fdroid", "پادورس", ['media']],
  ["universe.constellation.orion.viewer", "اوریون ویوئر", ['productivity']],
  ["net.timelegend.chaka.viewer.app", "چاکا", ['productivity']],
  ["org.fcitx.fcitx5.android", "اف‌سیتکس۵", ['tools']],
  ["org.godotengine.editor.v3", "گودو", ['tools']],
  ["com.ammar.wallflow.plus", "وال‌فلو", ['personalization']],
  ["de.schliweb.makeacopy", "میک‌اکپی", ['tools']],
  ["org.gnu.emacs", "ایمکس", ['tools']],
  ["com.brahmadeo.supertonic.tts", "سوپرسونیک", ['tools']],
  ["de.circle_dev.flux_news", "فلاکس نیوز", ['internet']],
  ["io.olvid.messenger.nogoogle", "اولید", ['communication']],
  ["org.snikket.android", "اسنیکت", ['communication']],
  ["chat.schildi.android", "شیلدی‌چت", ['communication']],
  ["com.buzbuz.smartautoclicker", "کلیکر خودکار", ['tools']],
  ["org.app.geotagvideocamera", "دوربین ژئوتگ", ['media']],
  ["com.beatbridge", "بیت‌بریج", ['media']],
  ["com.dot.gallery", "رفرا", ['media']],
  ["io.github.divverent.aaaaxy", "آآآایکس‌وای", ['media']],
  ["dev.mateusznowak.demodulate", "دمادولیت", ['media']],
  ["com.hazel.android", "هیزل", ['tools']],
  ["com.fsck.k9", "کی۹ میل", ['communication']],
  ["org.billthefarmer.notes", "نوتس", ['productivity']],
  ["org.woheller69.omweather", "او‌ام ودر", ['tools']],
  ["com.nononsenseapps.feeder.play", "فیدر", ['internet']],
  ["io.github.muntashirakon.AppManager", "اپ منیجر", ['system']],
  ["org.fdroid.fdroid.privileged", "افزونه اف‌دروید", ['system']],
  ["com.secuso.privacyFriendlyCodeScanner", "اسکنر امن", ['tools']],
  ["io.github.mgdx.rouelibre", "رو لیبر", ['navigation']],
  ["net.megaproxy487", "مگاپروکسی", ['internet']],
  ["org.opendataensemble.formulus", "فرمولوس", ['internet']],
  ["com.myAllVideoBrowser", "سوپرایکس", ['tools']],
  ["com.moi.lumine", "لومین", ['internet']],
  ["im.narayana.another", "آنادر", ['communication']],
  ["xyz.jekyllex", "جکیل‌ایکس", ['productivity']],
  ["me.trion.whispertype", "ویسپر‌تایپ", ['tools']],
  ["io.bloco.snowflake", "اسنوفلیک", ['internet']],
  ["chat.delta.lite", "آرکین‌چت", ['communication']],
  ["dev.bikram.obtainx", "اوبتین‌ایکس", ['system']],
  ["com.leadaxe.lxbox", "ال‌باکس", ['internet']],
  ["com.elishaazaria.sayboard", "سی‌برد", ['tools']],
  ["com.github.dyhkwong.sagernet", "اکسکلیو", ['internet']],
  ["com.android.xrayfa", "ایکس‌ری", ['internet']],
  ["com.databag", "دیتابگ", ['communication']],
  ["com.cloudbasepredictor", "کلادبیس", ['tools']],
  ["app.prav.client", "پراو", ['communication']],
  ["de.spiritcroc.riotx", "شیلدی‌چت لگاسی", ['communication']],
  ["org.pixeldroid.app", "پیکسل‌دروید", ['internet']],
  ["org.mlm.mages", "میجز", ['communication']],
  ["io.ahxxm.ic", "کمپرسور عکس", ['tools']],
  ["com.xayah.databackup.foss", "دیتابکاپ", ['system']],
  ["com.jherkenhoff.qalculate", "کیوکالک", ['tools']],
  ["net.turtton.ytalarm", "وای‌تی‌الارم", ['tools']],
  ["eu.artectrex.bunny", "بانی", ['media']],
  ["dev.bg.jetbird", "جت‌برد", ['internet']],
  ["com.junkfood.seal", "سیل", ['tools']],
  ["app.fluffy", "فلافی", ['tools']],
  ["InfinityLoop1309.NewPipeEnhanced", "پایپ‌پایپ", ['media']],
  ["de.monocles.translator", "مترجم مونوکلز", ['tools']],
  ["com.gmail.blandilyte.silverdict", "سیلوردیکت", ['productivity']],
  ["com.co3", "سی‌او۳", ['productivity']],
  ["com.chiller3.rsaf", "آر‌اس‌ای‌اف", ['internet']],
  ["com.zaifears.locreminder", "لوک‌ریمایندر", ['tools']],
  ["com.chiller3.basicsync", "بیسیک‌سینک", ['internet']],
  ["com.gymmane.app", "جیم‌مین", ['tools']],
  ["com.streak.app", "استریک", ['productivity']],
  ["rs.in.dbase.downloader", "دی‌بیس دانلودر", ['tools']],
  ["it.belloworld.mercurygram", "مرکوری‌گرام", ['communication']],
  ["es.manifold.sidedeck", "سایددک", ['media']],
  ["dev.casraf.pantry", "پنتری", ['productivity']],
  ["app.nightdrop", "نایت‌دراپ", ['communication']],
  ["sushi.hardcore.droidfs", "دروید‌اف‌اس", ['security']],
  ["dev.digitalgrease.signet", "سیگنت", ['security']],
  ["com.filestech.notes_tech", "نوتس‌تک", ['productivity']],
  ["com.tu.expense.manager", "مدیریت هزینه", ['tools']],
  ["de.themorpheus.morphcook", "مورف‌کوک", ['tools']],
  ["com.mattermost.rnbeta", "مترموست", ['communication']],
  ["com.maelchiotti.localmaterialnotes", "متریال نوتس", ['productivity']],
  ["com.aw.huda", "هدی", ['productivity']],
  ["top.stevezmt.calsync", "کل‌سینک", ['productivity']],
  ["dev.henriquecouto.calsync", "کل‌سینک لوکال", ['productivity']],
  ["com.noxplay.noxplayer", "ای‌پی‌ام", ['media']],
  ["com.likhithpraveenk.storii", "استوری", ['media']],
  ["org.forthecommunity.torrentsdigger", "تورنتس‌دیگ", ['tools']],
  ["org.dianqk.ruslin", "روسلین", ['productivity']],
  ["net.drawpile", "دراوپایل", ['media']],
  ["dev.lojcs.tsacdop", "ساکداپ", ['media']],
  ["dev.khoj.pitaka.fdroid", "پیتاک", ['productivity']],
  ["com.stonegate.tsacdop", "ساکداپ کلاسیک", ['media']],
  ["com.nyxkn.meditation", "مدیتیشن", ['tools']],
  ["com.app.equran", "ای‌قرآن", ['productivity']],
  ["com.afkanerd.deku", "دکو", ['communication']],
  ["ai.privatebydesign.albi", "آلبی", ['tools']],
  ["org.lichess.mobileV2", "لای‌چس", ['media']],
  ["net.retiolus.natinfo", "نت‌اینفو", ['tools']],
  ["io.github.exclude0122.xivpn", "شی‌وی‌پی‌ان", ['internet']],
  ["de.quantumphysique.trale", "تراله", ['productivity']],
  ["com.quitter.app", "کوئیتر", ['productivity']],
  ["com.demizo.daily_you", "دیلی‌یو", ['productivity']],
  ["app.soundcenter.player", "ساند سنتر", ['media']],
  ["org.koreader.launcher.fdroid", "کی‌او‌ریدر", ['productivity']],
  ["org.electrum.electrum", "الکتروم", ['tools']],
  ["nl.bw20.last_launcher", "لست‌لانچر", ['personalization']],
  ["net.gmartin.paperlessngx_uploader", "پیپرلس آپلودر", ['productivity']],
  ["io.github.micw.openphotoframe", "قاب عکس", ['media']],
  ["io.github.anrinion.baseline", "بیس‌لاین", ['tools']],
  ["eu.heili.wormhole", "ورم‌هول", ['tools']],
  ["com.peer.topeer.global_send", "گلوبال‌سند", ['tools']],
  ["com.leastauthority.destiny", "دستینی", ['tools']],
  ["org.simlar", "سیملار", ['communication']],
  ["io.github.adithya_jayan.myrepertoirapp.fdroid", "رپرتوآر", ['media']],
  ["com.vicolo.chrono", "کرونو", ['tools']],
  ["com.sidhant.arrowescape", "ارو اسکیپ", ['media']],
  ["com.georgeyt9769.cardabase", "کاردابیس", ['tools']],
  ["com.enclavd.app", "انکلاود", ['internet']],
  ["org.mindshub.insigno", "اینسینیو", ['navigation']],
  ["com.wordpress.brunoloff.meditationtimer", "تایمر مدیتیشن", ['tools']],
  ["com.sidhant.watersort", "واتر سورت", ['media']],
  ["com.sidhant.learnmath", "یادگیری ریاضی", ['productivity']],
  ["com.presley.flexify", "فلکسیفای", ['tools']],
  ["com.poppingmoon.aria", "آریا", ['internet']],
  ["com.dreautall.waterflyiii", "واترفلای", ['tools']],
  ["com.carriez.flutter_hbb", "راست‌دسک", ['system']],
  ["com.adilhanney.no_more_background", "بدون پس‌زمینه", ['system']],
  ["tech.lolli.toolbox", "سرورباکس", ['system']],
  ["de.astubenbord.paperless_mobile", "پیپرلس موبایل", ['productivity']],
  ["com.sidhant.queens", "کوئینز", ['media']],
  ["com.likhithpraveenk.sudoku", "سودوکو", ['media']],
  ["com.game.asteroids_revenge", "انتقام سیارک", ['media']],
  ["com.flyboybyte.dragtree", "درگ‌تری", ['media']],
  ["com.codesail.market_monk", "مارکت‌مانک", ['tools']],
  ["org.proninyaroslav.libretrack", "لیبرترک", ['internet']],
  ["io.gitlab.libre_librivox_listener", "لیبری‌واکس", ['media']],
  ["deckers.thibault.aves.libre", "آوس", ['media']],
  ["com.k.todo", "تودو", ['productivity']],
  ["io.codeberg.allibragi.whatiwatch", "وات‌آی‌واچ", ['media']],
  ["dev.argus", "آرگوس", ['system']],
  ["de.nucleus.foss_warn", "فوس‌وارن", ['tools']],
  ["com.sidhant.jigsaw", "جیگ‌سا", ['media']],
  ["com.matelsky.coppelia", "کوپلیا", ['media']],
  ["com.github.xiaoshihou.jiyi", "جیی", ['tools']],
  ["com.github.emavgl.piggybankpro", "قلک", ['tools']],
  ["com.gdf.hema_timer", "تایمر هما", ['tools']],
  ["com.econverter.app", "مبدل ای‌بوک", ['productivity']],
  ["com.bluesound.bluesoundplayer", "بلوساند", ['media']],
  ["app.pomodorot", "پومودوروت", ['productivity']],
  ["org.fairscan.app", "فیراسکن", ['tools']],
  ["io.gitlab.the_phoenix_project0.whisper_noise", "نویز سفید", ['media']],
  ["info.zverev.ilya.every_door", "اوری‌دور", ['navigation']],
  ["com.sidhant.nonogram", "نونوگرام", ['media']],
  ["com.jiaqifeng.hacki", "هکی", ['internet']],
  ["com.flasskamp.energize", "انرجایز", ['tools']],
  ["paper.loop2", "پیپر لوپ", ['media']],
  ["org.codeberg.theoden8.webspace", "وب‌اسپیس", ['internet']],
  ["org.ca.squawker", "اسکواکر", ['internet']],
  ["io.github.mimoguz.tripeaksneue", "ترای‌پیکس", ['media']],
  ["io.github.bananguh.ErmChat", "ارم‌چت", ['communication']],
  ["com.sidhant.match3", "مچ‌تری", ['media']],
  ["com.resurrect.flac_r", "فلاک‌آر", ['media']],
  ["com.github.lamarios.clipious", "کلیپیوس", ['media']],
  ["rocks.mucke", "موکه", ['media']],
  ["com.technicjelle.simple_audio_converter", "مبدل صوتی", ['media']],
  ["com.sidhant.screwjam", "اسکرو جم", ['media']],
  ["com.sidhant.matrixpuzzle", "پازل ماتریکس", ['media']],
  ["com.sidhant.einsteinriddle", "معمای اینشتین", ['media']],
  ["com.sidhant.colorgram", "کالرگرام", ['media']],
  ["com.shatteredpixel.shatteredpixeldungeon", "سیاه‌چال", ['media']],
  ["com.resurrect.grove", "گروو", ['productivity']],
  ["com.presley.fit_book", "فیت‌بوک", ['tools']],
  ["com.game.plutonic", "پلوتونیک", ['media']],
  ["com.fpuellen.simplyscored", "سیمپلی‌اسکورد", ['tools']],
  ["com.chmouel.liseur", "لیزور", ['productivity']],
  ["com.blockdrop.game", "بلاک‌دراپ", ['media']],
  ["studio.okcode.open_alert_viewer", "نمایشگر هشدار", ['system']],
  ["ru.iska9der.flabr", "فلابر", ['internet']],
  ["org.eu.mumulhl.ciyue", "سی‌یو", ['productivity']],
  ["com.sidhant.tents", "تنتس", ['media']],
  ["com.sidhant.mahjong", "ماه‌جونگ", ['media']],
  ["com.sidhant.huesort", "هیو سورت", ['media']],
  ["com.resurrect.lrc_r", "ال‌آرسی", ['media']],
  ["com.guozhigq.pilipala", "پیلی‌پالا", ['media']],
  ["com.github.meypod.al_quran", "القرآن", ['productivity']],
  ["com.github.abakum.crocson", "کروکسون", ['tools']],
  ["co.prestosole.clima", "کلیما", ['tools']],
  ["pan.alexander.tordnscrypt.stable", "اینویزیبل", ['security']],
  ["org.mlm.renamite", "رنامایت", ['tools']],
  ["uk.org.retallack.onvifcamera", "دوربین آنویف", ['media']],
  ["org.forkgram.messenger", "فورک‌گرام", ['communication']],
  ["com.nfcarchiver.banana_split", "بانانا اسپلیت", ['security']],
  ["org.fedisuite.mobile", "فدی‌سوئیت", ['internet']],
  ["com.dn0ne.lotus", "لوتوس", ['media']],
  ["de.schildbach.wallet", "کیف بیت‌کوین", ['tools']],
  ["com.akslabs.circletosearch", "سرکل‌تو‌سرچ", ['tools']],
  ["io.github.benderblog.traintime_pda", "ایکس‌دی‌یو", ['productivity']],
  ["org.torproject.vpn", "تور VPN", ['internet']],
  ["ie.equalit.ceno", "سنو", ['internet']],
  ["de.marmaro.krt.ffupdater", "اف‌اف‌آپدیتر", ['system']],
  ["com.impostormx.org", "ایمپاستر", ['media']],
  ["com.reloado.auth", "ریلوادو", ['security']],
  ["com.marlinid.marlin", "مارلین", ['productivity']],
  ["de.killi199.timetracking", "تایم‌ترکینگ", ['productivity']],
  ["tribixbite.cleverkeys", "کلیورکیز", ['tools']],
  ["org.framasoft.peertube", "پیرتیوب", ['media']],
  ["com.sidhant.puzzle", "پازل‌ها", ['media']],
  ["com.baly_groceries_tracker.app", "بالی", ['productivity']],
  ["io.github.thezupzup.linthra", "لینترا", ['media']],
  ["com.sidhant.wallet", "کیف پول", ['tools']],
  ["com.ismartcoding.plain", "پلین‌اپ", ['system']],
  ["com.gwitko.conduit", "کاندویت", ['system']],
  ["com.dt.opnsense_manager", "اوپی‌ان‌سنس", ['system']],
  ["io.github.RealEarthling.epoch", "ایپاک", ['tools']],
  ["com.viscouspot.gitsync", "گیت‌سینک", ['productivity']],
  ["com.aeidolon.vaultexplorer", "والت‌اکسپلورر", ['security']],
  ["com.adilhanney.saber", "سابر", ['productivity']],
  ["com.robinroy.martial_body", "مارشال‌بادی", ['tools']],
  ["org.maegley.megrim", "مگرین", ['tools']],
  ["io.github.valnesfjord.tgwsproxyrs", "پروکسی تلگرام", ['internet']],
  ["de.schliweb.moveapiece", "موواپیس", ['media']],
  ["chat.simplex.app", "سیمپل‌ایکس", ['communication']],
  ["com.ammar.wallflow", "وال‌فلو", ['personalization']],
  ["net.taler.wallet.fdroid", "تالر", ['tools']],
  ["com.thomas.pedot.gitlalchemy", "گیت‌الکمی", ['productivity']],
  ["com.oksigenia.oksigenia_sos", "اکسیژنیا", ['tools']],
  ["shub39.momentum", "مومنتوم", ['media']],
  ["io.github.tiefseetauchner.tiefprompt", "تیف‌پرامپت", ['media']],
  ["futuristicgoo.squealer", "اسکویلر", ['system']],
  ["com.hugo.theuniversedecides", "تاس", ['tools']],
  ["futuristicgoo.emotic", "ایموتک", ['productivity']],
];

async function urlOk(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return r.ok;
  } catch { return false; }
}

function cleanText(t: string, max = 4000): string {
  return t.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

// مقدار لوکال‌یافته با fallback: اول en-US بعد هر لوکیال موجود
function loc(obj: any): any {
  if (!obj || typeof obj !== "object") return undefined;
  return obj["en-US"] ?? obj["en"] ?? Object.values(obj)[0];
}

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  console.log("reading index...");
  const idx = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
  const pkgs = idx.packages as Record<string, any>;
  console.log(`index has ${Object.keys(pkgs).length} packages`);

  // ── نقش‌ها ──
  const roleDefs: [string, string, string[]][] = [
    ["admin", "مدیر کل", ["*"]],
    ["content_manager", "مدیر محتوا", ["apps.write", "categories.write", "content.write", "news.write"]],
    ["file_reviewer", "بازبین فایل", ["versions.verify", "reports.review"]],
    ["user", "کاربر عادی", []],
  ];
  const roleIds: Record<string, string> = {};
  for (const [name, nameFa, perms] of roleDefs) {
    const existing = await db.select().from(s.roles).where(eq(s.roles.name, name));
    if (existing.length) { roleIds[name] = existing[0].id; continue; }
    const [r] = await db.insert(s.roles).values({ name, nameFa, permissions: perms }).returning();
    roleIds[name] = r.id;
  }

  // ── کاربر مدیر ──
  const adminEmail = process.env.ADMIN_EMAIL || "admin@narmstore.local";
  const adminPw = process.env.ADMIN_PASSWORD;
  const existingAdmin = await db.select().from(s.users).where(eq(s.users.email, adminEmail));
  if (!existingAdmin.length) {
    if (!adminPw) {
      console.log("⚠ ADMIN_PASSWORD set نشده — کاربر مدیر ساخته نشد. بعداً با اسکریپت admin بسازید.");
    } else {
      await db.insert(s.users).values({
        email: adminEmail, name: "مدیر نرم‌استور",
        passwordHash: hashPassword(adminPw), roleId: roleIds["admin"],
      });
      console.log(`✓ admin user created: ${adminEmail}`);
    }
  } else console.log("admin user exists, skipping");

  // ── دسته‌بندی‌ها ──
  const catIds: Record<string, string> = {};
  for (const [slug, nameFa, icon] of CATEGORIES) {
    const ex = await db.select().from(s.categories).where(eq(s.categories.slug, slug));
    if (ex.length) {
      catIds[slug] = ex[0].id;
      // ردیف قدیمی بدون نام انگلیسی: همان‌جا کاملش کن تا حالت EN فارسی نشان ندهد
      if (!ex[0].nameEn && CATEGORY_NAME_EN[slug]) {
        await db.update(s.categories).set({ nameEn: CATEGORY_NAME_EN[slug] }).where(eq(s.categories.slug, slug));
      }
      continue;
    }
    const [c] = await db.insert(s.categories).values({ slug, nameFa, nameEn: CATEGORY_NAME_EN[slug] ?? null, icon, sortOrder: 0 }).returning();
    catIds[slug] = c.id;
  }
  // والدها
  for (const [slug, , , parent] of CATEGORIES) {
    if (parent) await db.update(s.categories).set({ parentId: catIds[parent] }).where(eq(s.categories.slug, slug));
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  // ── مخزن F-Droid ──
  const repoEx = await db.select().from(s.repositories).where(eq(s.repositories.url, "https://f-droid.org/repo"));
  let repoId: string;
  if (repoEx.length) repoId = repoEx[0].id;
  else {
    const [r] = await db.insert(s.repositories).values({
      name: "مخزن رسمی F-Droid", url: "https://f-droid.org/repo", type: "fdroid",
      lastSyncStatus: "success",
    }).returning();
    repoId = r.id;
  }

  // ── اپ‌ها ──
  let added = 0, updated = 0, skipped = 0;
  for (const [pkg, nameFa, catSlugs, featured, editorChoice] of APPS) {
    const p = pkgs[pkg];
    const md = p?.metadata;
    const name = loc(md?.name);
    const iconName = loc(md?.icon)?.name;
    if (!p || !md || !name || !iconName) { console.log(`✗ skip ${pkg}: incomplete metadata`); skipped++; continue; }

    const iconUrl = FDROID + iconName;
    if (!process.env.SKIP_ICON_CHECK && !(await urlOk(iconUrl))) { console.log(`✗ skip ${pkg}: icon 404`); skipped++; continue; }

    const summary = loc(md.summary) || "";
    const description = loc(md.description) || summary;
    const slug = pkg.replace(/\./g, "-");

    // توسعه‌دهنده
    let developerId: string | null = null;
    const author = loc(md.authorName) || loc(md.author);
    if (author) {
      const ex = await db.select().from(s.developers).where(eq(s.developers.name, author));
      if (ex.length) developerId = ex[0].id;
      else {
        const [d] = await db.insert(s.developers).values({
          name: author, website: md.webSite || null,
        }).returning();
        developerId = d.id;
      }
    }

    const existing = await db.select().from(s.apps).where(eq(s.apps.packageName, pkg));
    let appId: string;
    // حالت سریع: برنامه‌های موجود کاملاً رد می‌شوند
    if (existing.length && process.env.SKIP_EXISTING) { skipped++; continue; }
    const appData = {
      slug, packageName: pkg, nameFa, nameEn: name,
      iconUrl, shortDesc: cleanText(summary, 300) || null,
      description: cleanText(description),
      developerId, license: md.license || null, isOpenSource: true,
      featured: !!featured, editorChoice: !!editorChoice, isPublished: true,
      sourceType: "fdroid", sourceUrl: `https://f-droid.org/packages/${pkg}/`,
      externalId: pkg,
      updatedAt: new Date(),
    };
    if (existing.length) {
      appId = existing[0].id;
      await db.update(s.apps).set(appData).where(eq(s.apps.id, appId));
      updated++;
    } else {
      const [a] = await db.insert(s.apps).values(appData).returning();
      appId = a.id;
      added++;
    }

    // دسته‌بندی‌ها
    await db.delete(s.appCategories).where(eq(s.appCategories.appId, appId));
    for (const cs of catSlugs) {
      if (catIds[cs]) await db.insert(s.appCategories).values({ appId, categoryId: catIds[cs] }).onConflictDoNothing();
    }

    // اسکرین‌شات‌ها (حداکثر ۴)
    await db.delete(s.appScreenshots).where(eq(s.appScreenshots.appId, appId));
    const shots = loc(md.screenshots?.phone)?.slice(0, 4) || [];
    for (let i = 0; i < shots.length; i++) {
      await db.insert(s.appScreenshots).values({ appId, url: FDROID + shots[i].name, sortOrder: i });
    }

    // نسخه‌ها (۳ نسخه‌ی آخر — کلیدها هش هستند، مرتب‌سازی با versionCode)
    const allVers = Object.values(p.versions || {}) as any[];
    allVers.sort((a, b) => (b?.manifest?.versionCode || 0) - (a?.manifest?.versionCode || 0));
    const latest = allVers.slice(0, 3);
    // حذف versionCodeهای تکراری داخل ایندکس
    const seenCodes = new Set<number>();
    const deduped = latest.filter((v: any) => {
      const vc = v?.manifest?.versionCode;
      if (vc == null || seenCodes.has(vc)) return false;
      seenCodes.add(vc);
      return true;
    });
    const exVers = await db.select().from(s.appVersions).where(eq(s.appVersions.appId, appId));
    for (let i = 0; i < deduped.length; i++) {
      const v = deduped[i];
      if (!v) continue;
      const f = v.file, m = v.manifest;
      if (!f?.name || !m?.versionName) continue;
      const sameVer = exVers.find((x) => x.versionCode === m.versionCode);
      let verId: string;
      const verData = {
        versionName: String(m.versionName), versionCode: Number(m.versionCode),
        fileUrl: FDROID + f.name, fileSize: f.size ?? null,
        sha256: f.sha256 || null,
        minSdk: m.usesSdk?.minSdkVersion ?? null,
        fileType: "apk", changelog: null,
        status: "active", isCurrent: i === 0,
        source: `F-Droid repo (${new Date(v.added).toISOString().slice(0, 10)})`,
        verifiedAt: new Date(), publishedAt: new Date(v.added),
      };
      if (sameVer) {
        verId = sameVer.id;
        await db.update(s.appVersions).set(verData).where(eq(s.appVersions.id, verId));
      } else {
        const [nv] = await db.insert(s.appVersions).values({ appId, ...verData }).returning();
        verId = nv.id;
      }
      // مجوزها (دسته‌ای)
      await db.delete(s.appPermissions).where(eq(s.appPermissions.versionId, verId));
      const perms: string[] = (m.usesPermission || []).map((x: any) => x.name).filter(Boolean).slice(0, 60);
      if (perms.length) {
        await db.insert(s.appPermissions).values(perms.map((pm) => ({ versionId: verId, permission: pm })));
      }
    }
    console.log(`✓ ${nameFa} (${pkg})`);
  }

  await db.insert(s.repositorySyncLogs).values({
    repositoryId: repoId, status: "success", finishedAt: new Date(),
    message: "Seed اولیه از ایندکس F-Droid",
    appsAdded: added, appsUpdated: updated,
  });
  await db.update(s.repositories).set({ lastSyncAt: new Date(), lastSyncStatus: "success" })
    .where(eq(s.repositories.id, repoId));

  // ── صفحات ثابت ──
  const pages: [string, string, string][] = [
    ["about", "درباره نرم‌استور",
      "نرم‌استور یک فروشگاه نرم‌افزار فارسی برای اندروید است. هدف ما معرفی و ارائه‌ی امن نرم‌افزارهای کاربردی، به‌ویژه نرم‌افزارهای آزاد و متن‌باز است.\n\nتمام فایل‌های ارائه‌شده در نرم‌استور از منابع رسمی و معتبر دریافت می‌شوند و پیش از انتشار، هش SHA-256 و اصالت آن‌ها بررسی می‌شود."],
    ["install-guide", "راهنمای نصب",
      "۱. فایل APK را دانلود کنید.\n۲. در تنظیمات اندروید، اجازه‌ی «نصب از منابع ناشناس» را برای مرورگر یا فایل‌منیجر فعال کنید.\n۳. فایل دانلودشده را باز کنید و «نصب» را بزنید.\n\n⚠️ فایل را فقط از همین صفحه و با تطابق هش SHA-256 نصب کنید."],
    ["terms", "قوانین استفاده",
      "استفاده از نرم‌استور به‌معنای پذیرش این قوانین است:\n\n- تمام نرم‌افزارها متعلق به توسعه‌دهندگان خودشان هستند و تحت مجوزهای اعلام‌شده عرضه می‌شوند.\n- نرم‌استور مسئولیتی در قبال استفاده‌ی نادرست از نرم‌افزارها ندارد.\n- گزارش لینک خراب یا محتوای مشکل‌دار به بهبود سرویس کمک می‌کند."],
    ["privacy", "حریم خصوصی",
      "نرم‌استور برای آمار دانلود، فقط هش یک‌طرفه‌ی آدرس IP را به‌صورت ناشناس ذخیره می‌کند و آدرس IP خام هیچ‌وقت ذخیره نمی‌شود.\n\nاطلاعات حساب کاربری (در صورت ثبت‌نام) فقط برای ارائه‌ی خدمات استفاده می‌شود و به شخص ثالث فروخته یا واگذار نمی‌شود."],
  ];
  for (const [slug, title, body] of pages) {
    const ex = await db.select().from(s.contentPages).where(eq(s.contentPages.slug, slug));
    if (!ex.length) await db.insert(s.contentPages).values({ slug, title, body });
  }

  // ── تنظیمات سایت ──
  const settings: [string, string][] = [
    ["site_name", "نرم‌استور"],
    ["site_tagline", "فروشگاه فارسی نرم‌افزار اندروید"],
    ["download_dedup_hours", "24"],
  ];
  for (const [key, value] of settings) {
    const ex = await db.select().from(s.siteSettings).where(eq(s.siteSettings.key, key));
    if (!ex.length) await db.insert(s.siteSettings).values({ key, value });
  }

  console.log(`\n✓ done: added=${added} updated=${updated} skipped=${skipped}`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
