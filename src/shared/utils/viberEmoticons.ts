/**
 * Map Viber emoticon codes to Unicode emoji
 * Based on Viber's official emoticon set
 *
 * Reference: https://github.com/Crissov/unicode-proposals/issues/403
 */
export const VIBER_EMOTICON_MAP: Record<string, string> = {
  // Faces
  "(smiley)": "😊",
  "(sad)": "🙁",
  "(wink)": "😉",
  "(angry)": "😡",
  "(inlove)": "😍",
  "(yummi)": "😋",
  "(laugh)": "😁",
  "(surprised)": "😮",
  "(moa)": "😘",
  "(happy)": "😊",
  "(cry)": "😢",
  "(sick)": "🤢",
  "(shy)": "😳",
  "(teeth)": "😁",
  "(tongue)": "😛",
  "(money)": "🤑",
  "(mad)": "😒",
  "(flirt)": "😏",
  "(crazy)": "🤪",
  "(confused)": "😕",
  "(depressed)": "😞",
  "(scream)": "🤬",
  "(nerd)": "🤓",
  "(not_sure)": "😕",
  "(cool)": "😎",
  "(huh)": "😧",
  "(happycry)": "😂",
  "(mwah)": "😘",
  "(exhausted)": "😩",
  "(eek)": "😁",
  "(dead)": "😵",
  "(straight)": "😐",
  "(yo)": "😏",
  "(wtf)": "😖",
  "(ohno)": "😱",
  "(oh)": "😧",
  "(wink2)": "😉",
  "(what)": "🤨",
  "(weak)": "😩",
  "(upset)": "😠",
  "(ugh)": "😟",
  "(silly)": "🤪",
  "(meh)": "😒",
  "(ninja)": "🥷",
  "(devil)": "😈",
  "(angel)": "😇",
  "(hmm)": "🤔",
  "(crying)": "😭",
  "(teary)": "🥺",
  "(eyeroll)": "🙄",

  // Hearts
  "(heart)": "❤️",
  "(heart_break)": "💔",
  "(purple_heart)": "💜",
  "(yellow_heart)": "💛",
  "(blue_heart)": "💙",
  "(orange_heart)": "🧡",
  "(black_heart)": "🖤",
  "(2_hearts)": "💕",
  "(arrow_heart)": "💘",

  // Gestures
  "(unlike)": "👎",
  "(like)": "👍",
  "(V)": "✌️",
  "(fu)": "🖕",
  "(clap)": "👏",
  "(rockon)": "🤘",
  "(pointer)": "☝️",
  "(waving)": "👋",
  "(fist)": "✊",
  "(prayer_hands)": "🙏",
  "(footsteps)": "👣",
  "(muscle)": "💪",
  "(thinking)": "🤔",
  "(zzz)": "💤",

  // Symbols
  "(!)": "❗",
  "(Q)": "❓",
  "(diamond)": "💎",
  "(trophy)": "🏆",
  "(crown)": "👑",
  "(ring)": "💍",
  "($)": "💵",

  // Objects
  "(hammer)": "🔨",
  "(wrench)": "🔧",
  "(key)": "🔑",
  "(lock)": "🔒",
  "(video)": "🎥",
  "(TV)": "📺",
  "(tape)": "📼",
  "(trumpet)": "🎺",
  "(guitar)": "🎸",
  "(drum)": "🥁",
  "(speaker)": "🔊",
  "(music)": "🎵",
  "(microphone)": "🎤",
  "(bell)": "🔔",

  // Animals
  "(koala)": "🐨",
  "(sheep)": "🐑",
  "(ladybug)": "🐞",
  "(kangaroo)": "🦘",
  "(chick)": "🐣",
  "(monkey)": "🐒",
  "(panda)": "🐼",
  "(turtle)": "🐢",
  "(bunny)": "🐇",
  "(fly)": "🪰",
  "(bee)": "🐝",
  "(bat)": "🦇",
  "(cat)": "🐈",
  "(dog)": "🐕",
  "(squirrel)": "🐿️",
  "(snake)": "🐍",
  "(snail)": "🐌",
  "(shark)": "🦈",
  "(goldfish)": "🐠", // Tropical fish (Viber has custom goldfish)
  "(pig)": "🐖",
  "(owl)": "🦉",
  "(penguin)": "🐧",
  "(porcupine)": "🦔",
  "(fox)": "🦊",
  "(octopus)": "🐙",
  "(dinosaur)": "🦕",
  "(paw)": "🐾",
  "(poo)": "💩",

  // Clothes & Accessories
  "(cap)": "🧢",
  "(bowtie)": "🎀",
  "(fidora)": "🎩", // Top hat (Viber typo: "fedora", no fedora emoji)

  // Nature
  "(cactus)": "🌵",
  "(clover)": "🍀",
  "(sprout)": "🌱",
  "(palmtree)": "🌴",
  "(christmas_tree)": "🎄",
  "(mapleleaf)": "🍁",
  "(flower)": "🌸",
  "(sunflower)": "🌻",
  "(bouquet)": "💐",

  // Weather
  "(sun)": "☀️",
  "(moon)": "🌜",
  "(cloud)": "☁️",
  "(rain)": "🌧️",
  "(droplet)": "💧",
  "(lightening)": "⚡",
  "(rainbow)": "🌈",
  "(earth)": "🌍",
  "(full_moon)": "🌕",
  "(shooting_star)": "🌠",
  "(star)": "⭐",
  "(umbrella)": "☂️",
  "(snowman)": "⛄",
  "(snowflake)": "❄️",
  "(termometer)": "🌡️",
  "(tornado)": "🌪️",

  // Activities
  "(flipflop)": "🩴",
  "(bikini)": "👙",
  "(sunglasses)": "🕶️",

  // Tech & Tools
  "(phone)": "📱",
  "(battery)": "🔋",
  "(time)": "⏰",
  "(camera)": "📷",
  "(telephone)": "☎️",

  // Medical
  "(knife)": "🔪",
  "(syringe)": "💉",
  "(meds)": "💊",
  "(tablet)": "💊", // no separate tablet emoji

  // Office
  "(ruler)": "📏",
  "(scissor)": "✂️",
  "(paperclip)": "📎",
  "(pencil)": "✏️",
  "(magnify)": "🔍",
  "(glasses)": "👓",
  "(book)": "📘",
  "(letter)": "✉️",

  // Misc
  "(angrymark)": "💢",
  "(boxing)": "🥊",
  "(light_bulb)": "💡",
  "(lantern)": "🏮",
  "(fire)": "🔥",

  "(bomb)": "💣",
  "(cigarette)": "🚬",
  "(kiss)": "💋",
  "(gift)": "🎁",
  "(skull)": "💀",
  "(ghost)": "👻",
  "(robot)": "🤖",
  "(alien)": "👽",

  // Sports
  "(golf)": "⛳",
  "(football)": "🏈",
  "(tennis)": "🎾",
  "(soccer)": "⚽",
  "(basketball)": "🏀",
  "(baseball)": "⚾",
  "(8ball)": "🎱",
  "(iceskate)": "⛸️",
  "(target)": "🎯",
  "(racing_flag)": "🏁",
  "(balloon1)": "🎈",
  "(balloon2)": "🎈",
  "(cards)": "🃏",
  "(dice)": "🎲",
  "(console)": "🎮",
  "(golfball)": "⛳", // no separate golf ball emoji
  "(beachball)": "🏐", // no beach ball emoji

  // Food
  "(chicken)": "🍗",
  "(burger)": "🍔",
  "(pizza)": "🍕",
  "(noodles)": "🍜",
  "(sushi1)": "🍣",
  "(sushi2)": "🍣",
  "(donut)": "🍩",
  "(egg)": "🍳",
  "(hotdog)": "🌭",
  "(bacon)": "🥓",
  "(hotsauce)": "🌶️",
  "(ice_cream)": "🍦",
  "(cupcake)": "🧁",
  "(croissant)": "🥐",
  "(chocolate)": "🍫",
  "(lollipop)": "🍭",
  "(cookie)": "🍪",
  "(cake_slice)": "🍰",
  "(popcorn)": "🍿",
  "(cake)": "🎂",

  // Fruits & Vegetables
  "(cherry)": "🍒",
  "(banana)": "🍌",
  "(watermelon)": "🍉",
  "(strawberry)": "🍓",
  "(grapes)": "🍇",
  "(lemon)": "🍋",
  "(peach)": "🍑",
  "(apple)": "🍎",
  "(pineapple)": "🍍",
  "(eggplant)": "🍆",
  "(corn)": "🌽",
  "(mushroom)": "🍄",

  // Drinks
  "(coffee)": "☕",
  "(soda)": "🥤",
  "(beer)": "🍺",
  "(wine)": "🍷",
  "(martini)": "🍸",
  "(champagne)": "🍾",
  "(cocktail)": "🍹",

  // Other
  "(cutlery)": "🍴",
  "(party_popper)": "🎉",
  "(confetti_ball)": "🎊",
  "(car)": "🚗",
  "(taxi)": "🚕",
  "(ambulance)": "🚑",
  "(policecar)": "🚓",
  "(bicycle)": "🚲",
  "(airplane)": "✈️",
  "(trafficlight)": "🚦",
  "(stop_sign)": "🛑",
  "(ufo)": "🛸",
  "(rocket)": "🚀",
  "(run)": "🏃",
  "(shrug)": "🤷",
  "(up_graph)": "📈",
  "(down_graph)": "📉",
  "(color_palette)": "🎨",
  "(paintbrush)": "🖌️",
  "(crystal_ball)": "🔮",
  "(checkmark)": "✅",
  "(baby_bottle)": "🍼",
  "(anchor)": "⚓",
  "(first_aid)": "⚕️",
  "(handicap)": "♿",
  "(do_not_enter)": "🚫",
  "(over18)": "🔞",
  "(spiral)": "🌀",
  "(moneybag)": "💰",
  "(eyes)": "👀",

  // similar but not exact
  "(partyhat)": "🎉",
  "(santa_hat)": "🎅",
  "(tiara)": "👑",

  // Not existent in Unicode
  "(spiderman)": "(spiderman)",
  "(batman)": "(batman)",
  "(dragonfly)": "(dragonfly)",
  "(singing)": "(singing)",
  "(relax)": "(relax)",
  "(nobattery)": "(nobattery)",
  "(weight)": "(weight)",
  "(popsicle)": "(popsicle)",
  "(pea)": "(pea)",
  "(dizzy)": "(dizzy)",
  "(mischievous)": "(mischievous)",
  "(heart_lock)": "(heart_lock)",
  "(blue_flower)": "(blue_flower)",
  "(fan)": "(fan)",
  "(torch)": "(torch)",
};

/**
 * Convert Viber emoticon codes to Unicode emoji
 * Example: "(smiley) Hello (heart)" -> "😊 Hello ❤️"
 *
 * @param text - Text containing Viber emoticon codes
 * @returns Text with emoticon codes replaced by Unicode emoji
 */
export function convertViberEmoticons(text: string): string {
  if (!text) return text;

  // Replace all Viber emoticon codes with Unicode emoji
  // Pattern matches anything inside parentheses: (smiley), (!), ($), (TV), (V), etc.
  return text.replace(/\([^)]+\)/g, (match) => {
    const emoji = VIBER_EMOTICON_MAP[match];
    return emoji || match; // Return original if no mapping found
  });
}
