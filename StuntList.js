module.exports = [
	{ min: 1, max: 3, name: "DUCK AND WEAVE",             type:"Combat", desc: "Gain +1 to Defense per SP spent until the beginning of your next turn."                                                                                                                                                                                                                                                                 },
	{ min: 1, max: 6, name: "SKIRMISH",                   type:"Combat", desc: "Move yourself or your attack’s target 2 meters in any direction for each 1 SP you spend; you can choose Skirmish more than once per turn."                                                                                                                                                                                              },
	{ min: 2, max: 2, name: "DOUBLE-TEAM",                type:"Combat", desc: "Choose one ally to make an immediate attack on your target, who must be within range and sight of the ally. Your ally must have a ranged weapon to attack at range."                                                                                                                                                                    },
	{ min: 2, max: 2, name: "KNOCK PRONE",                type:"Combat", desc: "Knock your enemy Prone. Melee attacks against a Prone foe gain a +1, but ranged attacks against a Prone foe sufer a -1."                                                                                                                                                                                                                },
	{ min: 2, max: 2, name: "TAUNT",                      type:"Combat", desc: "Roll Communication (Deception) vs. Willpower (Self-Discipline) against any target within 10 meters of you; if you win, they must attack or oppose you in some way on their next turn."                                                                                                                                                  },
	{ min: 2, max: 2, name: "2 VICIOUS BLOW",             type:"Combat", desc: "Inflict an extra 1d6 damage on this attack."                                                                                                                                                                                                                                                                                            },
	{ min: 3, max: 3, name: "BLOCKADE",                   type:"Combat", desc: "Move up to 3 meters to position yourself between a foe and something or someone else. Until the beginning of your next turn, that foe must succeed at a minor action Dexterity (Acrobatics) or Strength (Might) test vs. your Defense to reach whatever or whoever you’re protecting."                                                  },
	{ min: 3, max: 3, name: "LIGHTNING ATTACK",           type:"Combat", desc: "Make a second attack against the same target or a diferent one within range and sight; you must have a ranged weapon to attack at range."                                                                                                                                                                                               },
	{ min: 3, max: 3, name: "SHOCK AND AWE",              type:"Combat", desc: "When you succeed at a non-attack physical feat or take an opponent out, anyone who witnesses it rolls Willpower (Courage) or (Morale) vs. your Strength (Intimidation). If you win, they sufer a -1 to the next opposed roll they make against you, or a -1 to their Defense vs. your next attack against them, whichever comes first." },
	{ min: 4, max: 4, name: "SEIZE THE INITIATIVE",       type:"Combat", desc: "Move to the top of the initiative order until someone else seizes the initiative. You may get to take another turn before some others act again."                                                                                                                                                                                       },

	{ min: 1, max: 3, name: "WHEN A PLAN COMES TOGETHER", type:"Exploration", desc: "You reveal that this test was part of your plan all along, granting a bonus equal to SP spent on one ally’s next test during the same encounter to accomplish the same goal. You must make this decision before the ally rolls."                                                                                                   },
	{ min: 2, max: 2, name: "SPEED DEMON",                type:"Exploration", desc: "You complete your test in half the time it would otherwise take."                                                                                                                                                                                                                                                                  },
	{ min: 3, max: 3, name: "THE UPPER HAND",             type:"Exploration", desc: "If your success leads to combat within a moment or two, you receive a +3 on your initiative roll."                                                                                                                                                                                                                                 },
	{ min: 4, max: 4, name: "WITH A FLOURISH",            type:"Exploration", desc: "You impress everyone who watches you with your showmanship. Gain a +1 to opposed tests against them for the rest of the encounter."                                                                                                                                                                                                },

	{ min: 1, max: 3, name: "IMPRESS",                    type:"Social", desc: "Gain a +1 per SP spent to your next social test against the same target as this test during this encounter."                                                                                                                                                                                                                            },
	{ min: 2, max: 2, name: "AND ANOTHER THING",          type:"Social", desc: "Make a second, related test as part of your action, before anyone else has a chance to respond or make any tests of their own."                                                                                                                                                                                                         },
	{ min: 2, max: 2, name: "HIDDEN MESSAGE",             type:"Social", desc: "Your words convey a diferent message to one person than to everyone else who hears them; the character you choose is the only one who can decipher your true meaning."                                                                                                                                                                  },
	{ min: 3, max: 3, name: "OBJECTION!",                 type:"Social", desc: "You step in on someone else’s behalf. Another character in the scene may use your ability + focus instead of their own next time they oppose a test during this encounter."                                                                                                                                                             },
	{ min: 4, max: 4, name: "CLASS CLOWN",                type:"Social", desc: "Your words lighten the mood, imposing a –2 penalty to all enemies’ initiative rolls if a fight breaks out during this encounter"                                                                                                                                                                                                        }
]
