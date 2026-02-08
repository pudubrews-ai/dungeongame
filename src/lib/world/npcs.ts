/**
 * NPC definitions and dialogue trees
 */

import type { NPC, DialogueNode, DialogueOption, GameState } from '../types';
import { createLogEntry } from '../engine/game-init';

/**
 * Helper to add an info log entry within a dialogue action callback
 */
function addShopLog(state: GameState, message: string): GameState {
  return {
    ...state,
    gameLog: [...state.gameLog, createLogEntry(message, 'info')],
    timestamp: Date.now(),
  };
}

/**
 * Helper function to create dialogue nodes
 */
function createDialogueNode(
  id: string,
  text: string,
  options: DialogueOption[]
): DialogueNode {
  return { id, text, options };
}

/**
 * Village Guard - Patrols the village square
 */
export const villageGuard: NPC = {
  id: 'village-guard',
  name: 'Village Guard',
  description: 'A stern-looking guard in leather armor, keeping watch over the village square.',
  hostile: false,
  dialogue: [
    createDialogueNode('greeting', 'Halt! State your business, traveler.', [
      {
        text: "I'm just passing through.",
        nextNodeId: 'passing-through',
      },
      {
        text: 'Is there any trouble in the village?',
        nextNodeId: 'trouble',
      },
      {
        text: 'Farewell.',
        nextNodeId: undefined,
      },
    ]),
    createDialogueNode(
      'passing-through',
      "Very well. Keep your nose clean while you're here. We don't tolerate troublemakers.",
      [
        {
          text: 'Is there any trouble in the village?',
          nextNodeId: 'trouble',
        },
        {
          text: 'Understood. Farewell.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'trouble',
      "There have been reports of bandits on the road to the south, and strange noises coming from the old ruins. The mayor might have work for an adventurer like yourself.",
      [
        {
          text: "I'll speak with the mayor.",
          nextNodeId: 'mayor-suggestion',
        },
        {
          text: 'Thanks for the warning.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'mayor-suggestion',
      "Good. You'll find the mayor in the town hall, just north of here. Tell them I sent you.",
      [
        {
          text: 'I will. Thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Merchant - Sells basic goods in the village square
 */
export const merchant: NPC = {
  id: 'merchant',
  name: 'Merchant',
  description: 'A portly merchant with a friendly smile and a cart full of goods.',
  hostile: false,
  dialogue: [
    createDialogueNode('greeting', 'Welcome, welcome! Looking for supplies for your journey?', [
      {
        text: 'What do you have for sale?',
        nextNodeId: 'shop',
      },
      {
        text: 'Tell me about the village.',
        nextNodeId: 'village-info',
      },
      {
        text: 'Not today, thank you.',
        nextNodeId: undefined,
      },
    ]),
    createDialogueNode(
      'shop',
      "I have basic supplies - rope, torches, rations. For proper equipment, you'll want to visit the shop to the east. Much better selection there!",
      [
        {
          text: 'Tell me about the village.',
          nextNodeId: 'village-info',
        },
        {
          text: 'Thank you for the information.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'village-info',
      "This is a peaceful village, for the most part. Good folk, honest work. Though lately... well, there's been trouble with creatures from the forest. Best be careful if you venture that way.",
      [
        {
          text: 'What kind of creatures?',
          nextNodeId: 'creatures',
        },
        {
          text: 'I can handle myself.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'creatures',
      "Goblins, mostly. Sometimes worse. The old ruins to the south seem to be attracting all sorts of nasty things. If you're brave enough to investigate, there might be treasure down there...",
      [
        {
          text: 'Thanks for the tip.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Mayor - Quest giver in the town hall
 */
export const mayor: NPC = {
  id: 'mayor',
  name: 'Mayor Thornwick',
  description: 'An elderly man with gray hair and a worried expression, dressed in fine robes.',
  hostile: false,
  questGiver: true,
  dialogue: [
    createDialogueNode(
      'greeting',
      'Ah, an adventurer! Just the sort of person we need. Our village has been plagued by troubles lately.',
      [
        {
          text: 'What kind of troubles?',
          nextNodeId: 'troubles',
        },
        {
          text: 'How can I help?',
          nextNodeId: 'help',
        },
        {
          text: "I'm not interested in village problems.",
          nextNodeId: 'declined',
        },
      ]
    ),
    createDialogueNode(
      'troubles',
      'Bandits have been ambushing travelers on the roads, and something sinister stirs in the ancient ruins to the south. Our guards are too few to handle both threats.',
      [
        {
          text: 'I could deal with the bandits.',
          nextNodeId: 'bandit-quest',
        },
        {
          text: 'Tell me about the ruins.',
          nextNodeId: 'ruins-info',
        },
        {
          text: "That does sound serious. I'll think about it.",
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'help',
      "We need someone to investigate the ancient ruins south of the village. Something evil has awakened there, and it threatens all of us. I'll pay handsomely for your services.",
      [
        {
          text: "I'll take the job. (Accept Quest)",
          nextNodeId: 'quest-accepted',
          action: (state: GameState) => {
            // TODO: Add quest to game state
            return state;
          },
        },
        {
          text: 'What exactly is in these ruins?',
          nextNodeId: 'ruins-info',
        },
        {
          text: 'Let me think about it.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'declined',
      "I understand. These are dangerous times, and not everyone is cut out for heroism. If you change your mind, you know where to find me.",
      [
        {
          text: 'Farewell.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'ruins-info',
      'The ruins date back to an ancient civilization. Legend speaks of a powerful artifact buried deep within, but also of terrible guardians. Many who ventured there have not returned.',
      [
        {
          text: 'Sounds dangerous. What\'s the reward?',
          nextNodeId: 'reward',
        },
        {
          text: 'I need to prepare before attempting this.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'reward',
      '500 gold pieces and whatever treasure you find in the ruins is yours to keep. Plus, you\'ll have the gratitude of everyone in the village.',
      [
        {
          text: "I'll do it. (Accept Quest)",
          nextNodeId: 'quest-accepted',
        },
        {
          text: 'Let me think about it.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'quest-accepted',
      'Excellent! May the gods watch over you. Return to me when you\'ve cleared the ruins, and I\'ll have your payment ready.',
      [
        {
          text: 'I won\'t let you down.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'bandit-quest',
      'The bandits have a camp somewhere in the forest. Scatter them, and I\'ll pay you 200 gold. Deal with their leader, and I\'ll double it.',
      [
        {
          text: 'Consider it done.',
          nextNodeId: 'bandit-accepted',
        },
        {
          text: 'Let me consider both options.',
          nextNodeId: 'troubles',
        },
      ]
    ),
    createDialogueNode('bandit-accepted', 'Wonderful! Good hunting, adventurer.', [
      {
        text: 'Farewell.',
        nextNodeId: undefined,
      },
    ]),
  ],
};

/**
 * Town Clerk - Provides information
 */
export const townClerk: NPC = {
  id: 'town-clerk',
  name: 'Town Clerk',
  description: 'A meticulous man with ink-stained fingers, organizing stacks of parchment.',
  hostile: false,
  dialogue: [
    createDialogueNode(
      'greeting',
      'Good day. I keep the village records. Is there something I can help you find?',
      [
        {
          text: 'Tell me about the village history.',
          nextNodeId: 'history',
        },
        {
          text: 'Any interesting records?',
          nextNodeId: 'records',
        },
        {
          text: 'No, thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'history',
      'Our village was founded three centuries ago by settlers fleeing war in the east. The ancient ruins predate our settlement by at least a thousand years.',
      [
        {
          text: 'What do you know about the ruins?',
          nextNodeId: 'ruins-history',
        },
        {
          text: 'Fascinating. Thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'ruins-history',
      'The ruins belonged to a civilization that worshipped strange gods. When our founders arrived, the ruins were already abandoned. We\'ve always kept our distance... until recently.',
      [
        {
          text: 'What changed recently?',
          nextNodeId: 'recent-changes',
        },
        {
          text: 'I see. Thank you for the information.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'recent-changes',
      'Three months ago, an earthquake opened new passages in the ruins. Since then, creatures have been emerging at night. The mayor is quite concerned.',
      [
        {
          text: 'Thank you for the information.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'records',
      'Mostly mundane things - tax records, birth certificates, property deeds. Though I did find an old map of the ruins in the archives. Fascinating, if you\'re into that sort of thing.',
      [
        {
          text: 'Could I see that map?',
          nextNodeId: 'map',
        },
        {
          text: 'Not really my interest.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'map',
      'I\'m afraid it\'s quite fragile. But I can tell you it shows three main chambers: an entrance hall, a treasury, and something labeled "The Sanctum." Whatever that means.',
      [
        {
          text: 'Very helpful. Thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Shopkeeper - Runs the village shop
 */
export const shopkeeper: NPC = {
  id: 'shopkeeper',
  name: 'Shopkeeper Mira',
  description: 'A shrewd woman with sharp eyes and a welcoming smile.',
  hostile: false,
  shop: {
    items: [
      {
        id: 'shop-healing-potion',
        name: 'Healing Potion',
        description: 'A red potion that restores 2d4+2 hit points.',
        weight: 0.5,
        value: 50,
        type: 'potion',
        usable: true,
      },
      {
        id: 'shop-longsword',
        name: 'Longsword',
        description: 'A sharp steel blade, well-balanced for combat.',
        weight: 3,
        value: 15,
        type: 'weapon',
        usable: false,
      },
      {
        id: 'shop-leather-armor',
        name: 'Leather Armor',
        description: 'Light armor offering decent protection.',
        weight: 10,
        value: 10,
        type: 'armor',
        usable: false,
      },
      {
        id: 'shop-shield',
        name: 'Wooden Shield',
        description: 'A sturdy shield for blocking attacks.',
        weight: 6,
        value: 10,
        type: 'armor',
        usable: false,
      },
      {
        id: 'shop-torch',
        name: 'Torch',
        description: 'A wooden torch for lighting dark places.',
        weight: 1,
        value: 1,
        type: 'misc',
        usable: false,
      },
      {
        id: 'shop-rope',
        name: 'Rope (50 ft)',
        description: 'Fifty feet of sturdy hemp rope.',
        weight: 5,
        value: 1,
        type: 'misc',
        usable: false,
      },
    ],
    buyMultiplier: 1.5,
    sellMultiplier: 0.5,
  },
  dialogue: [
    createDialogueNode('greeting', 'Welcome to my shop! Best prices in the village. What can I get you?', [
      {
        text: 'Show me your wares.',
        nextNodeId: 'shop',
      },
      {
        text: 'I have items to sell.',
        nextNodeId: 'sell',
      },
      {
        text: 'Just browsing.',
        nextNodeId: undefined,
      },
    ]),
    createDialogueNode(
      'shop',
      'I have weapons, armor, potions, and general supplies. Everything an adventurer needs!',
      [
        {
          text: 'I\'d like to buy something.',
          nextNodeId: undefined,
          action: (state) => {
            const npc = state.npcs['shopkeeper'];
            if (!npc?.shop || npc.shop.items.length === 0) {
              return addShopLog(state, 'I\'m all sold out, sorry!');
            }
            let s = addShopLog(state, '--- For Sale ---');
            for (const item of npc.shop.items) {
              const price = Math.ceil(item.value * npc.shop.buyMultiplier);
              s = addShopLog(s, `  ${item.name} — ${price} gp (${item.type}, ${item.weight} lbs)`);
            }
            s = addShopLog(s, 'Use "buy <item name>" to purchase.');
            return s;
          },
        },
        {
          text: 'Maybe later.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'sell',
      "Let's see what you've got. I'll give you fair prices, though I can't pay full value.",
      [
        {
          text: 'Show me what I can sell.',
          nextNodeId: undefined,
          action: (state) => {
            const npc = state.npcs['shopkeeper'];
            if (!npc?.shop) return state;
            const items = state.character.inventory.items;
            if (items.length === 0) {
              return addShopLog(state, "Looks like you don't have anything to sell.");
            }
            let s = addShopLog(state, '--- Your Items ---');
            for (const item of items) {
              const price = Math.floor(item.value * npc.shop.sellMultiplier);
              s = addShopLog(s, `  ${item.name} — ${price} gp`);
            }
            s = addShopLog(s, 'Use "sell <item name>" to sell.');
            return s;
          },
        },
        {
          text: 'Never mind.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Bartender - Serves drinks and information
 */
export const bartender: NPC = {
  id: 'bartender',
  name: 'Bartender Tom',
  description: 'A burly man with a friendly demeanor, polishing a glass behind the bar.',
  hostile: false,
  dialogue: [
    createDialogueNode('greeting', 'Welcome to the Prancing Pony! What\'ll it be?', [
      {
        text: 'I\'ll have an ale. (2 gold)',
        nextNodeId: 'ale',
        requiresCheck: undefined,
      },
      {
        text: 'Got any rumors?',
        nextNodeId: 'rumors',
      },
      {
        text: 'Can I rent a room?',
        nextNodeId: 'room',
      },
      {
        text: 'Just looking around.',
        nextNodeId: undefined,
      },
    ]),
    createDialogueNode(
      'ale',
      '*Slides a mug across the bar* Here you go. Fresh from the barrel. Best ale in the region!',
      [
        {
          text: '*Takes a drink* Got any rumors?',
          nextNodeId: 'rumors',
        },
        {
          text: 'Thanks. *Pays 2 gold*',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'rumors',
      "Well, let's see... There's talk of treasure in the old ruins. Some say there's a magical artifact down there. Course, there's also talk of undead guardians, so...",
      [
        {
          text: 'Anything else?',
          nextNodeId: 'more-rumors',
        },
        {
          text: 'Interesting. Thanks.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'more-rumors',
      'That mysterious stranger in the corner... been here for three days, barely says a word. Just sits there watching everyone. Makes folks nervous.',
      [
        {
          text: 'Thanks for the information.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'room',
      'Rooms are 10 gold per night. Includes breakfast and a place to rest safely. Interested?',
      [
        {
          text: 'Yes, I\'ll take a room. (Pay 10 gold)',
          nextNodeId: 'room-rented',
        },
        {
          text: 'Maybe later.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode('room-rented', 'Upstairs, second door on the right. Sleep well!', [
      {
        text: 'Thank you.',
        nextNodeId: undefined,
      },
    ]),
  ],
};

/**
 * Mysterious Stranger - Provides hints and secrets
 */
export const mysteriousStranger: NPC = {
  id: 'mysterious-stranger',
  name: 'Mysterious Stranger',
  description: 'A hooded figure sitting alone in the corner, face obscured by shadows.',
  hostile: false,
  dialogue: [
    createDialogueNode(
      'greeting',
      '*Looks up slowly* You have the look of an adventurer. Seeking glory? Or gold?',
      [
        {
          text: 'Who are you?',
          nextNodeId: 'identity',
        },
        {
          text: 'Both, ideally.',
          nextNodeId: 'both',
        },
        {
          text: 'None of your business.',
          nextNodeId: 'rude',
        },
      ]
    ),
    createDialogueNode(
      'identity',
      '*Chuckles darkly* Names are dangerous things. Let\'s just say I have an interest in the old ruins.',
      [
        {
          text: 'What do you know about the ruins?',
          nextNodeId: 'ruins-info',
        },
        {
          text: 'This conversation is getting nowhere.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'both',
      '*Smiles* An honest answer. Very well. If you seek treasure in the ruins, you\'ll need this. *Slides a piece of parchment across the table*',
      [
        {
          text: '*Takes the parchment* What is this?',
          nextNodeId: 'hint',
        },
        {
          text: '*Suspicious* What\'s the catch?',
          nextNodeId: 'catch',
        },
      ]
    ),
    createDialogueNode(
      'rude',
      '*Shrugs* As you wish. But you\'ll regret not listening when you face what lurks below.',
      [
        {
          text: 'Wait... tell me more.',
          nextNodeId: 'ruins-info',
        },
        {
          text: 'I\'ll take my chances.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'ruins-info',
      'The ruins hold great power, but also great danger. The deepest chamber contains something that should not be disturbed. But if you must go... beware the guardian.',
      [
        {
          text: 'What kind of guardian?',
          nextNodeId: 'guardian',
        },
        {
          text: 'How do you know this?',
          nextNodeId: 'knowledge',
        },
      ]
    ),
    createDialogueNode(
      'guardian',
      'An ancient evil, bound by magic to protect the sanctum. It cannot be reasoned with. Only defeated. Take this knowledge as my gift.',
      [
        {
          text: 'Thank you for the warning.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'knowledge',
      '*Stands to leave* Some secrets are best left unspoken. Good luck, adventurer. You\'ll need it. *Disappears into the shadows*',
      [
        {
          text: '...',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'hint',
      'A map fragment. It shows a secret passage to the treasury. Use it wisely.',
      [
        {
          text: 'Why are you helping me?',
          nextNodeId: 'helping',
        },
        {
          text: 'Thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'catch',
      '*Laughs* No catch. I simply enjoy watching heroes face their destiny. Will you rise to glory... or fall to darkness?',
      [
        {
          text: 'I won\'t fail.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'helping',
      'Let\'s just say... I have an interest in seeing what happens when you reach the bottom of those ruins.',
      [
        {
          text: 'That\'s unsettling, but... thanks.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Hermit - Lives in the forest clearing
 */
export const hermit: NPC = {
  id: 'hermit',
  name: 'Old Hermit',
  description: 'An ancient man with a long white beard, living in harmony with the forest.',
  hostile: false,
  dialogue: [
    createDialogueNode(
      'greeting',
      '*Looks up from tending herbs* Ah, a visitor. Welcome to my clearing. What brings you to the deep woods?',
      [
        {
          text: 'Just exploring.',
          nextNodeId: 'exploring',
        },
        {
          text: 'Are you a healer?',
          nextNodeId: 'healer',
        },
        {
          text: 'Do you know about the ruins?',
          nextNodeId: 'ruins',
        },
      ]
    ),
    createDialogueNode(
      'exploring',
      'Be careful, young one. The forest has grown dangerous. Dark forces stir in the old places.',
      [
        {
          text: 'Can you help me?',
          nextNodeId: 'help',
        },
        {
          text: 'I can handle myself.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'healer',
      'I know the ways of herbs and healing, yes. Been living in these woods for... oh, fifty years now. I can restore your wounds, if you need it.',
      [
        {
          text: 'Yes, please heal me. (Costs 20 gold)',
          nextNodeId: 'healing',
        },
        {
          text: 'Maybe later. Tell me about the ruins.',
          nextNodeId: 'ruins',
        },
        {
          text: 'I\'m fine, thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'healing',
      '*Places hands on your wounds, which glow with soft green light* There. The forest\'s blessing is upon you.',
      [
        {
          text: 'Thank you. I feel much better.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'ruins',
      'Cursed place. Was sealed for good reason. Now something has broken the seals. The forest feels the corruption spreading. If you\'re going there, take this blessing.',
      [
        {
          text: 'What kind of blessing?',
          nextNodeId: 'blessing',
        },
        {
          text: 'Thank you, wise one.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'blessing',
      '*Sprinkles herb dust over you* Protection from evil. It may save your life in the darkness below.',
      [
        {
          text: 'I\'m grateful.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'help',
      'I can heal your wounds and offer blessings of protection. The forest provides.',
      [
        {
          text: 'Yes, please heal me.',
          nextNodeId: 'healing',
        },
        {
          text: 'That would help. Thank you.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Ruins Guardian - NPC guarding the ruins entrance
 */
export const ruinsGuardian: NPC = {
  id: 'ruins-guardian',
  name: 'Ruins Guardian',
  description: 'A spectral figure in ancient armor, bound to guard the entrance.',
  hostile: false,
  dialogue: [
    createDialogueNode(
      'greeting',
      '*A ghostly voice echoes* HALT. None may pass without answering the riddle of the ancients.',
      [
        {
          text: 'I\'m ready. Ask your riddle.',
          nextNodeId: 'riddle',
        },
        {
          text: 'What if I refuse?',
          nextNodeId: 'refuse',
        },
        {
          text: 'I\'ll come back later.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'riddle',
      'I am not alive, but I grow. I don\'t have lungs, but I need air. I don\'t have a mouth, but water kills me. What am I?',
      [
        {
          text: 'Fire.',
          nextNodeId: 'correct',
        },
        {
          text: 'A plant.',
          nextNodeId: 'wrong',
        },
        {
          text: 'I need to think about this...',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'correct',
      '*The guardian nods solemnly* Correct. You may pass. But beware - the darkness below is not so easily overcome.',
      [
        {
          text: 'Thank you, guardian.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'wrong',
      '*Shakes head* Incorrect. Return when you have pondered the riddle more carefully.',
      [
        {
          text: 'Let me try again.',
          nextNodeId: 'riddle',
        },
        {
          text: 'I\'ll think about it.',
          nextNodeId: undefined,
        },
      ]
    ),
    createDialogueNode(
      'refuse',
      'Then you shall not pass. The ancient laws must be upheld.',
      [
        {
          text: 'Fine, I\'ll answer the riddle.',
          nextNodeId: 'riddle',
        },
        {
          text: 'I\'ll leave then.',
          nextNodeId: undefined,
        },
      ]
    ),
  ],
};

/**
 * Skeleton Warrior - Hostile undead in the dungeon
 */
export const skeletonWarrior: NPC = {
  id: 'skeleton-warrior',
  name: 'Skeleton Warrior',
  description: 'An animated skeleton in rusted armor, wielding a notched sword.',
  hostile: true,
  stats: {
    hitPoints: 20,
    armorClass: 13,
    attackBonus: 3,
    damage: '1d8+1',
  },
  dialogue: [
    createDialogueNode(
      'combat',
      '*The skeleton\'s jaw clacks as it raises its sword to attack!*',
      []
    ),
  ],
};

/**
 * Dungeon Boss - Powerful enemy in the depths
 */
export const dungeonBoss: NPC = {
  id: 'dungeon-boss',
  name: 'Shadow Lord',
  description: 'A towering figure wreathed in darkness, eyes glowing with malevolent red light.',
  hostile: true,
  stats: {
    hitPoints: 50,
    armorClass: 16,
    attackBonus: 6,
    damage: '2d8+3',
  },
  dialogue: [
    createDialogueNode(
      'encounter',
      '*A deep, echoing voice fills the chamber* FOOLISH MORTAL. YOU DARE DISTURB MY SLUMBER?',
      [
        {
          text: 'I\'m here to stop you!',
          nextNodeId: 'combat',
        },
        {
          text: 'I mean no harm...',
          nextNodeId: 'plea',
        },
      ]
    ),
    createDialogueNode(
      'plea',
      '*Laughs coldly* TOO LATE FOR MERCY. YOUR SOUL SHALL JOIN MY COLLECTION!',
      []
    ),
    createDialogueNode('combat', '*The Shadow Lord raises its blade, shadows swirling around it!*', []),
  ],
};

/**
 * All NPCs organized by ID
 */
export const NPCS: Record<string, NPC> = {
  'village-guard': villageGuard,
  'merchant': merchant,
  'mayor': mayor,
  'town-clerk': townClerk,
  'shopkeeper': shopkeeper,
  'bartender': bartender,
  'mysterious-stranger': mysteriousStranger,
  'hermit': hermit,
  'ruins-guardian': ruinsGuardian,
  'skeleton-warrior': skeletonWarrior,
  'dungeon-boss': dungeonBoss,
};

/**
 * Get NPC by ID
 */
export function getNPC(npcId: string): NPC | undefined {
  return NPCS[npcId];
}

/**
 * Get all NPCs
 */
export function getAllNPCs(): NPC[] {
  return Object.values(NPCS);
}

/**
 * Get dialogue node by ID from NPC
 */
export function getDialogueNode(npc: NPC, nodeId: string): DialogueNode | undefined {
  return npc.dialogue.find(node => node.id === nodeId);
}

/**
 * Get the starting dialogue node for an NPC (usually 'greeting' or 'encounter')
 */
export function getStartingDialogue(npc: NPC): DialogueNode | undefined {
  return npc.dialogue.find(node => node.id === 'greeting' || node.id === 'encounter' || node.id === 'combat');
}

/**
 * Check if NPC is hostile
 */
export function isHostile(npc: NPC): boolean {
  return npc.hostile;
}

/**
 * Create a copy of all NPCs for a new game
 */
export function initializeNPCs(): Record<string, NPC> {
  const npcs: Record<string, NPC> = {};

  Object.entries(NPCS).forEach(([id, npc]) => {
    npcs[id] = {
      ...npc,
      dialogue: [...npc.dialogue],
      stats: npc.stats ? { ...npc.stats } : undefined,
      shop: npc.shop
        ? {
            ...npc.shop,
            items: [...npc.shop.items],
          }
        : undefined,
    };
  });

  return npcs;
}
