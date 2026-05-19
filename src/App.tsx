import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Lang, LangContext, detectInitialLang, saveLang, useLang, L, t, tx,
         teamCity, teamName, teamFull, TEAM_LOCAL, COACHES_BILINGUAL,
         NAME_FIRST_EN, NAME_LAST_EN, TEAMMATE_FIRST_EN, TEAMMATE_LAST_EN,
         COMMENTARY_EN, NEGOTIATE_ACCEPT_EN, NEGOTIATE_REJECT_EN } from "./i18n";

// ── Constants ─────────────────────────────────────────────────────────────────
const POSITIONS = ["PG","SG","SF","PF","C"];
const PRESET_ARCHETYPES = {
  PG:["闪电控卫","组织大师","得分型控卫"],
  SG:["纯射手","得分机器","双向护卫"],
  SF:["锋线全能","3D小前","持球突破手"],
  PF:["拉开空间大前","内外线兼备","硬汉蓝领"],
  C:["统治禁区","现代中锋","防守专家"],
};
const ALL_TEAMS = [
  // West
  {name:"掘金",city:"丹佛",abbr:"DEN",color:"#0E2240",accent:"#FEC524",conf:"West"},
  {name:"勇士",city:"金州",abbr:"GSW",color:"#1D428A",accent:"#FFC72C",conf:"West"},
  {name:"独行侠",city:"达拉斯",abbr:"DAL",color:"#00538C",accent:"#B8C4CA",conf:"West"},
  {name:"森林狼",city:"明尼苏达",abbr:"MIN",color:"#0C2340",accent:"#236192",conf:"West"},
  {name:"湖人",city:"洛杉矶",abbr:"LAL",color:"#552583",accent:"#FDB927",conf:"West"},
  {name:"火箭",city:"休斯顿",abbr:"HOU",color:"#CE1141",accent:"#C4CED4",conf:"West"},
  {name:"雷霆",city:"俄克拉荷马",abbr:"OKC",color:"#007AC1",accent:"#EF3B24",conf:"West"},
  {name:"快船",city:"洛杉矶",abbr:"LAC",color:"#C8102E",accent:"#1D428A",conf:"West"},
  {name:"马刺",city:"圣安东尼奥",abbr:"SAS",color:"#C4CED4",accent:"#000000",conf:"West"},
  {name:"开拓者",city:"波特兰",abbr:"POR",color:"#E03A3E",accent:"#000000",conf:"West"},
  {name:"太阳",city:"菲尼克斯",abbr:"PHX",color:"#1D1160",accent:"#E56020",conf:"West"},
  {name:"灰熊",city:"孟菲斯",abbr:"MEM",color:"#5D76A9",accent:"#12173F",conf:"West"},
  {name:"爵士",city:"犹他",abbr:"UTA",color:"#002B5C",accent:"#00471B",conf:"West"},
  {name:"国王",city:"萨克拉门托",abbr:"SAC",color:"#5A2D81",accent:"#63727A",conf:"West"},
  {name:"鹈鹕",city:"新奥尔良",abbr:"NOP",color:"#0C2340",accent:"#C8102E",conf:"West"},
  // East
  {name:"凯尔特人",city:"波士顿",abbr:"BOS",color:"#007A33",accent:"#BA9653",conf:"East"},
  {name:"雄鹿",city:"密尔沃基",abbr:"MIL",color:"#00471B",accent:"#EEE1C6",conf:"East"},
  {name:"热火",city:"迈阿密",abbr:"MIA",color:"#98002E",accent:"#F9A01B",conf:"East"},
  {name:"76人",city:"费城",abbr:"PHI",color:"#003087",accent:"#ED174C",conf:"East"},
  {name:"骑士",city:"克利夫兰",abbr:"CLE",color:"#860038",accent:"#FDBB30",conf:"East"},
  {name:"老鹰",city:"亚特兰大",abbr:"ATL",color:"#E03A3E",accent:"#C1D32F",conf:"East"},
  {name:"尼克斯",city:"纽约",abbr:"NYK",color:"#006BB6",accent:"#F58426",conf:"East"},
  {name:"步行者",city:"印第安纳",abbr:"IND",color:"#002D62",accent:"#FDBB30",conf:"East"},
  {name:"魔术",city:"奥兰多",abbr:"ORL",color:"#0077C0",accent:"#C4CED4",conf:"East"},
  {name:"篮网",city:"布鲁克林",abbr:"BKN",color:"#222",accent:"#ccc",conf:"East"},
  {name:"活塞",city:"底特律",abbr:"DET",color:"#C8102E",accent:"#1D428A",conf:"East"},
  {name:"黄蜂",city:"夏洛特",abbr:"CHA",color:"#1D1160",accent:"#00788C",conf:"East"},
  {name:"猛龙",city:"多伦多",abbr:"TOR",color:"#CE1141",accent:"#A1A1A4",conf:"East"},
  {name:"公牛",city:"芝加哥",abbr:"CHI",color:"#CE1141",accent:"#FFAAAA",conf:"East"},
  {name:"奇才",city:"华盛顿",abbr:"WAS",color:"#002B5C",accent:"#E31837",conf:"East"},
];
const STAT_LABELS = {speed:"速度",shooting:"投篮",passing:"传球",defense:"防守",strength:"体能",iq:"篮球IQ"};
const TRAINING_OPTIONS = [
  {id:"speed",label:"速度训练",stat:"speed",desc:"爆发力与移动速度",icon:"⚡"},
  {id:"shooting",label:"投篮特训",stat:"shooting",desc:"出手弧度与命中率",icon:"🏀"},
  {id:"passing",label:"传球训练",stat:"passing",desc:"视野与传球精准",icon:"👁"},
  {id:"defense",label:"防守训练",stat:"defense",desc:"步伐、预判与对抗",icon:"🛡"},
  {id:"strength",label:"体能训练",stat:"strength",desc:"力量、耐力与对抗",icon:"💪"},
  {id:"iq",label:"战术学习",stat:"iq",desc:"录像研究与战术理解",icon:"🧠"},
];
// D1: 改为按天数康复（一场 ≈ 2.5 天）。休赛期/季后赛间隙也能自然恢复。
const INJURY_TYPES = [
  {name:"踝关节扭伤", minDays:8, maxDays:20, stats:["speed"], severity:"轻伤"},
  {name:"膝盖韧带拉伤", minDays:30, maxDays:75, stats:["speed","strength"], severity:"重伤"},
  {name:"肌肉拉伤", minDays:10, maxDays:30, stats:["strength"], severity:"轻伤"},
  {name:"手指骨折", minDays:15, maxDays:45, stats:["shooting","passing"], severity:"中伤"},
  {name:"背部痉挛", minDays:8, maxDays:20, stats:["strength","defense"], severity:"轻伤"},
  {name:"跟腱撕裂", minDays:100, maxDays:150, stats:["speed","strength"], severity:"赛季报销"},
];
const BRANDS = [
  {name:"Nike",type:"球鞋",baseOffer:5,icon:"👟"},
  {name:"Adidas",type:"球鞋",baseOffer:4,icon:"👟"},
  {name:"Gatorade",type:"饮料",baseOffer:2,icon:"🧃"},
  {name:"McDonald's",type:"快餐",baseOffer:1.5,icon:"🍔"},
  {name:"State Farm",type:"保险",baseOffer:1,icon:"🏠"},
  {name:"NBA 2K",type:"游戏",baseOffer:0.8,icon:"🎮"},
  {name:"苹果",type:"科技",baseOffer:3,icon:"📱"},
];
const PERSON_TYPES = [
  {key:"coach",label:"主教练",icon:"📋"},
  {key:"gm",label:"总经理",icon:"💼"},
  {key:"owner",label:"老板",icon:"👑"},
  {key:"star",label:"球队核心",icon:"⭐"},
  {key:"teammate",label:"更衣室",icon:"🤝"},
];
const HEIGHTS_BY_POS = {
  PG:[[178,196]],SG:[[185,200]],SF:[[196,208]],PF:[[200,213]],C:[[206,221]]
};
const WINGSPANS_DELTA = [-3,-2,-1,0,1,2,3,4,5,6,7,8,10,12];
const WEIGHTS_BY_POS = {PG:[75,95],SG:[82,100],SF:[95,112],PF:[104,118],C:[109,127]};
const STATIC_TRAITS_POOL = ["弹跳精英","长臂怪物","低重心","宽肩膀","大手掌","超长臂展","爆发型体格","灵活脚步"];
const DYNAMIC_TRAITS_POOL = ["后撤步大师","挡拆高手","抢断嗅觉","急停跳投","无球跑位","欧步专家","封盖时机","三分手感"];
const STORAGE_KEY = "nba_career_v7";

// ── Personal Assets ───────────────────────────────────────────────────────────
const CARS = [
  {id:"economy",name:"丰田凯美瑞",price:0.03,icon:"🚗",desc:"省油耐用"},
  {id:"luxury",name:"奔驰S级",price:0.15,icon:"🚘",desc:"豪华座驾"},
  {id:"super",name:"兰博基尼 Urus",price:0.45,icon:"🏎",desc:"超跑SUV"},
  {id:"hyper",name:"迈凯伦 720S",price:0.85,icon:"🏎",desc:"纯种赛车"},
];
const HOUSES = [
  {id:"apartment",name:"公寓",price:0.5,icon:"🏠",desc:"市中心一居室"},
  {id:"condo",name:"豪华公寓",price:1.2,icon:"🏢",desc:"顶层复式"},
  {id:"house",name:"独栋别墅",price:2.5,icon:"🏡",desc:"郊区四居室"},
  {id:"mansion",name:"豪宅",price:6.0,icon:"🏰",desc:"私人游泳池"},
];
const RENT_OPTIONS = [
  {id:"studio",name:"单间公寓",monthly:0.003,icon:"🛏",desc:"简单够用"},
  {id:"apt",name:"两居室公寓",monthly:0.006,icon:"🏠",desc:"舒适居住"},
  {id:"luxury_apt",name:"豪华公寓",monthly:0.015,icon:"🏢",desc:"市中心景观"},
];

// ── Salary Cap & Negotiation (D-batch-2) ─────────────────────────────────────
// 2024-25 NBA real cap is ~$140M. We use $140M as the league cap.
// Max contract:
//   0-6 years experience: 25% of cap = $35M
//   7-9 years:             30% of cap = $42M
//   10+ years:             35% of cap = $49M
const SALARY_CAP = 140;
function getMaxSalary(season: number): number {
  if(season >= 10) return Math.round(SALARY_CAP * 0.35);
  if(season >= 7) return Math.round(SALARY_CAP * 0.30);
  return Math.round(SALARY_CAP * 0.25);
}
// Reject lines used during negotiation
// Reject/accept lines used during negotiation — picked per current language at runtime.
const NEGOTIATE_REJECT_ZH = [
  "球队管理层摇头：「这超出了我们的预算」。",
  "GM 直接拒绝：「我们没有那么多薪资空间」。",
  "老板冷冷地说：「这个数字不可能」。",
  "球队顾问皱起眉头：「我们需要重新考虑」。",
  "对方报价员沉默良久：「请你再考虑一下我们原本的报价」。",
  "GM 拒绝后撂下一句：「我们会去看别的选项」。",
];
const NEGOTIATE_ACCEPT_ZH = [
  "球队管理层经过短暂讨论后点头同意。",
  "GM 笑着说：「成交，期待你为我们效力」。",
  "老板亲自打来电话表达了欢迎。",
  "经纪人确认：合同条款已敲定。",
];
function negotiate(currentSalary: number, increase: number, isHome: boolean, ovr: number, maxAllowed: number, lang: Lang = "zh"): { accepted: boolean; line: string; newSalary: number } {
  const ACCEPT = lang === "en" ? NEGOTIATE_ACCEPT_EN : NEGOTIATE_ACCEPT_ZH;
  const REJECT = lang === "en" ? NEGOTIATE_REJECT_EN : NEGOTIATE_REJECT_ZH;
  const newSalary = +(currentSalary + increase).toFixed(1);
  if(newSalary > maxAllowed) {
    return { accepted: false, line: t("neg.over_max", lang, {max: maxAllowed}), newSalary: currentSalary };
  }
  const pct = increase / Math.max(1, currentSalary);
  let acceptP = 0.95;
  if(pct < 0.1) acceptP = 0.92;
  else if(pct < 0.2) acceptP = 0.65;
  else if(pct < 0.3) acceptP = 0.32;
  else acceptP = 0.08;
  if(isHome) acceptP += 0.1;
  acceptP += (ovr - 80) / 220;
  acceptP = Math.max(0.05, Math.min(0.97, acceptP));
  const accepted = Math.random() < acceptP;
  return {
    accepted,
    line: accepted ? ACCEPT[Math.floor(Math.random()*ACCEPT.length)] : REJECT[Math.floor(Math.random()*REJECT.length)],
    newSalary: accepted ? newSalary : currentSalary,
  };
}

// ── Trade Pool (D-batch-2) ───────────────────────────────────────────────────
// When player gets traded (active or passive), pick a destination team and
// reset relationships to mid-low values + regenerate teammates.
function pickTradeDestination(currentTeamAbbr: string, ovr: number): any {
  // Stronger players go to better teams (higher color seed = better)
  const candidates = ALL_TEAMS.filter(t => t.abbr !== currentTeamAbbr);
  // For now: random — could later weight by team strength
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadSaves() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch(e) { return {}; } }
function writeSaves(s: any): boolean {
  // D10: quota exceeded → warn user once, return false so caller knows it failed.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return true;
  } catch(e: any) {
    const isQuota = e && (e.name === "QuotaExceededError" || (e.code === 22));
    if(isQuota && !(window as any).__nbaQuotaWarned) {
      (window as any).__nbaQuotaWarned = true;
      alert(t("save.quota_warn", (typeof window!=="undefined" && (window as any).__nbaLang) || "zh"));
    }
    return false;
  }
}
function calcOverall(stats) { return Math.round(Object.values(stats).reduce((a,b)=>a+b,0)/6); }

// Generate simulated standings for all 30 teams (other teams get random records)
function generateLeagueStandings(myTeam, regularGames) {
  const played = regularGames.filter(g=>g.status!=="upcoming");
  const myWins = regularGames.filter(g=>g.status==="won").length;
  const myLosses = played.length - myWins;

  const standings = ALL_TEAMS.map(t => {
    if(t.abbr === myTeam.abbr) {
      return {abbr:t.abbr, name:t.name, city:t.city, color:t.color, accent:t.accent, conf:t.conf,
              wins:myWins, losses:myLosses, gp:played.length, pct: played.length>0 ? myWins/played.length : 0};
    }
    // Simulate other teams' records proportional to games played
    const gp = played.length;
    if(gp === 0) return {abbr:t.abbr, name:t.name, city:t.city, color:t.color, accent:t.accent, conf:t.conf, wins:0, losses:0, gp:0, pct:0};
    // Each team has a base strength 0.35-0.65
    const seed = t.abbr.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const strength = 0.35 + (seed%31)/100;
    const wins = Math.round(gp * strength + (Math.random()-0.5)*3);
    const w = Math.max(0, Math.min(gp, wins));
    return {abbr:t.abbr, name:t.name, city:t.city, color:t.color, accent:t.accent, conf:t.conf,
            wins:w, losses:gp-w, gp, pct:gp>0?w/gp:0};
  });

  const west = standings.filter(t=>t.conf==="West").sort((a,b)=>b.pct-a.pct||b.wins-a.wins);
  const east = standings.filter(t=>t.conf==="East").sort((a,b)=>b.pct-a.pct||b.wins-a.wins);
  return {west, east};
}

// Build proper NBA playoff bracket from standings
// Returns bracket object with series for each round
function buildNBAPlayoffBracket(standings, myTeamAbbr, startYear) {
  // Conf: seeds 1-6 direct, 7-10 play-in
  function buildConfBracket(conf, confName) {
    const direct = conf.slice(0, 6);   // 1-6 direct
    const playIn = conf.slice(6, 10);  // 7-10 play-in

    // Play-in: 7v8, 9v10. Winner of 7v8 → seed7. Loser of 7v8 plays winner of 9v10 → seed8
    const playIn7v8Winner = Math.random() < 0.5 ? playIn[0] : playIn[1];
    const playIn9v10Winner = Math.random() < 0.5 ? playIn[2] : playIn[3];
    const playIn7v8Loser = playIn7v8Winner.abbr===playIn[0].abbr ? playIn[1] : playIn[0];
    const finalSeed8 = Math.random() < 0.5 ? playIn7v8Loser : playIn9v10Winner;

    const seeds = [...direct, playIn7v8Winner, finalSeed8]; // seeds[0]=1st, seeds[7]=8th

    // Matchups: 1v8, 4v5, 3v6, 2v7
    const matchups = [
      [seeds[0], seeds[7]], // 1v8
      [seeds[3], seeds[4]], // 4v5
      [seeds[2], seeds[5]], // 3v6
      [seeds[1], seeds[6]], // 2v7
    ];

    let date = new Date(startYear+1, 3, 20);
    const r1Series = matchups.map(([top, bot], mi) => {
      const isMyMatch = top.abbr===myTeamAbbr||bot.abbr===myTeamAbbr;
      const games = Array(7).fill(null).map((_, gi) => ({
        id:"p_"+confName+"_r1_"+mi+"_"+gi,
        date: new Date(date.getTime()+(mi*3+gi*2)*86400000).toISOString(),
        opp: top.abbr===myTeamAbbr ? bot.abbr : top.abbr,
        home: gi%2===0,
        status:"upcoming", stats:null, game:gi+1
      }));
      return {
        round:"首轮", conf:confName, matchupIdx:mi,
        teamA: top, teamB: bot,
        isMyMatch,
        winsA:0, winsB:0,
        winner:null,
        games
      };
    });

    date = new Date(date.getTime()+18*86400000);
    // R2, R3 placeholder (filled after R1)
    return {conf:confName, seeds, r1:r1Series, r2:[], r3:[], playInResult:{seed7:playIn7v8Winner,seed8:finalSeed8,playIn7:playIn[0],playIn8:playIn[1],playIn9:playIn[2],playIn10:playIn[3]}};
  }

  const westBracket = buildConfBracket(standings.west, "West");
  const eastBracket = buildConfBracket(standings.east, "East");
  return {west:westBracket, east:eastBracket, finals:null, champion:null, startYear};
}

function generatePhysicals(pos) {
  const [hMin, hMax] = HEIGHTS_BY_POS[pos][0];
  const heightCm = hMin + Math.floor(Math.random()*(hMax-hMin+1));
  const wingDelta = WINGSPANS_DELTA[Math.floor(Math.random()*WINGSPANS_DELTA.length)];
  const wingspanCm = heightCm + wingDelta;
  const [wMin, wMax] = WEIGHTS_BY_POS[pos];
  const weightKg = wMin + Math.floor(Math.random()*(wMax-wMin+1));
  const staticTraits = [...STATIC_TRAITS_POOL].sort(()=>Math.random()-0.5).slice(0,2);
  const dynamicTraits = [...DYNAMIC_TRAITS_POOL].sort(()=>Math.random()-0.5).slice(0,3);
  return { heightCm, wingspanCm, wingDelta, weightKg, staticTraits, dynamicTraits };
}

function generatePotential(pos, arc) {
  // Each stat ceiling is independently random: 85-99
  // Overall "talent" influences the distribution but every stat is its own roll
  const a = arc.toLowerCase();

  // Base values by position/archetype — these push certain stats higher
  const b = {speed:0,shooting:0,passing:0,defense:0,strength:0,iq:0};
  if(a.includes("速度")||a.includes("闪电")) b.speed+=6;
  if(a.includes("射手")||a.includes("投篮")) b.shooting+=7;
  if(a.includes("组织")||a.includes("传球")) b.passing+=7;
  if(a.includes("防守")||a.includes("双向")) b.defense+=7;
  if(a.includes("蓝领")||a.includes("体能")) b.strength+=6;
  if(a.includes("iq")||a.includes("战术"))   b.iq+=6;
  if(a.includes("得分"))                     b.shooting+=4;
  if(a.includes("全能"))                     { Object.keys(b).forEach(k=>b[k]+=3); }
  if(pos==="PG") { b.passing+=5; b.speed+=4; b.iq+=3; }
  if(pos==="SG") { b.shooting+=5; b.speed+=2; }
  if(pos==="SF") { b.speed+=3; b.shooting+=3; b.defense+=2; }
  if(pos==="PF") { b.strength+=5; b.defense+=4; }
  if(pos==="C")  { b.strength+=8; b.defense+=6; b.speed-=5; b.passing-=3; }

  const c = {};
  Object.keys(b).forEach(k => {
    // Base floor 85, archetype/position bonus added, then random 0-14 on top
    // This gives true 85-99 range with archetype skewing higher in relevant stats
    // B7: preserve negative position bonus (C 的 speed b[k] = -5 → base = 80).
    // Floor at 70 so no stat can drop below a "minimum NBA caliber" ceiling.
    const base = Math.max(70, 85 + b[k]);
    const roll = Math.floor(Math.random() * (100 - base + 1));
    c[k] = Math.min(99, base + roll);
  });
  return c;
}

function generateInitialStats(pos: string, ceiling: any, ageBoost: number = 0) {
  const s: any = {};
  Object.keys(ceiling).forEach(k => {
    const r = 0.52 + Math.random()*0.22 + ageBoost;
    s[k] = Math.max(38, Math.min(ceiling[k], Math.round(ceiling[k]*r)));
  });
  if(pos==="C") s.speed = Math.min(s.speed, 62);
  return s;
}

function generateRegularSeason(myTeam, startYear) {
  const opponents = ALL_TEAMS.filter(t=>t.abbr!==myTeam.abbr);
  const games = [];
  let date = new Date(startYear, 9, 22);
  let count = 0;
  // B6: guarantee 82 games — old code had a `date > April 13` break that
  // cut ~5% of seasons short due to random gap variance.
  while(count < 82) {
    const gap = Math.random()<0.4 ? 1 : Math.random()<0.6 ? 2 : 3;
    date = new Date(date.getTime()+gap*86400000);
    const opp = opponents[count % opponents.length];
    games.push({id:"r_"+startYear+"_"+count, date:date.toISOString(), opp:opp.abbr, home:Math.random()>0.5, status:"upcoming", stats:null});
    count++;
  }
  return games;
}

// generatePlayoffBracket is replaced by buildNBAPlayoffBracket above
// This wrapper is kept for backward compat during load
function generatePlayoffBracket(myTeam, startYear, standingsData) {
  const st = standingsData || generateLeagueStandings(myTeam, []);
  return buildNBAPlayoffBracket(st, myTeam.abbr, startYear);
}

function fmtDate(iso) { const d=new Date(iso); return (d.getMonth()+1)+"月"+d.getDate()+"日"; }
function fmtMonthLabel(y, m) { const mons=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]; return y+"年 "+mons[m]; }

// ── Content Pools (added by audit-fix v2) ────────────────────────────────────
const NAME_FIRST = ["勒布朗","凯文","斯蒂芬","詹姆斯","卡梅隆","克里斯","德里克","安东尼","保罗","卢卡","贾马尔","马库斯","特雷","扬尼斯","尼古拉","乔尔","达米安","贾森","戴米恩","达伦","布兰登","肖恩","塞德里克","特里","约翰","迈尔斯","贾莱特","特里斯坦","布雷克","扎克","克莱","贾韦尔","艾伦","德安东尼","奥斯卡","文森特","内特","雷吉","奥利弗","肯尼","坦纳","谢恩","塔伊森","贾德","阿尔文","布拉德","特雷弗","罗恩","伊曼","泰勒"];
const NAME_LAST = ["詹姆斯","杜兰特","库里","哈登","莱昂纳德","保罗","罗斯","戴维斯","艾弗森","邓肯","诺维茨基","纳什","麦迪","皮尔斯","加索尔","安东尼","霍华德","布泽尔","罗伊","阿尔德里奇","约翰逊","史密斯","布朗","威廉斯","米勒","摩尔","马丁","汤普森","安德森","托马斯","杰克逊","罗宾逊","克拉克","刘易斯","沃克","霍尔","艾伦","扬","卡特","考尔","福斯特","米切尔","亚当斯","海伍德","欧文","阿德","纳尔逊","马尔金","奥沙利文","贝克"];
function buildNamePool(lang: Lang = "zh") {
  const first = lang === "en" ? NAME_FIRST_EN : NAME_FIRST;
  const last  = lang === "en" ? NAME_LAST_EN  : NAME_LAST;
  const sep   = lang === "en" ? " " : "·";
  const out: string[] = [];
  for(let i=0; i<first.length; i++)
    for(let j=0; j<last.length; j++)
      out.push(first[i] + sep + last[j]);
  for(let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}
function fmtPlayer(p: any) { return p.name + " (" + p.teamAbbr + ")"; }  // teamAbbr is locale-agnostic (e.g. LAL)
function pickRandom(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function fillTemplate(tpl: string, vars: any) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? String(vars[k]) : m);
}
function generateLeagueStars(namePool: string[]) {
  return ALL_TEAMS.map((t, i) => {
    const seed = t.abbr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const baseOvr = 72 + (seed % 16);
    return { name: namePool[i] || "Unknown", teamAbbr: t.abbr, ovr: baseOvr + Math.floor(Math.random() * 8), isRookie: false };
  });
}
function generateRookies(namePool: string[], startIdx: number) {
  return Array(20).fill(null).map((_, i) => {
    const t = ALL_TEAMS[Math.floor(Math.random() * ALL_TEAMS.length)];
    return { name: namePool[startIdx + i] || ("新秀" + i), teamAbbr: t.abbr, ovr: 70 + Math.floor(Math.random() * 14), isRookie: true };
  });
}
function calcFinalsAvg(bracket: any, myTeamAbbr: string) {
  if(!bracket || !bracket.finals) return null;
  const f = bracket.finals;
  const isMyMatch = f.teamA.abbr === myTeamAbbr || f.teamB.abbr === myTeamAbbr;
  if(!isMyMatch) return null;
  const played = f.games.filter((g: any) => g.status !== "upcoming" && g.stats && !g.stats.rested);
  if(played.length === 0) return null;
  const t = played.reduce((a: any, g: any) => ({ pts: a.pts + g.stats.pts, ast: a.ast + g.stats.ast, reb: a.reb + g.stats.reb }), { pts: 0, ast: 0, reb: 0 });
  return { gamesPlayed: played.length, avgPts: t.pts / played.length, avgAst: t.ast / played.length, avgReb: t.reb / played.length };
}

const COMMENTARY: any = {
  draft: [
    "灯光聚焦在那一刻，专员走上台——这个名字，从今天起将属于NBA！",
    "现场掌声雷动，这位新秀终于等到了属于他的时刻，职业生涯正式开启！",
    "多少年的汗水与努力，在这一声宣布中化为现实，梦想照进现实！",
    "选秀大厅沸腾了，这位新秀带着渴望走上舞台，迎接他崭新的旅程！",
    "这是每个篮球少年的梦想——被NBA选中的那一刻，时间仿佛静止了。",
    "镜头给到家人，泪光闪烁——这一刻，所有的牺牲都值了。",
    "经纪人激动地拥抱了他，那一刻他知道，自己真的做到了。",
    "解说员的声音穿透整个大厅：「这是一个未来之星诞生的瞬间！」",
    "他深吸一口气，戴上球队帽子，从此与这支队伍命运相连。",
    "球探报告早就盛传他的天赋，今天，终于到了兑现的时候。",
    "看台上家乡的旗帜挥舞着，这是属于他家乡的荣光。",
    "无数球迷在屏幕前屏住呼吸——这个顺位，意味着球队的未来。",
    "他握紧拳头，朝家人方向点头致意。十年的努力，今夜兑现。",
    "现场记者蜂拥而上，闪光灯织成一片白色海洋。",
    "他穿过欢呼的人群走向舞台，脚步坚定，眼神发光。",
  ],
  winGeneric: [
    "{pts}分{ast}助攻{reb}篮板，全面的表现带队拿下！今晚他就是球场上最亮的那颗星。",
    "关键时刻挺身而出，{pts}分的表现振奋人心，这场胜利来得及时！",
    "场上的每一次突破、每一次分球都恰到好处。{pts}分{ast}助，今晚无可挑剔。",
    "球迷的呐喊在他每次出手时达到顶峰，{pts}分收官，漂亮！",
    "一攻一防都交出了满意答卷，{pts}分是对努力最好的回报，球队士气大振！",
    "半场打得有些挣扎，但下半场彻底爆发，{pts}分逆转了颓势，这才是真正的球星气质！",
    "对手的针对性防守完全失效，{pts}分的输出说明他已经进入了状态。",
    "末节关键球他站了出来，{pts}分的最后一分至关重要。",
    "节奏完全在他手中，{pts}分{ast}助看上去举重若轻。",
    "全场都在喊他的名字，{pts}分配上{reb}个篮板，这是统治级表现。",
    "今晚他用脚步征服了对手，{pts}分外加多次造犯规。",
    "球队的领袖气质完全展现——{pts}分、{ast}次助攻、{reb}个篮板。",
    "队友们在场上拥抱了他，{pts}分的表现配得上这场胜利。",
    "防守端的扑救让对手挫败，进攻端{pts}分让对手绝望。",
    "客场球迷喝倒彩越响，他得分越多——{pts}分的回答简单直接。",
    "教练在场边竖起大拇指，{pts}分的发挥让全队跟着兴奋。",
    "对手赛后采访只能摇头：「他今晚不可阻挡。」{pts}分说明一切。",
    "比赛被他打成了表演秀，{pts}分{ast}助，这就是球星的标准模板。",
  ],
  lossGeneric: [
    "{pts}分{reb}篮板的个人数据说得过去，但球队整体状态欠佳，这场失利需要好好复盘。",
    "今晚运气不站他这边，几次关键出手铁了，{pts}分没能帮助球队翻盘。",
    "输球总是痛苦的，{pts}分的贡献有目共睹，但团队配合还需磨合。",
    "进攻端今晚遭遇顽强防守，{pts}分是在重重压迫下打出来的，下一场调整策略。",
    "差一口气，{pts}分和{ast}助攻没能换来胜利，但过程中的拼劲让人动容。",
    "对手今晚状态太火热，{pts}分的努力被对方更稳的发挥压住。",
    "末节心态有些急，几次仓促出手让分差越拉越大，最终{pts}分。",
    "板凳出场缺乏火力支援，主力扛着比赛打到最后，{pts}分独木难支。",
    "裁判的几个争议判罚影响了节奏，{pts}分背后是隐隐的不甘。",
    "客场作战遇到糟糕的氛围，{pts}分已是顽强一战。",
    "{pts}分但效率不高，今晚的手感始终没找回来。",
    "球队失误太多，{pts}分的产出被对方更稳健的进攻抵消。",
    "教练赛后只说了一句：「我们让胜利溜走了。」{pts}分包含太多遗憾。",
    "对手的领袖打疯了，{pts}分对决对方更大的爆发，最终落败。",
    "下半场被对手提速冲垮，{pts}分没能拖住对方的浪潮。",
  ],
  winShooter: [
    "手感火热，{pts}分全靠准绝！连续几个三分球命中，把比赛直接打成了单方面屠杀。",
    "「今晚手感来了」——他赛后平静地说。{pts}分的三分大秀让全场沸腾，对手毫无还手之力。",
    "他的三分像下雨一样，{pts}分中至少一半是空切接球三分。",
    "对手包夹也防不住，{pts}分诠释了什么叫顶级射手的统治力。",
    "底角、弧顶、超远——{pts}分覆盖了所有射程，对方教练叫了两个暂停都没用。",
    "{pts}分里有 5 记三分，节奏感无人能挡。",
    "防守人换了一茬又一茬，{pts}分照拿不误。",
  ],
  lossShooter: [
    "今晚手感不顺，{pts}分来得很艰难，但仍然是队内最高分，下一场重新校准节奏。",
    "三分球今晚铁框了，{pts}分大多靠突破撕开来的，但整体效率偏低。",
    "对手专门派了大个子贴他，{pts}分的出手次数远多于平时，命中率打折。",
    "射手的低潮期来了，{pts}分背后是连续几个错失的关键三分。",
  ],
  winPG: [
    "{ast}次助攻串联起整个进攻体系，{pts}分只是附带品，今晚他是真正的球场指挥官！",
    "阅读比赛的眼光无与伦比！{ast}助{pts}分，每一次传球都像是预判了三步之后的走势。",
    "无球跑动、挡拆掩护、空切传球——他像总教练在场上下棋，{ast}次助攻。",
    "{ast}助让队友的得分变得轻松，自己再补{pts}分，完美的控卫之夜。",
    "对手主防被他玩弄于鼓掌之中，{ast}次助攻里至少一半是空位大空篮。",
    "他像主控大师在指挥乐队，{pts}分{ast}助让全队进入流畅模式。",
    "{ast}次助攻里有几个想象力极强的传球，让看台上球迷连连惊呼。",
  ],
  lossPG: [
    "组织端今晚有些失误，不过{ast}次助攻和{pts}分的贡献仍然可圈可点，系列赛还长着呢。",
    "对方专盯他持球，{ast}助攻打了八折，{pts}分也没能拯救球队。",
    "节奏被对手破坏，{ast}次助攻里几次失误被反击得分。",
    "今晚的执行有问题，{pts}分{ast}助没能转化为胜利，需要赛后开会复盘。",
  ],
  winDefender: [
    "防守端的统治力让对手头疼不已，加上{pts}分的贡献，今晚是完整的双向表演！",
    "他的防守压力让对方核心球员投不进，{pts}分是攻防一体的代表作。",
    "对手核心被他锁死，{pts}分是顺势打出的——这就是双向球员的价值。",
    "锁防、抢断、补防——他像章鱼一样无处不在，{pts}分只是顺带的奖励。",
    "他的扑救改变了几个关键回合，{pts}分背后是更多场外效益。",
  ],
  lossDefender: [
    "虽然败了，但防守端的努力有目共睹，下次进攻端需要更多支撑。",
    "他防住了对方核心，但队友进攻端发挥不佳，{pts}分独木难支。",
    "防守的拼劲不缺，可惜进攻端{pts}分不足以撕开对方防线。",
  ],
  poffWin: [
    "季后赛的舞台让他越战越勇！{pts}分{ast}助攻的统治级表现，直接封锁了对手的反击希望。",
    "这就是大心脏！关键时刻他一次次站出来，{pts}分{reb}篮板，率队挺进下一轮！",
    "系列赛的气势完全在我方！{pts}分的爆发表现让对手教练组面面相觑，换谁都防不住。",
    "客场嘘声越响，他打得越来劲——{pts}分的回答只有「绝杀」二字。",
    "末节他独取大段，{pts}分背后是这场系列赛的胜负手。",
    "他在抢七的舞台上交出{pts}分，从此「大心脏」标签彻底坐实。",
    "对手教练叫暂停时面色铁青，{pts}分的得分手段让他无解。",
    "季后赛升级版本的他出现了——{pts}分{ast}助打出常规赛+30% 的状态。",
    "队友赛后采访：「我们都知道关键球该给谁。」{pts}分回答了一切。",
    "全场起立鼓掌，{pts}分的最后一记得分仿佛把整个球馆点燃。",
    "防守端他也打满全场，{pts}分配上多次造犯规和封盖。",
    "媒体已经开始讨论 FMVP——{pts}分{ast}助是他的入场券。",
  ],
  poffLoss: [
    "季后赛就是残酷，{pts}分{ast}助攻虽然拼尽全力，但球队整体表现差强人意，系列赛悬念犹存。",
    "这场失利很痛，他的{pts}分在队内最高，但孤掌难鸣，下一场必须找回状态。",
    "季后赛不相信眼泪，{pts}分没能换来胜利，休息室里一片沉默，重新出发。",
    "对方核心打疯了，{pts}分没能压住对方的火力。",
    "几次关键失误让分差被拉开，{pts}分背后是整场的不顺。",
    "客场被对方主场气势吞噬，{pts}分孤独地诠释了「英雄末路」。",
    "末节心态崩了，{pts}分里包含太多无奈的强投。",
    "对方防守端针对性研究，{pts}分是他在重压下挤出来的。",
    "教练采访只说：「我们没准备好。」{pts}分照样心痛。",
  ],
  relGood: [
    "更衣室里气氛融洽，训练结束后大家常常一起留下投篮，这种默契是球队凝聚力的来源。",
    "双方关系建立在相互尊重上，每次战术会议都能坦诚交流，这在联盟里并不多见。",
    "有几次深夜训练后，两人在球馆门口聊了很久，那种惺惺相惜的感觉让人难忘。",
    "媒体见面会上彼此相视一笑，这种默契不是装出来的。",
    "私下也常约一起打高尔夫，关系超越了职业范畴。",
    "客场遇到难题时，两人总能站到一起，这种支持很难得。",
    "训练馆里他们常常是最后离开的两个人。",
    "采访里他多次公开表达对对方的感谢，这种关系在 NBA 是稀缺品。",
  ],
  relBad: [
    "更衣室里的气氛最近有些沉重，双方的分歧在一场失利后彻底爆发，私下已经几乎不说话。",
    "管理层对目前的状态并不满意，有消息说他们已经在悄悄接触其他球队，交易的风声越来越近。",
    "两人的关系说不上好也说不上坏，职业态度维持着表面的平静，但深层的分歧始终存在。",
    "更衣室里几次摔战术板的争吵让所有人都很尴尬。",
    "公开场合两人客气，私下几乎不再交流，气氛冷到冰点。",
    "媒体捕捉到了几个意味深长的眼神，关于裂痕的猜测开始发酵。",
    "训练时分开练投篮已经成为习惯，谁也不主动开口。",
    "经纪人最近频繁约见其他球队，所有人都心知肚明。",
  ],
  relNeutral: [
    "职业关系，互相尊重，保持着应有的距离和信任。",
    "彼此都是专业人士，把工作做好就是最大的尊重。",
    "公开场合礼貌客气，私下交流不多，但也没什么矛盾。",
    "保持着 NBA 圈里典型的同事关系，不远不近。",
  ],
  trade: [
    "消息在更衣室迅速传开——他递交了交易申请。管理层表情凝重，而队友们则各有心思，这个赛季注定不平静。",
    "经纪人确认了这个消息：交易申请已经正式提交。电话那头沉默了很久，最终只说了一句：「我们会认真考虑」。",
    "这个决定震动了整个球队，媒体蜂拥而至，关于下家的猜测铺天盖地，而他只是平静地出现在训练场上。",
    "他在赛前更衣室宣布了这个决定，队友们的表情五味杂陈。",
    "管理层连夜召开紧急会议，关于他的未来，所有人都没了底。",
    "ESPN 头条标题已经挂上：「明星球员要求交易，下一站会是哪里？」",
    "他在自传发布会上提到了这件事，记者们瞬间都从座位上跳了起来。",
    "球迷请愿书已经堆成山——他们不希望他走，但决定权在他和管理层手里。",
  ],
  injuredPrefix: [
    "带伤坚持出战，精神可嘉！",
    "膝盖明显有问题但他没下场，",
    "拉着绷带打满了关键时段，",
    "队医都建议下场但他拒绝了，",
    "强忍着不适完成了比赛，",
  ],
};
// ── End Content Pools ────────────────────────────────────────────────────────

async function aiCall(prompt: string, lang: Lang = "zh"): Promise<string> {
  // No external API — synthesize from local COMMENTARY pools (zh or en).
  return new Promise(resolve => setTimeout(() => resolve(localCommentary(prompt, lang)), 200));
}
function localCommentary(prompt: string, lang: Lang = "zh"): string {
  const p = prompt || "";
  const COMM: any = lang === "en" ? COMMENTARY_EN : COMMENTARY;
  if(p.includes("选秀") || p.toLowerCase().includes("draft")) return pickRandom(COMM.draft);
  if(p.includes("关系") || p.includes("主教练") || p.includes("总经理") || p.includes("老板") || p.includes("更衣室")) {
    if(p.includes("融洽")) return pickRandom(COMM.relGood);
    if(p.includes("紧张")) return pickRandom(COMM.relBad);
    return pickRandom(COMM.relNeutral);
  }
  if(p.includes("申请交易")) return pickRandom(COMM.trade);
  const pts = (p.match(/(\d+)分/) || [0, 0])[1];
  const ast = (p.match(/(\d+)助/) || [0, 0])[1];
  const reb = (p.match(/(\d+)篮/) || [0, 0])[1];
  const vars = { pts, ast, reb };
  const isWin = p.includes("胜");
  const isInjured = p.includes("带伤");
  const isPoff = p.includes("季后赛");
  if(isPoff) return fillTemplate(pickRandom(isWin ? COMM.poffWin : COMM.poffLoss), vars);
  let pool: string[] | null = null;
  if(p.includes("射手") || p.includes("投篮")) pool = isWin ? COMM.winShooter : COMM.lossShooter;
  else if(p.includes("控卫") || p.includes("组织")) pool = isWin ? COMM.winPG : COMM.lossPG;
  else if(p.includes("防守") || p.includes("双向")) pool = isWin ? COMM.winDefender : COMM.lossDefender;
  if(pool) return (isInjured ? pickRandom(COMM.injuredPrefix) : "") + fillTemplate(pickRandom(pool), vars);
  const out = fillTemplate(pickRandom(isWin ? COMM.winGeneric : COMM.lossGeneric), vars);
  return (isInjured ? pickRandom(COMM.injuredPrefix) : "") + out;
}

// ── StatBar ───────────────────────────────────────────────────────────────────
function StatBar({label, value, ceiling, max=99, color="#FDB927"}) {
  const cp = ceiling!=null ? Math.min(100,(ceiling/max)*100) : 100;
  const vp = Math.min(100,(value/max)*100);
  return (
    <div style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:3}}>
        <span>{label}</span>
        <span style={{display:"flex",gap:5}}>
          <span style={{color:"#fff",fontWeight:700}}>{value}</span>
          {ceiling!=null && <span style={{color:"#444",fontSize:10}}>/{ceiling}</span>}
        </span>
      </div>
      <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden",position:"relative"}}>
        {ceiling!=null && <div style={{position:"absolute",left:0,top:0,height:"100%",width:cp+"%",background:"#ffffff0d",borderRadius:3}}/>}
        <div style={{height:"100%",width:vp+"%",background:color,borderRadius:3,transition:"width 0.5s"}}/>
      </div>
    </div>
  );
}

// ── i18n toggle button (中 / EN) — used in every screen header ──────────────
function LangToggle({ lang, setLang }: any) {
  return (
    <button onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      title={lang === "zh" ? "Switch to English" : "切换为中文"}
      style={{padding:"5px 10px",background:"rgba(0,0,0,0.3)",border:"1px solid #ffffff33",borderRadius:8,color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"sans-serif",minWidth:42}}>
      {lang === "zh" ? "中/EN" : "EN/中"}
    </button>
  );
}

// ════════════════ SAVES LOBBY ════════════════
function SavesLobby({onLoad, onNew, lang, setLang}: any) {
  const [saves, setSaves] = useState(loadSaves);
  const [del, setDel] = useState(null);
  function doDelete(id) { const s={...saves}; delete s[id]; writeSaves(s); setSaves(s); setDel(null); }
  const list = Object.values(saves).sort((a,b)=>b.savedAt-a.savedAt);
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(180deg,#1a1a2e,#0a0a0f)",padding:"48px 20px 28px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",top:14,right:14}}><LangToggle lang={lang} setLang={setLang}/></div>
        <div style={{fontSize:11,color:"#f9a01b",letterSpacing:5,marginBottom:10}}>{t("app.subtitle", lang)}</div>
        <div style={{fontSize:38,fontWeight:900,letterSpacing:3}}>{t("app.title", lang)}</div>
      </div>
      <div style={{padding:20,maxWidth:460,margin:"0 auto"}}>
        <button onClick={onNew} style={{width:"100%",padding:"18px 0",fontSize:17,fontWeight:700,background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:14,color:"#000",cursor:"pointer",fontFamily:"sans-serif",marginBottom:24}}>+ 新建生涯</button>
        {list.length===0 ? (
          <div style={{textAlign:"center",padding:"40px 0",color:"#444"}}>
            <div style={{fontSize:32,marginBottom:12}}>🏀</div>
            <div>{t("app.no_saves_emoji_caption", lang)}</div>
          </div>
        ) : list.map(sv => {
          const tm = ALL_TEAMS.find(t=>t.abbr===sv.teamAbbr)||ALL_TEAMS[0];
          return (
            <div key={sv.id} style={{background:"#111827",borderRadius:14,marginBottom:12,overflow:"hidden",border:"1px solid #ffffff0d"}}>
              <div style={{background:tm.color,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:15,fontWeight:800,color:tm.accent}}>{sv.playerName}</div>
                <div style={{fontSize:12,color:tm.accent}}>{tm.abbr}</div>
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",gap:12,fontSize:13,marginBottom:8}}>
                  <span style={{color:"#888"}}>{sv.position} · {tx(sv.archetype, lang)}</span>
                  <span style={{color:"#f9a01b"}}>OVR {sv.overall}</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:12,color:"#666",marginBottom:12}}>
                  <span>{t("app.season", lang, {n: sv.season||1})}</span>
                  {sv.age && <span>{t("app.years_old", lang, {n: sv.age})}</span>}
                  <span>{t("app.wins_losses", lang, {w: sv.wins, l: sv.losses})}</span>
                  <span>${sv.salary||2.5}M/年</span>
                  {sv.injured && <span style={{color:"#ff6b6b"}}>{t("app.injured_label", lang)}</span>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>onLoad(sv.id)} style={{flex:1,padding:"10px 0",background:tm.color,border:"none",borderRadius:10,color:tm.accent,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.continue", lang)}</button>
                  {del===sv.id ? (
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>doDelete(sv.id)} style={{padding:"10px 12px",background:"#ff4444",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.confirm_delete", lang)}</button>
                      <button onClick={()=>setDel(null)} style={{padding:"10px 12px",background:"#333",border:"none",borderRadius:10,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.cancel", lang)}</button>
                    </div>
                  ) : (
                    <button onClick={()=>setDel(sv.id)} style={{padding:"10px 12px",background:"#1a1a2e",border:"1px solid #ffffff11",borderRadius:10,color:"#555",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.delete", lang)}</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════ CREATE ════════════════
function CreateScreen({onDone, onBack, lang, setLang}: any) {
  const [name, setName] = useState("");
  const [pos, setPos] = useState("PG");
  const [arc, setArc] = useState("");
  const [custom, setCustom] = useState(false);
  const [ctext, setCtext] = useState("");
  const [age, setAge] = useState(19); // D2: starting age, 18-26 slider
  // D12: customizable physicals — user can tweak height/wingspan/weight, traits stay random
  const [physicals, setPhysicals] = useState(() => generatePhysicals(pos));
  // When position changes, reroll physicals to be in-range
  useEffect(() => { setPhysicals(generatePhysicals(pos)); }, [pos]);
  // Position-derived bounds for sliders
  const heightRange = HEIGHTS_BY_POS[pos][0];
  const weightRange = WEIGHTS_BY_POS[pos];
  const finalArc = custom ? ctext : arc;

  function rerollPhysicals() { setPhysicals(generatePhysicals(pos)); }
  function randomizeName() {
    // i18n: pick from English pool when EN is active
    const pool = lang === "en"
      ? NAME_FIRST_EN.flatMap(f => NAME_LAST_EN.map(l => f + " " + l))
      : buildNamePool();
    setName(pool[Math.floor(Math.random() * pool.length)]);
  }
  function setHeight(v: number) {
    setPhysicals((p: any) => ({...p, heightCm: v, wingspanCm: v + p.wingDelta}));
  }
  function setWingDelta(d: number) {
    setPhysicals((p: any) => ({...p, wingDelta: d, wingspanCm: p.heightCm + d}));
  }
  function setWeight(w: number) {
    setPhysicals((p: any) => ({...p, weightKg: w}));
  }

  function submit() {
    if(!name.trim() || !finalArc.trim()) return;
    const ceiling = generatePotential(pos, finalArc);
    const ageBoost = age >= 23 ? 0.05 : age <= 19 ? -0.03 : 0;
    const stats = generateInitialStats(pos, ceiling, ageBoost);
    onDone({name:name.trim(), position:pos, archetype:finalArc.trim(), stats, ceiling, overall:calcOverall(stats), physicals, age});
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(180deg,#1a1a2e,#0a0a0f)",padding:"32px 20px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"#ffffff11",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>{t("app.back", lang)}</button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:3}}>NEW CAREER</div>
          <div style={{fontSize:24,fontWeight:900}}>{t("create.title", lang)}</div>
        </div>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>
      <div style={{padding:20,maxWidth:440,margin:"0 auto"}}>
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2}}>{t("create.label_name", lang)}</div>
            <button type="button" onClick={randomizeName}
              style={{fontSize:11,color:"#88aaff",background:"transparent",border:"1px solid #88aaff44",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontFamily:"sans-serif"}}>{t("create.random_name", lang)}</button>
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t("create.placeholder_name", lang)}
            style={{width:"100%",padding:"14px 16px",background:"#111827",border:"1px solid #ffffff22",borderRadius:10,color:"#fff",fontSize:16,boxSizing:"border-box",outline:"none",fontFamily:"sans-serif"}}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:8}}>{t("create.label_position", lang)}</div>
          <div style={{display:"flex",gap:8}}>
            {POSITIONS.map(p => (
              <button key={p} onClick={()=>{setPos(p);setArc("");}}
                style={{flex:1,padding:"12px 4px",background:pos===p?"#f9a01b":"#111827",border:"1px solid "+(pos===p?"#f9a01b":"#ffffff22"),color:pos===p?"#000":"#fff",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"sans-serif",fontWeight:700}}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2}}>{t("create.label_archetype", lang)}</div>
            <button onClick={()=>{setCustom(!custom);setArc("");setCtext("");}}
              style={{fontSize:11,color:custom?"#00ff88":"#888",background:"transparent",border:"1px solid "+(custom?"#00ff8844":"#ffffff22"),borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"sans-serif"}}>{custom?t("create.checked_custom", lang):t("create.edit_custom", lang)}</button>
          </div>
          {!custom ? (
            <div>
              {PRESET_ARCHETYPES[pos].map(a => (
                <button key={a} onClick={()=>setArc(a)}
                  style={{width:"100%",padding:"14px 16px",textAlign:"left",marginBottom:8,background:arc===a?"#1a2a1a":"#111827",border:"1px solid "+(arc===a?"#00ff88":"#ffffff22"),color:arc===a?"#00ff88":"#ccc",borderRadius:10,cursor:"pointer",fontSize:15,fontFamily:"sans-serif"}}>{tx(a, lang)}</button>
              ))}
              <button onClick={()=>{setCustom(true);setArc("");}}
                style={{width:"100%",padding:"14px 16px",textAlign:"left",marginBottom:8,background:"#0d1117",border:"1px dashed #ffffff33",color:"#888",borderRadius:10,cursor:"pointer",fontSize:14,fontFamily:"sans-serif"}}>{t("create.other_custom", lang)}</button>
            </div>
          ) : (
            <div>
              <input value={ctext} onChange={e=>setCtext(e.target.value)} placeholder={t("create.custom_placeholder", lang)}
                style={{width:"100%",padding:"14px 16px",background:"#111827",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"sans-serif"}}/>
              <div style={{fontSize:11,color:"#666",marginTop:6}}>{t("create.custom_ai_note", lang)}</div>
            </div>
          )}
        </div>
        {/* D2: age slider 18-26 */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2}}>{t("create.label_age", lang)}</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:700}}>{t("create.age_value", lang, {n: age})}</div>
          </div>
          <input type="range" min="18" max="26" value={age} onChange={e=>setAge(parseInt(e.target.value))}
            style={{width:"100%",accentColor:"#f9a01b"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#555",marginTop:4}}>
            <span>{t("create.age_lo", lang)}</span>
            <span>22</span>
            <span>{t("create.age_hi", lang)}</span>
          </div>
          <div style={{fontSize:10,color:"#666",marginTop:6,lineHeight:1.5}}>
            {t("create.age_note", lang)}
          </div>
        </div>
        {/* D12: physicals editor — sliders for height / wingspan / weight */}
        <div style={{marginBottom:18,background:"#0d1117",borderRadius:10,padding:14,border:"1px solid #ffffff11"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2}}>{t("create.label_physicals", lang)}</div>
            <button type="button" onClick={rerollPhysicals}
              style={{fontSize:11,color:"#88aaff",background:"transparent",border:"1px solid #88aaff44",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontFamily:"sans-serif"}}>{t("create.reroll_physicals", lang)}</button>
          </div>
          {/* Height */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:4}}>
              <span>{t("create.height", lang)}</span><span style={{color:"#fff",fontWeight:700}}>{physicals.heightCm} cm</span>
            </div>
            <input type="range" min={heightRange[0]} max={heightRange[1]} value={physicals.heightCm}
              onChange={e=>setHeight(parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#f9a01b"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#555"}}>
              <span>{heightRange[0]}</span><span>{heightRange[1]}</span>
            </div>
          </div>
          {/* Wingspan delta */}
          <div style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:4}}>
              <span>{t("create.wingspan", lang)}</span>
              <span><span style={{color:"#fff",fontWeight:700}}>{physicals.wingspanCm} cm</span> <span style={{color:physicals.wingDelta>=6?"#00ff88":physicals.wingDelta<0?"#ff8888":"#666",fontSize:10}}>({physicals.wingDelta>0?"+":""}{physicals.wingDelta})</span></span>
            </div>
            <input type="range" min={-3} max={12} value={physicals.wingDelta}
              onChange={e=>setWingDelta(parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#f9a01b"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#555"}}>
              <span>-3</span><span>0</span><span>+12</span>
            </div>
          </div>
          {/* Weight */}
          <div style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#aaa",marginBottom:4}}>
              <span>{t("create.weight", lang)}</span><span style={{color:"#fff",fontWeight:700}}>{physicals.weightKg} kg</span>
            </div>
            <input type="range" min={weightRange[0]} max={weightRange[1]} value={physicals.weightKg}
              onChange={e=>setWeight(parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#f9a01b"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#555"}}>
              <span>{weightRange[0]}</span><span>{weightRange[1]}</span>
            </div>
          </div>
          {/* Traits readout */}
          <div style={{fontSize:10,color:"#666",marginTop:8,lineHeight:1.6}}>
            {t("create.static_traits", lang)}：{physicals.staticTraits.map((s: string) => tx(s, lang)).join(lang==="en"?", ":"、")}<br/>
            {t("create.dynamic_traits", lang)}：{physicals.dynamicTraits.map((s: string) => tx(s, lang)).join(lang==="en"?", ":"、")}
            <span style={{color:"#444"}}> {t("create.traits_note", lang)}</span>
          </div>
        </div>
        <div style={{background:"#0f1923",borderRadius:10,padding:14,marginBottom:20,border:"1px solid #f9a01b22"}}>
          <div style={{fontSize:11,color:"#f9a01b",marginBottom:4}}>{t("create.potential_warn", lang)}</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>{t("create.potential_body", lang)}</div>
        </div>
        <button onClick={submit} disabled={!name.trim()||!finalArc.trim()}
          style={{width:"100%",padding:"18px 0",fontSize:18,fontWeight:700,background:name.trim()&&finalArc.trim()?"linear-gradient(135deg,#f9a01b,#ffd700)":"#222",border:"none",borderRadius:12,color:name.trim()&&finalArc.trim()?"#000":"#555",cursor:name.trim()&&finalArc.trim()?"pointer":"not-allowed",fontFamily:"sans-serif"}}>
          {t("create.go_draft", lang)}
        </button>
      </div>
    </div>
  );
}

// ════════════════ DRAFT ════════════════
function DraftScreen({player, onDrafted, onBack, lang, setLang}: any) {
  const [phase, setPhase] = useState("intro");
  const [pick, setPick] = useState(0);
  const [dt, setDt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");

  async function runDraft() {
    setPhase("picking"); setLoading(true);
    const pn = Math.floor(Math.random()*30)+1;
    const t = ALL_TEAMS[Math.floor(Math.random()*ALL_TEAMS.length)];
    setPick(pn); setDt(t);
    const txt = await aiCall("你是NBA选秀夜解说员。中文3句话："+player.name+"（"+player.position+"，"+player.archetype+"）第"+pn+"顺位被"+t.city+t.name+"选中。画面感强，充满戏剧性。只输出解说词。", lang);
    setStory(txt||"掌声雷动！这位新秀即将开启他的NBA传奇！");
    setLoading(false); setPhase("result");
  }

  if(phase==="intro") return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"sans-serif",color:"#fff",position:"relative"}}>
      <button onClick={onBack} style={{position:"absolute",top:20,left:20,background:"#ffffff11",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>{t("app.back", lang)}</button>
      <div style={{position:"absolute",top:20,right:20}}><LangToggle lang={lang} setLang={setLang}/></div>
      <div style={{fontSize:11,color:"#f9a01b",letterSpacing:4,marginBottom:12}}>{t("draft.subtitle", lang)}</div>
      <div style={{fontSize:36,fontWeight:900,textAlign:"center",marginBottom:8}}>{t("draft.you_are_in", lang)}</div>
      <div style={{fontSize:15,color:"#888",textAlign:"center",marginBottom:36}}>{player.name} · {player.position} · {tx(player.archetype, lang)}</div>
      <div style={{fontSize:14,color:"#aaa",textAlign:"center",lineHeight:1.8,marginBottom:48,maxWidth:300,whiteSpace:"pre-line"}}>{t("draft.intro", lang)}</div>
      <button onClick={runDraft} style={{padding:"18px 48px",fontSize:18,fontWeight:700,background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:14,color:"#000",cursor:"pointer",fontFamily:"sans-serif"}}>{t("draft.start", lang)}</button>
    </div>
  );

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{fontSize:48,marginBottom:20}}>🎤</div>
      <div style={{fontSize:18,color:"#f9a01b"}}>{t("draft.in_progress", lang)}</div>
    </div>
  );

  if(phase==="result" && dt) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"sans-serif",color:"#fff"}}>
      <div style={{fontSize:13,color:"#888",letterSpacing:3,marginBottom:4}}>{t("draft.pick_n", lang, {n: pick})}</div>
      <div style={{fontSize:11,color:"#f9a01b",letterSpacing:4,marginBottom:20}}>{t("draft.label_pick", lang)}</div>
      <div style={{background:dt.color,border:"2px solid "+dt.accent,borderRadius:20,padding:"24px 40px",textAlign:"center",marginBottom:20,boxShadow:"0 0 40px "+dt.accent+"44"}}>
        <div style={{fontSize:42,color:dt.accent,fontWeight:900}}>{dt.abbr}</div>
        <div style={{fontSize:15,color:"#fff"}}>{teamFull(dt.abbr, lang)}</div>
      </div>
      <div style={{fontSize:21,fontWeight:700,marginBottom:4}}>{player.name}</div>
      <div style={{fontSize:13,color:"#aaa",marginBottom:20}}>{player.position} · {tx(player.archetype, lang)}</div>
      {story && <div style={{background:"#0f1923",borderRadius:12,padding:14,borderLeft:"4px solid "+dt.accent,marginBottom:24,maxWidth:360}}>
        <div style={{fontSize:10,color:dt.accent,letterSpacing:2,marginBottom:6}}>{t("draft.commentary", lang)}</div>
        <div style={{fontSize:14,color:"#ddd",lineHeight:1.7}}>{story}</div>
      </div>}
      <button onClick={()=>onDrafted(dt,pick)} style={{padding:"16px 40px",fontSize:16,fontWeight:700,background:dt.color,border:"2px solid "+dt.accent,borderRadius:12,color:dt.accent,cursor:"pointer",fontFamily:"sans-serif"}}>{t("draft.start_career", lang)}</button>
    </div>
  );

  return null;
}

// ════════════════ MAIN SCREEN ════════════════
// ════════════════ STANDINGS VIEW ════════════════
function StandingsView({standings, myTeamAbbr, ac}: any) {
  const lang = useLang();
  const [tab, setTab] = useState("west");
  if(!standings) return (
    <div style={{padding:20,textAlign:"center",color:"#444"}}>
      <div style={{fontSize:28,marginBottom:8}}>📊</div>
      <div>{t("standings.empty", lang)}</div>
    </div>
  );
  const data = tab==="west" ? standings.west : standings.east;

  function seedLabel(i) {
    if(i<6) return {label:(i+1)+"",color:"#00ff88"};
    if(i<8) return {label:"附加赛",color:"#f9a01b"};
    if(i<10) return {label:"附加赛",color:"#ff8844"};
    return {label:"-",color:"#555"};
  }

  return (
    <div style={{padding:14}}>
      {/* Conf tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["west","西部"],["east","东部"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{flex:1,padding:"10px 0",background:tab===v?ac+"22":"#111827",border:"1px solid "+(tab===v?ac:"#ffffff11"),borderRadius:10,color:tab===v?ac:"#666",fontWeight:tab===v?700:400,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:10,marginBottom:8,fontSize:10,color:"#555",paddingLeft:4}}>
        <span style={{color:"#00ff88"}}>{t("standings.legend_direct", lang)}</span>
        <span style={{color:"#f9a01b"}}>{t("standings.legend_playin", lang)}</span>
        <span>{t("standings.legend_out", lang)}</span>
      </div>

      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"24px 1fr 36px 36px 50px",gap:4,padding:"6px 10px",borderBottom:"1px solid #ffffff11",fontSize:10,color:"#555"}}>
        <span>#</span><span>{t("standings.col_team", lang)}</span><span style={{textAlign:"center"}}>{t("standings.col_w", lang)}</span><span style={{textAlign:"center"}}>{t("standings.col_l", lang)}</span><span style={{textAlign:"right"}}>{t("standings.col_pct", lang)}</span>
      </div>

      {data.map((tm,i)=>{
        // Renamed loop var from `t` → `tm` to avoid shadowing the i18n `t()` function.
        const isMine = tm.abbr===myTeamAbbr;
        const sl = seedLabel(i);
        const pctStr = tm.gp>0 ? (tm.pct).toFixed(3).replace("0.",".")  : "-";
        return (
          <div key={tm.abbr} style={{display:"grid",gridTemplateColumns:"24px 1fr 36px 36px 50px",gap:4,padding:"9px 10px",background:isMine?ac+"18":"transparent",borderBottom:"1px solid #ffffff06",borderLeft:isMine?"3px solid "+ac:"3px solid transparent",alignItems:"center"}}>
            <span style={{fontSize:11,color:sl.color,fontWeight:700}}>{i+1}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:2,background:tm.color,border:"1px solid "+tm.accent,flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:isMine?700:400,color:isMine?"#fff":"#ccc"}}>{teamCity(tm.abbr, lang)} {teamName(tm.abbr, lang)}</div>
                {isMine && <div style={{fontSize:9,color:ac}}>{t("standings.your_team", lang)}</div>}
              </div>
            </div>
            <span style={{textAlign:"center",fontSize:13,fontWeight:700,color:"#00ff88"}}>{tm.wins}</span>
            <span style={{textAlign:"center",fontSize:13,color:"#ff5555"}}>{tm.losses}</span>
            <span style={{textAlign:"right",fontSize:12,color:"#aaa"}}>{pctStr}</span>
          </div>
        );
      })}

      {/* Play-in explanation */}
      <div style={{background:"#111827",borderRadius:10,padding:12,marginTop:14,border:"1px solid #ffffff0d"}}>
        <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>{t("standings.playin_rules_title", lang)}</div>
        <div style={{fontSize:11,color:"#777",lineHeight:1.7}}>
          <span style={{whiteSpace:"pre-line"}}>{t("standings.playin_rules", lang)}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════ PLAYOFF VIEW ════════════════
function SeriesCard({series, myTeamAbbr, teamColor, ac, onSimGame, simming}: any) {
  const lang = useLang();
  if(!series) return null;
  const isMyMatch = series.teamA.abbr===myTeamAbbr||series.teamB.abbr===myTeamAbbr;
  const myTeam = series.teamA.abbr===myTeamAbbr ? series.teamA : series.teamB;
  const oppTeam = series.teamA.abbr===myTeamAbbr ? series.teamB : series.teamA;
  const myWins = series.teamA.abbr===myTeamAbbr ? series.winsA : series.winsB;
  const oppWins = series.teamA.abbr===myTeamAbbr ? series.winsB : series.winsA;
  const done = series.winner!==null;
  const iWon = done && series.winner===myTeamAbbr;
  const iLost = done && myTeam && series.winner!==myTeamAbbr;

  if(!isMyMatch) {
    // Other series — compact
    // B18: use series.teamA/teamB directly — they're already complete team objects.
    const aT = series.teamA;
    const bT = series.teamB;
    return (
      <div style={{background:"#111827",borderRadius:8,padding:"8px 12px",marginBottom:6,border:"1px solid #ffffff0d",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:series.winner===aT.abbr?"#00ff88":"#aaa",fontWeight:series.winner===aT.abbr?700:400}}>{aT.abbr}</div>
        <div style={{fontSize:12,color:"#555"}}>{series.winsA} - {series.winsB}</div>
        <div style={{fontSize:12,color:series.winner===bT.abbr?"#00ff88":"#aaa",fontWeight:series.winner===bT.abbr?700:400}}>{bT.abbr}</div>
        {!done && <div style={{fontSize:10,color:"#444"}}>{t("playoffs.in_progress", lang)}</div>}
        {done && <div style={{fontSize:10,color:"#00ff88"}}>✓</div>}
      </div>
    );
  }

  // My match — featured card
  return (
    <div style={{background:iWon?"#0d2a1a":iLost?"#2a0d0d":"#0d1a2a",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(iWon?"#00ff8844":iLost?"#ff444444":ac+"44")}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,color:"#888"}}>{tx(series.round, lang)} {isMyMatch ? "· " + t("playoffs.my_match", lang) : ""}</div>
        {iWon && <div style={{fontSize:12,color:"#00ff88",fontWeight:700}}>{t("playoffs.advance", lang)}</div>}
        {iLost && <div style={{fontSize:12,color:"#ff5555",fontWeight:700}}>{t("playoffs.eliminated", lang)}</div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:ac}}>{myTeam.abbr}</div>
          <div style={{fontSize:10,color:"#888"}}>{myTeam.city||""}</div>
        </div>
        <div style={{fontSize:28,fontWeight:900,color:"#fff"}}>{myWins} - {oppWins}</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#aaa"}}>{oppTeam.abbr}</div>
          <div style={{fontSize:10,color:"#888"}}>{oppTeam.city||""}</div>
        </div>
      </div>
      {/* Game dots */}
      <div style={{display:"flex",gap:4,marginBottom:10,justifyContent:"center"}}>
        {series.games.slice(0,myWins+oppWins+1).slice(0,7).map((g,gi)=>{
          // B4: removed two dead-code vars (iWonThisGame, myWonGame) whose values
          // were never read. Color logic is in the JSX below.
          const isPlayed = g.status!=="upcoming";
          return (
            <div key={gi} style={{width:24,height:24,borderRadius:4,background:!isPlayed?"#1a1a2e":g.status==="won"?(series.teamA.abbr===myTeamAbbr?"#00ff8855":"#ff444455"):(series.teamA.abbr===myTeamAbbr?"#ff444455":"#00ff8855"),border:"1px solid #ffffff11",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#888"}}>
              {!isPlayed?"·":g.status==="won"?(series.teamA.abbr===myTeamAbbr?"W":"L"):(series.teamA.abbr===myTeamAbbr?"L":"W")}
            </div>
          );
        })}
      </div>
      {!done && (
        <button onClick={onSimGame} disabled={simming}
          style={{width:"100%",padding:"10px 0",background:teamColor,border:"1px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
          {simming?t("playoffs.simming", lang):t("playoffs.sim_game_n", lang, {n: myWins+oppWins+1})}
        </button>
      )}
    </div>
  );
}

function PlayoffView({bracket, myTeam, onSimGame, simming, onOffseason, onAutoSimAll, ac, narrative, narrativeCtx}: any) {
  const lang = useLang();
  const [tab, setTab] = useState(()=>myTeam.conf==="West"?"west":"east");
  if(!bracket) return null;

  function getAllSeries(conf) {
    const all = [];
    if(conf.r1) conf.r1.forEach(s=>all.push(s));
    if(conf.r2) conf.r2.forEach(s=>all.push(s));
    if(conf.r3) conf.r3.forEach(s=>all.push(s));
    return all;
  }

  const allCurSeries = getAllSeries(tab==="west"?bracket.west:bracket.east);
  // Next unfinished series in the bracket (any conf)
  const allSeriesAll = [...getAllSeries(bracket.west),...getAllSeries(bracket.east),...(bracket.finals?[bracket.finals]:[])];
  const nextActiveSeries = allSeriesAll.find(s=>!s.winner);
  const finals = bracket.finals;
  const champion = bracket.champion;
  const myConfSeries = getAllSeries(myTeam.conf==="West"?bracket.west:bracket.east);
  const isMyOut = myConfSeries.some(s=>(s.teamA.abbr===myTeam.abbr||s.teamB.abbr===myTeam.abbr)&&s.winner&&s.winner!==myTeam.abbr);
  const myNotIn = !myConfSeries.some(s=>s.teamA.abbr===myTeam.abbr||s.teamB.abbr===myTeam.abbr);

  return (
    <div style={{padding:14}}>
      {/* Always-visible sim button for next unfinished series */}
      {nextActiveSeries && !champion && (
        <div style={{background:"#111827",borderRadius:10,padding:"12px 14px",marginBottom:12,border:"1px solid "+ac+"44",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:11,color:"#888"}}>{t("playoffs.next_game", lang)}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#ccc"}}>{nextActiveSeries.teamA.abbr} vs {nextActiveSeries.teamB.abbr} · {nextActiveSeries.round}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>onSimGame(nextActiveSeries)} disabled={simming}
              style={{padding:"9px 14px",background:simming?"#222":myTeam.color,border:"1px solid "+(simming?"#333":ac),borderRadius:9,color:simming?"#444":ac,fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
              {simming?t("playoffs.simming", lang):t("playoffs.sim_one", lang)}
            </button>
            {/* D6: auto-sim all remaining */}
            {onAutoSimAll && (
              <button onClick={onAutoSimAll} disabled={simming}
                style={{padding:"9px 14px",background:simming?"#222":"#1a1a0d",border:"1px solid "+(simming?"#333":"#f9a01b66"),borderRadius:9,color:simming?"#444":"#f9a01b",fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                {t("playoffs.sim_all", lang)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conf tabs */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[["west","西部"],["east","东部"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{flex:1,padding:"9px 0",background:tab===v?ac+"22":"#111827",border:"1px solid "+(tab===v?ac:"#ffffff11"),borderRadius:10,color:tab===v?ac:"#666",fontWeight:tab===v?700:400,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
            {l}对阵
          </button>
        ))}
      </div>

      {(myNotIn && tab===myTeam.conf.toLowerCase()) && (
        <div style={{background:"#2a0d0d",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:"#ff8888",border:"1px solid #ff444422"}}>
          {t("playoffs.not_in_playoff", lang)}
        </div>
      )}

      {allCurSeries.map((s,i)=>(
        <SeriesCard key={i} series={s} myTeamAbbr={myTeam.abbr} teamColor={myTeam.color} ac={ac} onSimGame={()=>onSimGame(s)} simming={simming}/>
      ))}

      {finals && (
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:8}}>{t("playoffs.finals_label", lang)}</div>
          <SeriesCard series={finals} myTeamAbbr={myTeam.abbr} teamColor={myTeam.color} ac={ac} onSimGame={()=>onSimGame(finals)} simming={simming}/>
        </div>
      )}

      {champion && (
        <div style={{background:"#1a2a0d",borderRadius:12,padding:16,textAlign:"center",border:"1px solid #ffd70044",marginTop:10}}>
          <div style={{fontSize:28,marginBottom:4}}>🏆</div>
          <div style={{fontSize:18,fontWeight:900,color:"#ffd700"}}>{champion===myTeam.abbr?t("playoffs.champion_won", lang):t("playoffs.champion_team", lang, {team: teamFull(champion, lang)})}</div>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div style={{marginTop:12,background:"#0f1923",borderRadius:12,padding:14,borderLeft:"4px solid "+ac}}>
          <div style={{fontSize:13,color:"#ddd",lineHeight:1.7,whiteSpace:"pre-line"}}>{narrative}</div>
        </div>
      )}

      {(isMyOut||myNotIn||champion) && (
        <button onClick={onOffseason}
          style={{width:"100%",marginTop:12,padding:"12px 0",background:"#1a1a0d",border:"1px solid #f9a01b44",borderRadius:10,color:"#f9a01b",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>
          {t("playoffs.to_offseason", lang)}
        </button>
      )}
    </div>
  );
}

const TEAMMATE_NAMES = ["贾马尔","德里克","泰勒","马库斯","凯尔","乔丹","坦纳","迈尔斯","奥利弗","肖恩","布莱克","达文特","雷吉","特雷","内特"];
const TEAMMATE_ROLES = ["首发控卫","首发得分后卫","首发小前锋","首发大前锋","首发中锋","第六人","轮换得分手","防守专家","组织替补","体能轮换"];

function generateTeammates() {
  // B20: bumped from 5 to 10 — uses full TEAMMATE_ROLES list (no role wasted).
  return Array(10).fill(null).map((_,i)=>({
    id:i,
    name:TEAMMATE_NAMES[Math.floor(Math.random()*TEAMMATE_NAMES.length)]+"·"+["史密斯","约翰逊","威廉斯","布朗","戴维斯","马丁","汤普森","安德森","托马斯","杰克逊"][Math.floor(Math.random()*10)],
    role:TEAMMATE_ROLES[i]||TEAMMATE_ROLES[Math.floor(Math.random()*TEAMMATE_ROLES.length)],
    rapport:Math.floor(Math.random()*40)+40, // 40-80 initial
    ovr:Math.floor(Math.random()*25)+70,
  }));
}

function generateSeasonAwards(playerName: string, teamAbbr: string, _teamName: string, avg: any, ovr: number, wins: number, season: number, playoffBracket: any, finalsAvg: any, lang: Lang = "zh") {
  // C (B2+B3+B12): rewritten. Uses a name pool of ~2500 transliterated names.
  // League stars are 1 per team (ovr biased by team strength seed). Rookies are
  // 20 random. Awards picked by ovr ranking with player injected. FMVP requires
  // player actually played the finals AND averaged ≥20 pts.
  const pool = buildNamePool(lang);
  const stars = generateLeagueStars(pool);
  const rookies = generateRookies(pool, ALL_TEAMS.length);

  const isMVPCandidate = avg.pts > 25 && avg.ast > 5 && wins > 50 && ovr > 85;
  const isDPOY = avg.stl > 1.5 && avg.blk > 1.2 && ovr > 82;
  const isGoodSeason = avg.pts > 20 && wins > 41;
  const isRookieSeason = season === 1;

  const me: any = { name: playerName, teamAbbr, ovr, isRookie: isRookieSeason };
  const allPlayers: any[] = [...stars, me];

  const sortedByOvr = [...allPlayers].sort((a, b) => {
    const aBoost = a.name === playerName && isGoodSeason ? 5 : 0;
    const bBoost = b.name === playerName && isGoodSeason ? 5 : 0;
    return (b.ovr + bBoost) - (a.ovr + aBoost);
  });
  const mvp = isMVPCandidate ? fmtPlayer(me) : fmtPlayer(sortedByOvr[0]);

  const allNBA1 = sortedByOvr.slice(0, 5).map(fmtPlayer);
  const allNBA2 = sortedByOvr.slice(5, 10).map(fmtPlayer);
  const allNBA3 = sortedByOvr.slice(10, 15).map(fmtPlayer);

  const defShuffled = [...allPlayers].sort((a, b) => {
    const aBoost = a.name === playerName && isDPOY ? 8 : 0;
    const bBoost = b.name === playerName && isDPOY ? 8 : 0;
    return (b.ovr * 0.7 + bBoost + Math.random() * 10) - (a.ovr * 0.7 + aBoost + Math.random() * 10);
  });
  const allDef1 = defShuffled.slice(0, 5).map(fmtPlayer);
  const allDef2 = defShuffled.slice(5, 10).map(fmtPlayer);
  const dpoy = isDPOY ? fmtPlayer(me) : fmtPlayer(defShuffled[0]);

  const rookieList = isRookieSeason ? [me, ...rookies] : rookies;
  rookieList.sort((a, b) => b.ovr - a.ovr);
  const allRookie1 = rookieList.slice(0, 5).map(fmtPlayer);
  const allRookie2 = rookieList.slice(5, 10).map(fmtPlayer);

  const actualChampAbbr = playoffBracket ? playoffBracket.champion : null;
  const actualChampTeam = actualChampAbbr ? (ALL_TEAMS.find(t => t.abbr === actualChampAbbr) || null) : null;
  const championName = actualChampAbbr ? teamFull(actualChampAbbr, lang) : "—";
  const iChampion = actualChampAbbr === teamAbbr;

  let fmvp: string;
  if(iChampion && finalsAvg && finalsAvg.gamesPlayed > 0 && finalsAvg.avgPts >= 20) {
    fmvp = fmtPlayer(me);
  } else if(iChampion) {
    const teamStar = stars.find(s => s.teamAbbr === teamAbbr);
    fmvp = teamStar ? fmtPlayer(teamStar) : fmtPlayer(me);
  } else if(actualChampAbbr) {
    const champStar = stars.find(s => s.teamAbbr === actualChampAbbr);
    fmvp = champStar ? fmtPlayer(champStar) : "—";
  } else {
    fmvp = "—";
  }

  const bestCoach = COACHES_BILINGUAL[Math.floor(Math.random() * COACHES_BILINGUAL.length)][lang];

  return {
    mvp, allNBA1, allNBA2, allNBA3,
    allDef1, allDef2, dpoy,
    allRookie1, allRookie2,
    bestCoach, champion: championName, iChampion, fmvp,
  };
}

function MainScreen({saveId, init, onQuit, lang, setLang}: any) {
  const [player, setPlayer] = useState(() => ({...init.player, age: init.player.age || 19}));
  const [team, setTeam] = useState(init.team);
  const [season, setSeason] = useState(init.season||1);
  const [phase, setPhase] = useState(init.phase||"regular");
  const [regularGames, setRegularGames] = useState(init.regularGames||generateRegularSeason(init.team,2024));
  const [playoffBracket, setPlayoffBracket] = useState(init.playoffBracket||null);
  const [playoffRound, setPlayoffRound] = useState(init.playoffRound||0);
  const [leagueStandings, setLeagueStandings] = useState(null); // computed on demand
  const [injury, setInjury] = useState(init.injury||null);
  const [resting, setResting] = useState(init.resting||0); // games to rest
  const [injuryLog, setInjuryLog] = useState(init.injuryLog||[]);
  const [relationships, setRelationships] = useState(init.relationships||{coach:65,gm:60,owner:55,star:50,teammate:70});
  const [contract, setContract] = useState(init.contract||{type:"rookie",year:1,totalYears:4,salary:2.5});
  const [brands, setBrands] = useState(init.brands||[]);
  const [pendingBrand, setPendingBrand] = useState(null);
  const [offseasonDone, setOffseasonDone] = useState(init.offseasonDone||false);
  const [freeAgent, setFreeAgent] = useState(init.freeAgent||false);
  const [seasonAwards, setSeasonAwards] = useState(init.seasonAwards||null);
  const [showAwards, setShowAwards] = useState(false);
  const [teammates, setTeammates] = useState(init.teammates||generateTeammates());
  // Personal assets
  const [savings, setSavings] = useState(init.savings||0); // in $M
  const [ownedCars, setOwnedCars] = useState(init.ownedCars||[]);
  const [ownedHouse, setOwnedHouse] = useState(init.ownedHouse||null); // {city, ...houseObj}
  const [currentRental, setCurrentRental] = useState(init.currentRental||null);
  const [faOffers, setFaOffers] = useState(init.faOffers||[]); // all FA offers from league
  const [view, setView] = useState("calendar");
  const [calYear, setCalYear] = useState(()=>{const u=regularGames.find(g=>g.status==="upcoming"); return u?new Date(u.date).getFullYear():2024+(init.season||1)-1;});
  const [calMonth, setCalMonth] = useState(()=>{const u=regularGames.find(g=>g.status==="upcoming"); return u?new Date(u.date).getMonth():9;});
  const [simming, setSimming] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [narrativeCtx, setNarrativeCtx] = useState(null);
  const [trainAlloc, setTrainAlloc] = useState({speed:0,shooting:0,passing:0,defense:0,strength:0,iq:0});
  const [saveMsg, setSaveMsg] = useState("");
  const [dayModal, setDayModal] = useState(null);
  const [relModal, setRelModal] = useState(null);
  const [relLoading, setRelLoading] = useState(false);
  const [relStory, setRelStory] = useState({});
  const [contractModal, setContractModal] = useState(false);
  const [contractOffer, setContractOffer] = useState(init.pendingOffer||null);
  const [tradeResult, setTradeResult] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [restModal, setRestModal] = useState(false);
  const [retireModal, setRetireModal] = useState(false);
  const [retired, setRetired] = useState(false);
  const [negotiateResult, setNegotiateResult] = useState<any>(null); // D7
  const [restInput, setRestInput] = useState(1);

  const played = regularGames.filter(g=>g.status!=="upcoming");
  const wins = regularGames.filter(g=>g.status==="won").length;
  const seasonOver = regularGames.filter(g=>g.status==="upcoming").length===0;
  const totalAlloc = Object.values(trainAlloc).reduce((a:number, b:any) => a + (b as number), 0);

  const avg = useMemo(()=>{
    const pg = played.filter(g=>g.stats);
    if(!pg.length) return {pts:0,ast:0,reb:0,stl:0,blk:0};
    const s = pg.reduce((a,g)=>({pts:a.pts+g.stats.pts,ast:a.ast+g.stats.ast,reb:a.reb+g.stats.reb,stl:a.stl+g.stats.stl,blk:a.blk+g.stats.blk}),{pts:0,ast:0,reb:0,stl:0,blk:0});
    const n = pg.length;
    return {pts:+(s.pts/n).toFixed(1),ast:+(s.ast/n).toFixed(1),reb:+(s.reb/n).toFixed(1),stl:+(s.stl/n).toFixed(1),blk:+(s.blk/n).toFixed(1)};
  },[played]);

  // D4: dynamic training-point budget — MUST come after `avg` is declared (TDZ fix).
  const maxTrainPoints = useMemo(() => {
    let pts = 6;
    if(avg.pts > 25 && avg.ast > 5 && wins > 50 && player.overall > 85) pts += 2;
    else if(avg.pts > 20 && wins > 41) pts += 1;
    const age = player.age || 19;
    if(age < 25) pts += 1;
    if(age > 30) pts -= 1;
    if(age > 35) pts -= 1;
    return Math.max(3, Math.min(9, pts));
  }, [avg.pts, avg.ast, wins, player.overall, player.age]);

  const doSave = useCallback(()=>{
    const saves = loadSaves();
    saves[saveId] = {
      id:saveId, playerName:player.name, position:player.position, archetype:player.archetype,
      overall:player.overall, age:player.age, teamAbbr:team.abbr, wins, losses:played.length-wins,
      gamesPlayed:played.length, injured:!!injury, salary:contract.salary, savedAt:Date.now(),
      player, team, draftPick:init.draftPick, season, phase, regularGames, playoffBracket, playoffRound,
      injury, resting, injuryLog, relationships, contract, brands, offseasonDone, pendingOffer:contractOffer,
      freeAgent, seasonAwards, teammates, savings, ownedCars, ownedHouse, currentRental, faOffers, retired
    };
    writeSaves(saves);
    setSaveMsg("已保存 ✓");
    setTimeout(()=>setSaveMsg(""),2000);
  },[player,team,season,phase,regularGames,playoffBracket,playoffRound,injury,resting,injuryLog,relationships,contract,brands,offseasonDone,wins,played,saveId,contractOffer]);

  // B15: debounce auto-save — was triggering on every game update.
  const _saveTimerRef = useRef<any>(null);
  // Mirror playoffBracket to a ref so async loops can read the latest value
  // without being trapped in a stale closure.
  const playoffBracketRef = useRef<any>(null);
  useEffect(() => { playoffBracketRef.current = playoffBracket; }, [playoffBracket]);
  useEffect(() => {
    if(played.length === 0) return;
    if(_saveTimerRef.current) clearTimeout(_saveTimerRef.current);
    _saveTimerRef.current = setTimeout(() => { doSave(); }, 500);
    return () => { if(_saveTimerRef.current) clearTimeout(_saveTimerRef.current); };
  }, [regularGames, playoffBracket]);

  function checkNewInjury() {
    // D1: injury chance scales with age (+0.5% per year above 30)
    const ageBonus = Math.max(0, (player.age || 22) - 30) * 0.005;
    const chance = 0.02 + ageBonus;
    if(Math.random() < chance) {
      const t: any = INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)];
      const d = t.minDays + Math.floor(Math.random() * (t.maxDays - t.minDays + 1));
      return { name: t.name, daysLeft: d, affectedStats: t.stats, severity: t.severity };
    }
    return null;
  }

  function getEffStats(inj) {
    if(!inj) return player.stats;
    const e = {...player.stats};
    inj.affectedStats.forEach(s=>{ e[s]=Math.max(28,Math.round(e[s]*0.68)); });
    return e;
  }

  function simOneGame(inj, isResting) {
    if(isResting) return {pts:0,ast:0,reb:0,stl:0,blk:0,win:Math.random()>0.55,injured:false,rested:true};
    const e = getEffStats(inj);
    const arc = player.archetype.toLowerCase();
    const ptB = arc.includes("得分")||arc.includes("射手")?4:arc.includes("组织")?-2:0;
    const astB = arc.includes("组织")||arc.includes("控卫")?4:0;
    const rebB = arc.includes("蓝领")||player.position==="C"?4:0;
    const injP = inj?-4:0;
    const pts = Math.max(0,Math.floor(Math.random()*22)+8+Math.floor((e.shooting-60)/5)+ptB+injP);
    const ast = Math.max(0,Math.floor(Math.random()*7)+(player.position==="PG"?4:1)+Math.floor((e.passing-60)/8)+astB+(inj?-1:0));
    const reb = Math.max(0,Math.floor(Math.random()*9)+(["C","PF"].includes(player.position)?5:1)+Math.floor((e.strength-60)/8)+rebB);
    const stl = Math.max(0,Math.floor(Math.random()*3)+Math.floor((e.defense-60)/15));
    const blk = Math.max(0,Math.floor(Math.random()*2)+(player.position==="C"?1:0));
    const win = Math.random()<(0.30+e.iq/220+(inj?-0.06:0));
    return {pts,ast,reb,stl,blk,win,injured:!!inj,rested:false};
  }

  async function simulateUpTo(targetId) {
    if(simming) return;
    setSimming(true); setNarrative(""); setNarrativeCtx(null);
    try {
    const games = regularGames.filter(g=>g.status==="upcoming" && g.id<=targetId);
    if(!games.length) { return; }
    let newReg = [...regularGames];
    let curInj = injury;
    let curRest = resting;
    let newInjLog = [...injuryLog];
    let newRels = {...relationships};
    let injEvent = null;
    let prevDate: Date | null = null;
    for(let i=0; i<games.length; i++) {
      const g = games[i];
      const curDate = new Date(g.date);
      // D1: deduct elapsed days from injury (was: 1 per game)
      const elapsedDays = prevDate ? Math.max(1, Math.round((curDate.getTime() - prevDate.getTime()) / 86400000)) : 1;
      prevDate = curDate;
      const isResting = curRest>0;
      if(isResting) { curRest--; }
      else if(curInj) {
        curInj = {...curInj, daysLeft: (curInj.daysLeft || 0) - elapsedDays};
        if(curInj.daysLeft <= 0) {
          newInjLog.push({name:curInj.name,date:g.date,type:"recovered"});
          injEvent = t("sim.recovered_from", lang, {name: tx(curInj.name, lang)});
          curInj = null;
        }
      } else {
        const ni = checkNewInjury();
        if(ni) { curInj=ni; newInjLog.push({name:ni.name,date:g.date,days:ni.daysLeft,type:"injured"}); injEvent=t("sim.injured", lang, {name: tx(ni.name, lang), n: ni.daysLeft}); }
      }
      const res = simOneGame(curInj, isResting);
      newReg = newReg.map(s=>s.id===g.id?{...s,status:res.win?"won":"lost",stats:res}:s);
      // B11: softened from ±2/-1 to ±0.5/-0.25 — old values hit 100 mid-S2.
      const winD = res.win ? 0.5 : -0.25;
      const mateD = res.win ? 0.25 : -0.25;
      newRels = {...newRels, coach: Math.min(100, Math.max(0, newRels.coach + winD)), teammate: Math.min(100, Math.max(0, newRels.teammate + mateD))};
    }
    setRegularGames(newReg); setInjury(curInj); setResting(curRest); setInjuryLog(newInjLog); setRelationships(newRels);
    // Auto-build playoff bracket as soon as regular season ends
    const newSeasonOver = newReg.filter(g=>g.status==="upcoming").length===0;
    if(newSeasonOver && !playoffBracket) {
      const st = generateLeagueStandings(team, newReg);
      const pb = buildNBAPlayoffBracket(st, team.abbr, 2024+(season-1));
      setLeagueStandings(st);
      setPlayoffBracket(pb);
    }
    if(Math.random()<0.1 && brands.length<5) {
      const avail = BRANDS.filter(b=>!brands.find(x=>x.name===b.name));
      if(avail.length>0) { const b=avail[Math.floor(Math.random()*avail.length)]; const o=+(b.baseOffer*(0.8+Math.random()*0.8+player.overall/100)).toFixed(1); setPendingBrand({...b,offer:o}); }
    }
    const lastG = newReg.filter(g=>g.status!=="upcoming").slice(-1)[0];
    if(lastG) {
      setNarrativeCtx(lastG);
      if(games.length===1 && !lastG.stats?.rested) {
        const oppT = ALL_TEAMS.find(t=>t.abbr===lastG.opp)||ALL_TEAMS[0];
        const txt = await aiCall("你是NBA解说员。中文3句话："+player.name+"（"+team.city+team.name+"，"+player.position+"，"+player.archetype+"）对阵"+oppT.city+oppT.name+"。"+lastG.stats.pts+"分 "+lastG.stats.ast+"助 "+lastG.stats.reb+"篮，"+(lastG.status==="won"?"胜":"负")+"。"+(lastG.stats.injured?"带伤出战。":"")+"体现"+player.archetype+"风格。只输出解说词。", lang);
        setNarrative((injEvent?injEvent+"\n\n":"")+(txt||"精彩比赛！"));
      } else {
        setNarrative((injEvent||"")+(injEvent?"\n\n":"")+(games.length>1?t("sim.completed_n_games", lang, {n: games.length}):t("sim.rested_this_game", lang)));
      }
    }
    } catch(e) { console.error("simulateUpTo error:", e); }
    finally { setSimming(false); }
  }

  async function simPlayoffGame(series) {
    // Read the LATEST bracket from the ref (avoids stale closure when called
    // in a loop from autoSimAllPlayoffs).
    const pb = playoffBracketRef.current || playoffBracket;
    if(!pb) return;
    setSimming(true); setNarrative(""); setNarrativeCtx(null);
    try {
    const nb = JSON.parse(JSON.stringify(pb));

    // Find which conf and round this series belongs to
    function findAndSim(confObj) {
      for(const roundKey of ["r1","r2","r3"]) {
        if(!confObj[roundKey]) continue;
        const idx = confObj[roundKey].findIndex(s=>s.teamA.abbr===series.teamA.abbr&&s.teamB.abbr===series.teamB.abbr);
        if(idx>=0) {
          const s = confObj[roundKey][idx];
          if(s.winner) return false;
          const nextG = s.games.find(g=>g.status==="upcoming");
          if(!nextG) return false;
          const isMyMatch = s.teamA.abbr===team.abbr||s.teamB.abbr===team.abbr;
          const imTeamA = s.teamA.abbr===team.abbr;
          let curInj = injury; let newInjLog=[...injuryLog]; let injEvent=null;
          if(curInj){curInj={...curInj,daysLeft:(curInj.daysLeft||0)-2};if(curInj.daysLeft<=0){newInjLog.push({name:curInj.name,date:nextG.date,type:"recovered"});injEvent=t("sim.recovered_short", lang);curInj=null;}}
          else if(isMyMatch){const ni=checkNewInjury();if(ni){curInj=ni;newInjLog.push({name:ni.name,date:nextG.date,days:ni.daysLeft,type:"injured"});injEvent=t("sim.injured_short", lang, {name: tx(ni.name, lang)});}}
          const res = isMyMatch ? simOneGame(curInj,false) : {pts:0,ast:0,reb:0,stl:0,blk:0,win:Math.random()>0.45,injured:false,rested:false};
          const aWon = imTeamA ? res.win : !res.win;
          if(aWon) s.winsA++; else s.winsB++;
          s.games = s.games.map(g=>g.id===nextG.id?{...g,status:aWon?"won":"lost",stats:res}:g);
          if(s.winsA>=4){s.winner=s.teamA.abbr;}
          if(s.winsB>=4){s.winner=s.teamB.abbr;}
          if(isMyMatch){setInjury(curInj);setInjuryLog(newInjLog);setRelationships(prev=>({...prev,coach:Math.min(100,Math.max(0,prev.coach+(res.win?2:-1))),teammate:Math.min(100,Math.max(0,prev.teammate+(res.win?1:-1)))}))}
          return {s,nextG,res,injEvent,isMyMatch,imTeamA};
        }
      }
      // Check finals
      if(nb.finals && nb.finals.teamA.abbr===series.teamA.abbr && nb.finals.teamB.abbr===series.teamB.abbr) {
        const s = nb.finals;
        if(s.winner) return false;
        const nextG = s.games.find(g=>g.status==="upcoming");
        if(!nextG) return false;
        const isMyMatch = s.teamA.abbr===team.abbr||s.teamB.abbr===team.abbr;
        const imTeamA = s.teamA.abbr===team.abbr;
        let curInj=injury; let newInjLog=[...injuryLog]; let injEvent=null;
        if(curInj){curInj={...curInj,daysLeft:(curInj.daysLeft||0)-2};if(curInj.daysLeft<=0){newInjLog.push({name:curInj.name,date:nextG.date,type:"recovered"});injEvent=t("sim.recovered_short", lang);curInj=null;}}
        else if(isMyMatch){const ni=checkNewInjury();if(ni){curInj=ni;newInjLog.push({name:ni.name,date:nextG.date,days:ni.daysLeft,type:"injured"});injEvent=t("sim.injured_short", lang, {name: tx(ni.name, lang)});}}
        const res = isMyMatch ? simOneGame(curInj,false) : {pts:0,ast:0,reb:0,stl:0,blk:0,win:Math.random()>0.45,injured:false,rested:false};
        const aWon = imTeamA ? res.win : !res.win;
        if(aWon) s.winsA++; else s.winsB++;
        s.games = s.games.map(g=>g.id===nextG.id?{...g,status:aWon?"won":"lost",stats:res}:g);
        if(s.winsA>=4){s.winner=s.teamA.abbr; nb.champion=s.teamA.abbr;}
        if(s.winsB>=4){s.winner=s.teamB.abbr; nb.champion=s.teamB.abbr;}
        if(isMyMatch){setInjury(curInj);setInjuryLog(newInjLog);}
        return {s,nextG,res,injEvent,isMyMatch,imTeamA};
      }
      return false;
    }

    let result = findAndSim(nb.west);
    if(!result) result = findAndSim(nb.east);

    // After each round completes, auto-advance bracket
    function autoAdvance(confObj, confName) {
      if(!confObj.r1||confObj.r1.some(s=>!s.winner)) return;
      if(!confObj.r2||confObj.r2.length===0) {
        // Build R2: winners of [0vs3] and [1vs2] (bracket reseed: 1v8winner vs 4v5winner, 3v6winner vs 2v7winner)
        const w = confObj.r1.map(s=>s.winner===s.teamA.abbr?s.teamA:s.teamB);
        confObj.r2 = [
          buildSeries(w[0],w[3],confName,"半决赛",nb.startYear,0),
          buildSeries(w[1],w[2],confName,"半决赛",nb.startYear,1),
        ];
      }
      if(!confObj.r2||confObj.r2.some(s=>!s.winner)) return;
      if(!confObj.r3||confObj.r3.length===0) {
        const w = confObj.r2.map(s=>s.winner===s.teamA.abbr?s.teamA:s.teamB);
        confObj.r3 = [buildSeries(w[0],w[1],confName,"分区决赛",nb.startYear,0)];
      }
      if(!confObj.r3||confObj.r3.some(s=>!s.winner)) return;
      // Check if finals needed
      const wWest = nb.west.r3&&nb.west.r3[0]?.winner;
      const wEast = nb.east.r3&&nb.east.r3[0]?.winner;
      if(wWest&&wEast&&!nb.finals) {
        const tW = ALL_TEAMS.find(t=>t.abbr===wWest)||{abbr:wWest,name:wWest,city:"",color:"#333",accent:"#fff"};
        const tE = ALL_TEAMS.find(t=>t.abbr===wEast)||{abbr:wEast,name:wEast,city:"",color:"#333",accent:"#fff"};
        nb.finals = buildSeries(tW,tE,"Finals","总决赛",nb.startYear,0);
      }
    }
    function buildSeries(tA,tB,confName,rnd,sy,mi) {
      const isMyMatch = tA.abbr===team.abbr||tB.abbr===team.abbr;
      const games = Array(7).fill(null).map((_,gi)=>({
        id:"p_"+confName+"_"+rnd+"_"+mi+"_"+gi,
        date:new Date(2025,4,1+gi*2).toISOString(),
        opp:tA.abbr===team.abbr?tB.abbr:tA.abbr,
        home:gi%2===0,status:"upcoming",stats:null,game:gi+1
      }));
      return {round:rnd,conf:confName,teamA:tA,teamB:tB,isMyMatch,winsA:0,winsB:0,winner:null,games};
    }

    autoAdvance(nb.west,"West");
    autoAdvance(nb.east,"East");
    setPlayoffBracket(nb);
    playoffBracketRef.current = nb;  // sync ref so loop sees progress

    if(result&&result.isMyMatch) {
      const oppT = ALL_TEAMS.find(t=>t.abbr===result.nextG.opp)||ALL_TEAMS[0];
      const myWin = result.imTeamA?(result.s.games.find(g=>g.id===result.nextG.id)?.status==="won"):!(result.s.games.find(g=>g.id===result.nextG.id)?.status==="won");
      const txt = await aiCall("NBA季后赛解说员。中文3句话："+player.name+"（"+team.city+team.name+"）季后赛"+result.s.round+"对阵"+oppT.city+oppT.name+"。"+result.res.pts+"分 "+result.res.ast+"助 "+result.res.reb+"篮，"+(myWin?"胜":"负")+"，系列赛"+(result.imTeamA?result.s.winsA:result.s.winsB)+"-"+(result.imTeamA?result.s.winsB:result.s.winsA)+"。只输出解说词。", lang);
      setNarrative((result.injEvent?result.injEvent+"\n\n":"")+(txt||"季后赛激战！"));
    }
    } catch(e) { console.error("simPlayoffGame error:", e); }
    finally { setSimming(false); }
  }


  function allocTrain(stat: string, delta: number) {
    const c = (trainAlloc as any)[stat];
    if(c + delta < 0) return;
    if(delta > 0 && totalAlloc >= maxTrainPoints) return;
    setTrainAlloc({...trainAlloc, [stat]: c + delta});
  }
  function confirmTraining() {
    const ns = {...player.stats};
    Object.entries(trainAlloc).forEach(([s,p])=>{ ns[s]=Math.min(player.ceiling[s],ns[s]+p*2); });
    setPlayer({...player,stats:ns,overall:calcOverall(ns)});
    setOffseasonDone(true);
    setTrainAlloc({speed:0,shooting:0,passing:0,defense:0,strength:0,iq:0});
  }
  // D6: keep simulating until champion exists. Uses playoffBracketRef so
  // each iteration reads the LATEST state (avoids stale-closure trap).
  async function autoSimAllPlayoffs() {
    const initial = playoffBracketRef.current || playoffBracket;
    if(!initial || initial.champion) return;
    for(let safety = 0; safety < 200; safety++) {
      const pb = playoffBracketRef.current;
      if(!pb || pb.champion) break;
      const allSeries: any[] = [];
      if(pb.west) ["r1","r2","r3"].forEach(k => (pb.west[k]||[]).forEach((s:any)=>allSeries.push(s)));
      if(pb.east) ["r1","r2","r3"].forEach(k => (pb.east[k]||[]).forEach((s:any)=>allSeries.push(s)));
      if(pb.finals) allSeries.push(pb.finals);
      const next = allSeries.find(s => !s.winner);
      if(!next) break;
      await simPlayoffGame(next);
      await new Promise(r => setTimeout(r, 50));
    }
  }

  function startNextSeason() {
    if(freeAgent && !contractOffer) return;
    // D1: bridge ~120 days of healing between seasons (offseason auto-heals most injuries)
    if(injury) {
      const newDays = (injury.daysLeft || 0) - 120;
      if(newDays <= 0) {
        setInjuryLog(prev => [...prev, {name: injury.name, date: new Date().toISOString(), type:"recovered"}]);
        setInjury(null);
      } else {
        setInjury({...injury, daysLeft: newDays});
      }
    }
    setResting(0); // clear any rest counter

    // D9: passive trade check — team may trade the player if relations are bad
    //     or after a major injury, unless teammates / coach love them.
    let curTeam = team;
    let curRels = relationships;
    let curTeammates = teammates;
    const recentBigInjury = injury && (injury.severity === "重伤" || injury.severity === "赛季报销");
    const relsBad = curRels.gm < 25 || curRels.owner < 25;
    const teammatesLove = curRels.teammate > 80 || curRels.coach > 80;
    let passiveTradeChance = 0;
    if(relsBad) passiveTradeChance += 0.5;
    if(recentBigInjury) passiveTradeChance += 0.3;
    if(teammatesLove) passiveTradeChance *= 0.3; // teammates protect you
    if(contract.year > contract.totalYears) passiveTradeChance = 0; // FA — handled elsewhere
    if(passiveTradeChance > 0 && Math.random() < passiveTradeChance) {
      const newTeam = pickTradeDestination(team.abbr, player.overall);
      curTeam = newTeam;
      curTeammates = generateTeammates();
      curRels = {coach:55, gm:50, owner:50, star:45, teammate:60};
      setTeam(newTeam);
      setTeammates(curTeammates);
      setRelationships(curRels);
      setInjuryLog(prev => [...prev, {name:t("trade.injurylog_passive", lang, {abbr: newTeam.abbr}), date: new Date().toISOString(), type:"trade"}]);
      // Show a one-time notification via narrative
      setNarrative(t("trade.passive_headline", lang, {from: teamFull(team.abbr, lang), to: teamFull(newTeam.abbr, lang), reasons: (relsBad ? t("trade.reason_bad_rel", lang) : "") + (recentBigInjury ? t("trade.reason_injury", lang) : "")}));
    }

    // D3: age++ and apply potential decay after 32
    const newAge = (player.age || 19) + 1;
    let decayedCeiling = {...player.ceiling};
    let decayedStats = {...player.stats};
    if(newAge >= 32) {
      // Pick 1-2 random stats to decay
      const statKeys = Object.keys(decayedCeiling);
      const numToDecay = Math.random() < 0.5 ? 1 : 2;
      const shuffled = [...statKeys].sort(() => Math.random() - 0.5);
      for(let i = 0; i < numToDecay; i++) {
        const k = shuffled[i];
        const drop = 1 + Math.floor(Math.random() * 2); // 1-2
        decayedCeiling[k] = Math.max(40, decayedCeiling[k] - drop);
        // Stats may also drop if they were at the old ceiling
        decayedStats[k] = Math.min(decayedStats[k], decayedCeiling[k]);
      }
    }
    setPlayer(prev => ({...prev, age: newAge, ceiling: decayedCeiling, stats: decayedStats, overall: calcOverall(decayedStats)}));

    const ns = season+1; const sy = 2024+(ns-1);
    setSeason(ns); setRegularGames(generateRegularSeason(team,sy));
    setPlayoffBracket(null); setPlayoffRound(0); setPhase("regular"); setOffseasonDone(false);
    setNarrative(""); setCalYear(sy); setCalMonth(9);
    setFreeAgent(false); setSeasonAwards(null); setShowAwards(false); setFaOffers([]);
    // Add salary to savings (after taxes ~40%)
    const annualSavings = contract.salary * 0.6;
    // D11: rent — months were prepaid when player rented. Each season eats 12 months.
    //     If months remaining < 12, charge another year (auto-renew). If player can't afford,
    //     the rental terminates and they're "homeless" (currentRental cleared, no rent charge).
    let nextRent = currentRental;
    let extraRentCharge = 0;
    if(currentRental) {
      const newMonthsLeft = (currentRental.monthsLeft || 0) - 12;
      if(newMonthsLeft <= 0) {
        // Need to renew: pay another year up front
        const annualCost = +(currentRental.monthly * 12).toFixed(2);
        const willHaveAfterSalary = +(savings + annualSavings).toFixed(2);
        if(willHaveAfterSalary >= annualCost) {
          extraRentCharge = annualCost;
          nextRent = {...currentRental, monthsLeft: 12};
        } else {
          // Can't afford renewal → terminate rental
          nextRent = null;
          extraRentCharge = 0;
        }
      } else {
        nextRent = {...currentRental, monthsLeft: newMonthsLeft};
      }
    }
    setCurrentRental(nextRent);
    setSavings(prev => Math.max(0, +(prev + annualSavings - extraRentCharge).toFixed(2)));
    // Generate awards
    const finalsAvg = calcFinalsAvg(playoffBracket, team.abbr);
    const awards = generateSeasonAwards(player.name, team.abbr, "", avg, player.overall, wins, season, playoffBracket, finalsAvg, lang);
    setSeasonAwards(awards);
    setShowAwards(true);
    // Update teammate rapport
    setTeammates(prev=>prev.map(t=>({...t,rapport:Math.min(100,Math.max(0,t.rapport+(wins>41?3:-2)+Math.floor(Math.random()*7)-3))})));
    // Contract advance
    const nc = {...contract, year:contract.year+1};
    if(nc.year > nc.totalYears) {
      // Generate FA offers from ALL teams — interest based on OVR + relationship with current team
      const myOvr = player.overall;
      const allOffers = ALL_TEAMS.map(t => {
        // Interest score: OVR drives base salary, home team gets loyalty bonus
        const isHome = t.abbr === team.abbr;
        const interestBase = Math.max(0.2, (myOvr - 75) / 25); // 0-1 scale
        const interest = isHome ? Math.min(1, interestBase + 0.2) : interestBase * (0.5 + Math.random()*0.6);
        if(interest < 0.25 && !isHome) return null; // low interest teams don't offer
        // D7: FA salaries respect the cap
        const maxAllowed = getMaxSalary(ns);
        const baseSalary = Math.max(3, Math.round((myOvr - 60) * 0.9 + ns * 0.5));
        const salary = Math.min(maxAllowed, Math.round((baseSalary * (0.7 + interest * 0.6)) * 10) / 10);
        const years = Math.floor(Math.random()*3) + (isHome ? 2 : 1);
        return {salary, years, source:t.city+" "+t.name, rivalAbbr:t.abbr, isFA:true, interest:+interest.toFixed(2), isHome};
      }).filter(Boolean).sort((a,b)=>b.salary-a.salary);
      setFaOffers(allOffers);
      // Auto-show home team offer as default
      const homeOffer = allOffers.find(o=>o.isHome) || allOffers[0];
      setContractOffer(homeOffer);
      setContractModal(true);
      setFreeAgent(true);
      nc.year = nc.totalYears;
    }
    setContract(nc);
  }

  const calGames = useMemo(()=>{
    if(phase!=="regular") return [];
    return regularGames.filter(g=>{const d=new Date(g.date);return d.getFullYear()===calYear&&d.getMonth()===calMonth;});
  },[regularGames,phase,calYear,calMonth]);

  const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
  const firstDay = new Date(calYear,calMonth,1).getDay();
  const gamesByDay = {};
  calGames.forEach(g=>{gamesByDay[new Date(g.date).getDate()]=g;});

  function prevMonth() { if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1); }
  function nextMonth() { if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1); }

  const ac = team.accent;
  const tradeDanger = relationships.gm<30||relationships.owner<30;

  // Health status
  function getHealthStatus() {
    if(resting>0) return {label:t("health.rest", lang),color:"#88aaff",icon:"😴",detail:t("health.rest_detail", lang, {n: resting})};
    if(!injury) return {label:t("health.healthy", lang),color:"#00ff88",icon:"✅",detail:t("player.body_no_injury", lang)};
    if(injury.severity==="赛季报销") return {label:t("health.season", lang),color:"#ff2244",icon:"🚑",detail:t("health.detail_days", lang, {name: tx(injury.name, lang), n: injury.daysLeft||0})};
    if(injury.severity==="重伤") return {label:t("health.serious", lang),color:"#ff4444",icon:"🤕",detail:t("health.detail_days", lang, {name: tx(injury.name, lang), n: injury.daysLeft||0})};
    if(injury.severity==="中伤") return {label:t("health.medium", lang),color:"#ff8844",icon:"🤕",detail:t("health.detail_days", lang, {name: tx(injury.name, lang), n: injury.daysLeft||0})};
    return {label:t("health.minor", lang),color:"#ffaa44",icon:"🤕",detail:t("health.detail_days", lang, {name: tx(injury.name, lang), n: injury.daysLeft||0})};
  }
  const health = getHealthStatus();

  async function loadRelStory(key) {
    setRelLoading(true);
    const labs={coach:"主教练",gm:"总经理",owner:"老板",star:"球队核心",teammate:"更衣室"};
    const val=relationships[key];
    const q=val>=70?"融洽":val>=45?"一般":"紧张";
    const txt=await aiCall("NBA剧情叙述者。中文2句话："+player.name+"与"+labs[key]+"关系（值"+val+"/100，"+q+"）。根据好坏写不同故事，真实感强。只输出叙述。", lang);
    setRelStory(prev=>({...prev,[key]:txt||"关系"+q+"，保持职业。"}));
    setRelLoading(false);
  }

  async function doRequestTrade() {
    setTradeLoading(true);
    // D8: actually perform a trade with some probability.
    //     30% accepted → team change. 50% rejected → relations -10/-8.
    //     20% rejected + reputation damage → relations -15/-12.
    const roll = Math.random();
    const tgt = pickTradeDestination(team.abbr, player.overall);
    const txt = await aiCall("NBA剧情叙述者。中文3句话："+player.name+"向"+team.city+team.name+"申请交易，可能去"+tgt.city+tgt.name+"。戏剧性强。只输出叙述。", lang);

    if(roll < 0.30) {
      // Accepted
      setTradeResult(t("trade.headline_player", lang, {team: teamFull(tgt.abbr, lang), story: txt||""}));
      setTeam(tgt);
      setTeammates(generateTeammates());
      setRelationships({coach:55, gm:50, owner:50, star:45, teammate:60}); // fresh start
      setInjuryLog(prev => [...prev, {name:t("trade.injurylog_trade_to", lang, {abbr: tgt.abbr}), date:new Date().toISOString(), type:"trade"}]);
    } else if(roll < 0.80) {
      // Rejected, mild damage
      setTradeResult(t("trade.rejected", lang, {story: txt||""}));
      setRelationships((prev: any) => ({...prev, gm: Math.max(0, prev.gm-10), owner: Math.max(0, prev.owner-8)}));
    } else {
      // Rejected, reputation hit
      setTradeResult(t("trade.leaked", lang, {story: txt||""}));
      setRelationships((prev: any) => ({...prev, gm: Math.max(0, prev.gm-15), owner: Math.max(0, prev.owner-12), teammate: Math.max(0, prev.teammate-8)}));
    }
    setTradeLoading(false);
  }

  const ph = player.physicals||{heightCm:188,wingspanCm:191,wingDelta:3,weightKg:88,staticTraits:["弹跳精英"],dynamicTraits:["挡拆高手"]};

  // D5: retired overlay
  if(retired) {
    return (
      <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{fontSize:64,marginBottom:16}}>🏆</div>
        <div style={{fontSize:11,color:"#f9a01b",letterSpacing:4,marginBottom:8}}>{t("retire.complete", lang)}</div>
        <div style={{fontSize:28,fontWeight:900,marginBottom:6,textAlign:"center"}}>{player.name}</div>
        <div style={{fontSize:13,color:"#aaa",marginBottom:24,textAlign:"center"}}>
          {teamFull(team.abbr, lang)} · {player.position} · {t("app.years_old", lang, {n: player.age})}
        </div>
        <div style={{background:"#111827",borderRadius:12,padding:20,marginBottom:16,minWidth:280,border:"1px solid #ffffff0d"}}>
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10}}>{t("retire.summary", lang)}</div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13}}>
            <span style={{color:"#888"}}>{t("retire.seasons", lang)}</span><span style={{fontWeight:700}}>{season}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13}}>
            <span style={{color:"#888"}}>{t("retire.retire_ovr", lang)}</span><span style={{fontWeight:700,color:"#f9a01b"}}>{player.overall}</span>
          </div>
          {seasonAwards && seasonAwards.iChampion && (
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13}}>
              <span style={{color:"#888"}}>{t("retire.championships", lang)}</span><span style={{color:"#ffd700"}}>{t("retire.at_least_one_champ", lang)}</span>
            </div>
          )}
        </div>
        <button onClick={onQuit}
          style={{padding:"14px 36px",background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"sans-serif"}}>
          {t("retire.return_to_lobby", lang)}
        </button>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:team.color,padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{doSave();onQuit();}} style={{background:"rgba(0,0,0,0.3)",border:"none",color:"#fff",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:"sans-serif",fontSize:12}}>{t("main.save_btn", lang)}</button>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:ac}}>{player.name}</div>
              <div style={{fontSize:11,opacity:0.8}}>{teamFull(team.abbr, lang)} · S{season} · {t("app.years_old", lang, {n: player.age})} · ${contract.salary}M</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:700}}>{t("app.wins_losses", lang, {w: wins, l: played.length-wins})}</div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",fontSize:11}}>
              <span style={{color:ac}}>OVR {player.overall}</span>
              <span style={{color:health.color}}>{health.icon} {health.label}</span>
              {saveMsg && <span style={{color:"#00ff88"}}>{t("main.saved", lang)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Lang toggle pinned to right edge above tabs */}
      <div style={{display:"flex",justifyContent:"flex-end",padding:"4px 10px",background:"#0d0d14"}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",background:"#0d0d14",borderBottom:"1px solid #ffffff0d",overflowX:"auto"}}>
        {[["calendar","tab.calendar"],["playoffs","tab.playoffs"],["standings","tab.standings"],["player","tab.player"],["stats","tab.stats"],["offseason","tab.offseason"],["relations","tab.relations"],["agent","tab.agent"],["finances","tab.finances"]].map(([v,k])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{flex:"0 0 auto",padding:"11px 12px",background:"transparent",border:"none",borderBottom:view===v?"2px solid "+ac:"2px solid transparent",color:view===v?ac:"#555",fontSize:11,fontWeight:view===v?700:400,cursor:"pointer",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>
            {t(k, lang)}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {tradeDanger && (
        <div style={{background:"#2a0d0d",padding:"8px 16px",fontSize:12,color:"#ff8888",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{t("alert.trade_danger", lang)}</span>
          <button onClick={()=>setView("relations")} style={{background:"transparent",border:"1px solid #ff8888",color:"#ff8888",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>{t("alert.trade_view", lang)}</button>
        </div>
      )}
      {pendingBrand && (
        <div style={{background:"#0d2a1a",padding:"10px 16px",margin:"8px 14px",borderRadius:10,border:"1px solid #00ff8844",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#00ff88"}}>{t("alert.brand_offer", lang)}</div>
            <div style={{fontSize:12,color:"#aaa"}}>{pendingBrand.icon} {pendingBrand.name}（{tx(pendingBrand.type, lang)}）→ ${pendingBrand.offer}M/年</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setBrands(prev=>[...prev,pendingBrand]);setPendingBrand(null);}} style={{padding:"6px 12px",background:"#00ff88",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("alert.accept", lang)}</button>
            <button onClick={()=>setPendingBrand(null)} style={{padding:"6px 10px",background:"#333",border:"none",borderRadius:8,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("alert.reject", lang)}</button>
          </div>
        </div>
      )}

      {/* ════ PLAYOFFS ════ */}
      {view==="playoffs" && (
        <div style={{padding:14}}>
          {!seasonOver && !playoffBracket && (
            <div style={{background:"#111827",borderRadius:12,padding:24,textAlign:"center",border:"1px solid #ffffff0d"}}>
              <div style={{fontSize:28,marginBottom:10}}>🏀</div>
              <div style={{fontSize:14,color:"#888"}}>{t("playoffs.empty_waiting", lang)}</div>
              <div style={{fontSize:12,color:"#555",marginTop:6}}>{t("playoffs.empty_games_left", lang, {n: regularGames.filter(g=>g.status==="upcoming").length})}</div>
            </div>
          )}
          {playoffBracket && (
            <PlayoffView
              bracket={playoffBracket}
              myTeam={team}
              onSimGame={simPlayoffGame}
              simming={simming}
              onOffseason={async ()=>{
                // D6: auto-finish any remaining playoff games before entering offseason
                if(!playoffBracket?.champion) { await autoSimAllPlayoffs(); }
                setPhase("offseason");
              }}
              onAutoSimAll={autoSimAllPlayoffs}
              ac={ac}
              narrative={narrative}
              narrativeCtx={narrativeCtx}
            />
          )}          {!playoffBracket && seasonOver && (
            <div style={{marginTop:10,textAlign:"center"}}>
              <button onClick={()=>{
                const st=generateLeagueStandings(team,regularGames);
                const pb=buildNBAPlayoffBracket(st,team.abbr,2024+(season-1));
                setLeagueStandings(st); setPlayoffBracket(pb);
              }} style={{padding:"12px 28px",background:team.color,border:"2px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>
                {t("playoffs.generate_bracket", lang)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════ STANDINGS ════ */}
      {view==="standings" && (
        <StandingsView standings={generateLeagueStandings(team,regularGames)} myTeamAbbr={team.abbr} ac={ac}/>
      )}

      {view==="player" && (
        <div style={{padding:14}}>
          {/* Health Card */}
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid "+health.color+"44"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>{t("player.health_title", lang)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:health.color}}>{health.icon} {health.label}</div>
                <div style={{fontSize:12,color:"#888",marginTop:4}}>{health.detail}</div>
                {injury && <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{t("player.injury_affected", lang)}{injury.affectedStats.map(s=>STAT_LABELS[s]).join("、")}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                {!injury && resting===0 && (
                  <button onClick={()=>setRestModal(true)}
                    style={{padding:"8px 14px",background:"#1a1a2e",border:"1px solid #88aaff44",borderRadius:10,color:"#88aaff",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>
                    😴 申请休战
                  </button>
                )}
                {resting>0 && (
                  <button onClick={()=>setResting(0)}
                    style={{padding:"8px 14px",background:"#1a1a2e",border:"1px solid #ffaa4444",borderRadius:10,color:"#ffaa44",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>
                    取消休战
                  </button>
                )}
              </div>
            </div>
            {/* Health bar */}
            <div style={{height:8,background:"#1a1a2e",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:(resting>0?60:injury?Math.max(20,(1-injury.gamesLeft/60)*100):100)+"%",background:health.color,borderRadius:4,transition:"width 0.5s"}}/>
            </div>
          </div>

          {/* Static Physicals */}
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>{t("player.body_static", lang)}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>{t("create.height", lang)}</div>
                <div style={{fontSize:17,fontWeight:700,color:ac}}>{ph.heightCm}<span style={{fontSize:11,color:"#666"}}>cm</span></div>
              </div>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>{t("create.wingspan", lang)}</div>
                <div style={{fontSize:17,fontWeight:700,color:"#ccc"}}>{ph.wingspanCm}<span style={{fontSize:11,color:"#666"}}>cm</span></div>
                <div style={{fontSize:9,color:ph.wingDelta>=6?"#00ff88":ph.wingDelta<0?"#ff8888":"#888"}}>{ph.wingDelta>0?"+"+ph.wingDelta:ph.wingDelta}cm</div>
              </div>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>{t("create.weight", lang)}</div>
                <div style={{fontSize:17,fontWeight:700,color:"#ccc"}}>{ph.weightKg}<span style={{fontSize:11,color:"#666"}}>kg</span></div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ph.staticTraits.map((t,i)=>(
                <div key={i} style={{background:"#f9a01b22",borderRadius:20,padding:"5px 14px",fontSize:12,color:"#f9a01b",border:"1px solid #f9a01b33"}}>{t}</div>
              ))}
            </div>
          </div>

          {/* Dynamic Traits */}
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>{t("player.body_dynamic", lang)}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ph.dynamicTraits.map((t,i)=>(
                <div key={i} style={{background:ac+"22",borderRadius:20,padding:"6px 14px",fontSize:12,color:ac,border:"1px solid "+ac+"33"}}>{t}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:"#555",marginTop:10}}>{t("player.dynamic_note", lang)}</div>
          </div>

          {/* Injury history */}
          {injuryLog.length>0 && (
            <div style={{background:"#111827",borderRadius:12,padding:16,border:"1px solid #ffffff0d"}}>
              <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>{t("player.injury_history", lang)}</div>
              {injuryLog.slice(-5).reverse().map((inj,i)=>(
                <div key={i} style={{fontSize:12,color:inj.type==="injured"?"#ff8888":"#88ff88",padding:"6px 0",borderBottom:"1px solid #ffffff06"}}>
                  {inj.type==="injured"?"🔴":"🟢"} {inj.name} {fmtDate(inj.date)} {inj.games?"("+inj.games+"场)":"(已愈)"}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ CALENDAR ════ */}
      {view==="calendar" && (
        <div style={{padding:14}}>
          {/* Season status banner */}
          {seasonOver && phase==="regular" && (
            <div style={{background:"#0d1a2a",borderRadius:10,padding:12,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid "+ac+"44"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:ac}}>{t("cal.regular_season_done", lang)}</div>
                <div style={{fontSize:11,color:"#888"}}>{t("cal.go_playoffs", lang)}</div>
              </div>
              <button onClick={()=>setView("playoffs")} style={{padding:"8px 16px",background:team.color,border:"1px solid "+ac,borderRadius:8,color:ac,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("cal.to_playoffs", lang)}</button>
            </div>
          )}
          {phase==="offseason" && (
            <div style={{background:"#1a1a0d",borderRadius:10,padding:12,marginBottom:10,border:"1px solid #f9a01b44"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#f9a01b"}}>{t("cal.offseason_title", lang)}</div>
                  <div style={{fontSize:11,color:"#888"}}>{t("cal.offseason_hint", lang)}</div>
                </div>
                <div style={{display:"flex",gap:8,flexDirection:"column",alignItems:"flex-end"}}>
                  {seasonAwards && <button onClick={()=>setShowAwards(true)} style={{padding:"6px 12px",background:"#ffd70022",border:"1px solid #ffd70044",borderRadius:8,color:"#ffd700",fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>{t("cal.see_awards", lang)}</button>}
                  {offseasonDone && !freeAgent && <button onClick={startNextSeason} style={{padding:"6px 12px",background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>{t("cal.start_next_season", lang, {n: season+1})}</button>}
                  {freeAgent && <button onClick={()=>setContractModal(true)} style={{padding:"6px 12px",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:8,color:"#ff8888",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{t("cal.fa_waiting", lang)}</button>}
                </div>
              </div>
            </div>
          )}
          {injury && (
            <div style={{background:"#2a0d0d",borderRadius:10,padding:"9px 14px",marginBottom:10,border:"1px solid #ff444444"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#ff6b6b"}}>{t("cal.injury_banner", lang, {name: tx(injury.name, lang), n: injury.daysLeft||0})}</div>
            </div>
          )}

          {/* Month nav — always visible */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <button onClick={prevMonth} style={{background:"#111827",border:"1px solid #ffffff22",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"sans-serif"}}>‹</button>
            <div style={{fontSize:14,fontWeight:700}}>{fmtMonthLabel(calYear,calMonth)}</div>
            <button onClick={nextMonth} style={{background:"#111827",border:"1px solid #ffffff22",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"sans-serif"}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:3}}>
            {t("cal.weekdays", lang).split(",").map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:10,color:"#444",padding:"3px 0"}}>{d}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const day = i+1;
              const g = gamesByDay[day];
              const isUp = g&&g.status==="upcoming";
              const isW = g&&g.status==="won";
              const isL = g&&g.status==="lost";
              const canSim = g&&isUp&&phase==="regular";
              return (
                <div key={day} onClick={()=>setDayModal({day,game:g||null})}
                  style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:7,
                    background:g?(isW?"#0d2a1a":isL?"#2a0d0d":"#0d1a2a"):"#111827",
                    border:"1px solid "+(g?(isW?"#00ff8855":isL?"#ff444455":ac+"55"):"#ffffff0a"),cursor:"pointer"}}>
                  <div style={{fontSize:11,fontWeight:g?700:400,color:g?(isW?"#00ff88":isL?"#ff5555":ac):"#555"}}>{day}</div>
                  {g && <div style={{fontSize:8,color:"#aaa"}}>{g.opp}</div>}
                  {g&&isUp && <div style={{fontSize:7,color:ac}}>▶</div>}
                  {g&&!isUp && <div style={{fontSize:7,color:isW?"#00ff88":"#ff5555"}}>{isW?"W":"L"}</div>}
                </div>
              );
            })}
          </div>

          {/* Sim buttons only when regular season has games left */}
          {phase==="regular" && (
            <div style={{display:"flex",gap:8,marginTop:10}}>
              {calGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=calGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);}} disabled={simming}
                  style={{flex:1,padding:"11px 0",fontSize:12,fontWeight:700,background:simming?"#222":team.color,border:"2px solid "+(simming?"#333":ac),color:simming?"#444":ac,borderRadius:9,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  {simming?"模拟中...":"▶▶ 本月"}
                </button>
              )}
              {regularGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=regularGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);}} disabled={simming}
                  style={{flex:1,padding:"11px 0",fontSize:12,fontWeight:700,background:"transparent",border:"1px solid #ffffff22",color:"#666",borderRadius:9,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  ⏩ 剩余常规赛
                </button>
              )}
            </div>
          )}

          {narrative && (
            <div style={{marginTop:12,background:"#0f1923",borderRadius:12,padding:14,borderLeft:"4px solid "+ac}}>
              {narrativeCtx && <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:11,color:"#aaa"}}>vs {narrativeCtx.opp} {fmtDate(narrativeCtx.date)}</div>
                <div style={{fontSize:12,fontWeight:700,color:narrativeCtx.status==="won"?"#00ff88":"#ff5555"}}>{narrativeCtx.stats?.rested?"休战":narrativeCtx.status==="won"?"W · "+narrativeCtx.stats?.pts+"分":"L · "+narrativeCtx.stats?.pts+"分"}</div>
              </div>}
              <div style={{fontSize:13,color:"#ddd",lineHeight:1.7,whiteSpace:"pre-line"}}>{narrative}</div>
            </div>
          )}
          {played.length>0 && (
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,color:"#555",letterSpacing:1,marginBottom:6}}>{t("cal.recent", lang)}</div>
              {played.slice(-4).reverse().map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#111827",borderRadius:8,marginBottom:5,border:"1px solid "+(g.status==="won"?"#00ff8818":"#ff44441a")}}>
                  <div style={{fontSize:12,fontWeight:700,color:g.status==="won"?"#00ff88":"#ff5555",minWidth:16}}>{g.status==="won"?"W":"L"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#ccc"}}>vs {g.opp}{g.stats?.rested&&<span style={{color:"#88aaff",fontSize:10}}> {t("cal.rested_marker", lang)}</span>}{g.stats?.injured&&<span style={{color:"#ff8888",fontSize:10}}> 🤕</span>}</div>
                    <div style={{fontSize:10,color:"#555"}}>{fmtDate(g.date)} {g.home?"主场":"客场"}</div>
                  </div>
                  {g.stats && !g.stats.rested && <div style={{display:"flex",gap:7,fontSize:12}}><span style={{color:ac}}>{g.stats.pts}分</span><span style={{color:"#666"}}>{g.stats.ast}助</span><span style={{color:"#666"}}>{g.stats.reb}篮</span></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ STATS ════ */}
      {view==="stats" && (
        <div style={{padding:14}}>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:4}}>{t("stats.overall", lang)}</div>
            <div style={{fontSize:50,fontWeight:900,color:ac,lineHeight:1}}>{player.overall}</div>
            <div style={{fontSize:12,color:"#555"}}>OVR · {player.archetype} · S{season}</div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>{t("stats.attr_and_ceiling", lang)}</div>
            {Object.entries(player.stats).map(([k,v])=>{
              const eff = injury&&injury.affectedStats.includes(k)?Math.max(28,Math.round(v*0.68)):v;
              return (
                <div key={k}>
                  <StatBar label={tx(STAT_LABELS[k], lang)} value={eff} ceiling={player.ceiling[k]} max={99} color={injury&&injury.affectedStats.includes(k)?"#ff6b6b":ac}/>
                  {injury&&injury.affectedStats.includes(k) && <div style={{fontSize:10,color:"#ff8888",marginTop:-6,marginBottom:6}}>🤕 {t("stats.injury_orig", lang, {v: v})}</div>}
                </div>
              );
            })}
            <div style={{fontSize:10,color:"#333",marginTop:6}}>{t("stats.ceiling_note", lang)}</div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>{t("stats.season_avg", lang)}</div>
            {played.filter(g=>!g.stats?.rested).length===0 ? <div style={{fontSize:13,color:"#444",textAlign:"center",padding:"12px 0"}}>{t("stats.no_records", lang)}</div> :
              [["得分",avg.pts,40],["助攻",avg.ast,15],["篮板",avg.reb,20],["抢断",avg.stl,5],["盖帽",avg.blk,5]].map(([l,v,m])=>(<StatBar key={l} label={l} value={v} max={m} color={ac}/>))}
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>{t("stats.growth_room", lang)}</div>
            {Object.entries(player.stats).map(([k,v])=>{
              const cap=player.ceiling[k], gap=cap-v;
              const lbl=gap>20?"🔴 重点提升":gap>10?"🟡 有空间":"🟢 接近上限";
              return (
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #ffffff06"}}>
                  <span style={{fontSize:13,color:"#ccc"}}>{tx(STAT_LABELS[k], lang)}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:700,color:ac}}>{v}</span>
                    <span style={{fontSize:11,color:"#444"}}>→</span>
                    <span style={{fontSize:13,color:"#666"}}>{cap}</span>
                    <span style={{fontSize:11}}>{lbl}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ TRAINING ════ */}
      {view==="offseason" && (
        <div style={{padding:14}}>
          {phase==="offseason" && !offseasonDone ? (
            <div>
              <div style={{background:"#111827",borderRadius:12,padding:14,marginBottom:14,border:"1px solid #ffffff0d"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:14,fontWeight:700}}>{t("training.points_title", lang)}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{t("training.points_note", lang, {n: maxTrainPoints})}</div></div>
                  <div style={{fontSize:28,fontWeight:900,color:ac}}>{maxTrainPoints-totalAlloc}</div>
                </div>
              </div>
              {TRAINING_OPTIONS.map(opt=>{
                const alloc=trainAlloc[opt.stat], cur=player.stats[opt.stat], cap=player.ceiling[opt.stat];
                const proj=Math.min(cap,cur+alloc*2), atCap=cur>=cap;
                return (
                  <div key={opt.id} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(alloc>0?ac+"44":"#ffffff0d"),opacity:atCap?0.4:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:14,fontWeight:700}}>{opt.icon} {tx(opt.label, lang)}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{tx(opt.desc, lang)}{atCap?t("training.at_cap", lang):""}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#666"}}>{tx(STAT_LABELS[opt.stat], lang)} /{cap}</div><div style={{fontSize:15,fontWeight:700,color:alloc>0?"#00ff88":ac}}>{cur}{alloc>0&&<span style={{fontSize:12,color:"#00ff88"}}> → {proj}</span>}</div></div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button onClick={()=>allocTrain(opt.stat,-1)} disabled={alloc===0||atCap}
                        style={{width:34,height:34,borderRadius:8,background:"#1a1a2e",border:"1px solid #ffffff22",color:(alloc===0||atCap)?"#333":"#fff",fontSize:18,cursor:(alloc===0||atCap)?"not-allowed":"pointer",fontFamily:"sans-serif"}}>−</button>
                      <div style={{flex:1,height:7,background:"#1a1a2e",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:(alloc/maxTrainPoints*100)+"%",background:ac,transition:"width 0.3s"}}/></div>
                      <div style={{fontSize:14,fontWeight:700,color:ac,minWidth:18,textAlign:"center"}}>{alloc}</div>
                      <button onClick={()=>allocTrain(opt.stat,1)} disabled={totalAlloc>=maxTrainPoints||atCap}
                        style={{width:34,height:34,borderRadius:8,background:(totalAlloc>=maxTrainPoints||atCap)?"#111":"#1a2a1a",border:"1px solid "+((totalAlloc>=maxTrainPoints||atCap)?"#333":ac+"44"),color:(totalAlloc>=maxTrainPoints||atCap)?"#333":ac,fontSize:18,cursor:(totalAlloc>=maxTrainPoints||atCap)?"not-allowed":"pointer",fontFamily:"sans-serif"}}>+</button>
                    </div>
                  </div>
                );
              })}
              {/* B22: always enabled — when totalAlloc===0 the button skips training. */}
              <button onClick={confirmTraining}
                style={{width:"100%",padding:"15px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:12,color:"#000",cursor:"pointer",fontFamily:"sans-serif",marginTop:4}}>
                {totalAlloc>0?t("training.confirm", lang):t("training.skip_and_start", lang)}
              </button>
            </div>
          ) : offseasonDone ? (
            <div>
              <div style={{background:"#1a2a1a",borderRadius:12,padding:20,border:"1px solid #00ff8844",textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:24,marginBottom:8}}>✅</div>
                <div style={{fontSize:15,fontWeight:700,color:"#00ff88"}}>{t("training.completed", lang, {ovr: player.overall})}</div>
                <div style={{fontSize:13,color:"#888",marginTop:6}}>{t("training.go_calendar", lang)}</div>
              </div>
              {/* D5: retire button */}
              <button onClick={()=>setRetireModal(true)} style={{width:"100%",padding:"12px 0",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:10,color:"#ff8888",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif"}}>
                {t("training.retire", lang)}
              </button>
            </div>
          ) : (
            <div style={{background:"#1a1a0d",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #f9a01b44"}}>
              <div style={{fontSize:14,color:"#f9a01b"}}>{t("training.closed_during_season", lang)}</div>
            </div>
          )}
        </div>
      )}

      {/* ════ RELATIONS ════ */}
      {view==="relations" && (
        <div style={{padding:14}}>
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:12}}>{t("rel.title", lang)}</div>
          {PERSON_TYPES.map(pt=>{
            const val=relationships[pt.key];
            const q=val>=70?"融洽":val>=45?"一般":"紧张";
            const col=val>=70?"#00ff88":val>=45?"#f9a01b":"#ff5555";
            return (
              <div key={pt.key} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(val<30?"#ff444444":"#ffffff0d")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div style={{fontSize:15,fontWeight:700}}>{pt.icon} {tx(pt.label, lang)}</div><div style={{fontSize:11,color:col,marginTop:2}}>{q} · {val}/100</div></div>
                  <button onClick={async()=>{setRelModal(pt.key);if(!relStory[pt.key])await loadRelStory(pt.key);}}
                    style={{padding:"6px 12px",background:"#1a1a2e",border:"1px solid "+ac+"44",borderRadius:8,color:ac,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("rel.detail", lang)}</button>
                </div>
                <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:val+"%",background:col,borderRadius:3,transition:"width 0.5s"}}/></div>
                {val<30 && <div style={{fontSize:11,color:"#ff6b6b",marginTop:6}}>{t("rel.very_bad", lang)}</div>}
              </div>
            );
          })}

          {/* Teammates */}
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10,marginTop:4}}>{t("rel.teammates_title", lang)}</div>
          {teammates.map((tm,i)=>{
            const col=tm.rapport>=70?"#00ff88":tm.rapport>=45?"#f9a01b":"#ff5555";
            const q=tm.rapport>=70?"兄弟":tm.rapport>=45?"普通":"不和";
            return (
              <div key={tm.id} style={{background:"#111827",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #ffffff0d"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>🏀 {tm.name}</div>
                    <div style={{fontSize:11,color:"#555"}}>{tx(tm.role, lang)} · OVR {tm.ovr}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:col,fontWeight:700}}>{q}</div>
                    <div style={{fontSize:10,color:"#555"}}>{tm.rapport}/100</div>
                  </div>
                </div>
                <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:tm.rapport+"%",background:col,borderRadius:3}}/>
                </div>
              </div>
            );
          })}

          {/* Trade request */}
          <div style={{background:"#111827",borderRadius:12,padding:14,marginTop:4,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{t("rel.trade_title", lang)}</div>
            <div style={{fontSize:12,color:"#666",marginBottom:10}}>{t("rel.trade_note", lang)}</div>
            {tradeResult ? (
              <div>
                <div style={{background:"#0f1923",borderRadius:10,padding:12,borderLeft:"4px solid #f9a01b",marginBottom:10}}>
                  <div style={{fontSize:13,color:"#ddd",lineHeight:1.6}}>{tradeResult}</div>
                </div>
                <button onClick={()=>setTradeResult(null)} style={{padding:"6px 14px",background:"#333",border:"none",borderRadius:8,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.close", lang)}</button>
              </div>
            ) : (
              <button onClick={doRequestTrade} disabled={tradeLoading}
                style={{width:"100%",padding:"12px 0",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:10,color:"#ff8888",fontSize:13,fontWeight:700,cursor:tradeLoading?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                {tradeLoading?"处理中...":"📤 申请交易"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════ AGENT ════ */}
      {view==="agent" && (
        <div style={{padding:14}}>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:14,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>{t("agent.contract_now", lang)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:ac}}>${contract.salary}M / 年</div>
                <div style={{fontSize:12,color:"#666"}}>{contract.type==="rookie"?"新秀合同":"标准合同"} · 第{contract.year}/{contract.totalYears}年</div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,color:"#888"}}>{t("agent.years_left", lang, {n: Math.max(0, contract.totalYears - contract.year)})}</div></div>
            </div>
            {contract.year>=contract.totalYears && !contractOffer && (
              <button onClick={()=>{const base=Math.max(8,Math.round((player.overall-60)*0.9+season*0.5));const yrs=Math.floor(Math.random()*3)+2;setContractOffer({salary:base,years:yrs});setContractModal(true);}}
                style={{width:"100%",marginTop:12,padding:"10px 0",background:team.color,border:"1px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                {t("agent.start_extension", lang)}
              </button>
            )}
          </div>
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10}}>{t("agent.brand_collab", lang)}</div>
          {brands.length===0 ? (
            <div style={{background:"#111827",borderRadius:12,padding:20,textAlign:"center",color:"#444",marginBottom:12}}>
              <div style={{fontSize:28,marginBottom:8}}>📦</div>
              <div>{t("agent.no_brand", lang)}</div>
              <div style={{fontSize:12,marginTop:4}}>{t("agent.brand_hint", lang)}</div>
            </div>
          ) : brands.map((b,i)=>(
            <div key={i} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid #ffffff0d",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{b.icon} {b.name}</div><div style={{fontSize:12,color:"#888"}}>{tx(b.type, lang)}</div></div>
              <div style={{fontSize:16,fontWeight:700,color:"#00ff88"}}>${b.offer}M/年</div>
            </div>
          ))}
          <div style={{background:"#0f1923",borderRadius:10,padding:14,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",marginBottom:6}}>{t("agent.annual_income", lang)}</div>
            <div style={{fontSize:22,fontWeight:700,color:"#ffd700"}}>${(contract.salary+brands.reduce((a,b)=>a+b.offer,0)).toFixed(1)}M</div>
            <div style={{fontSize:11,color:"#555"}}>{t("agent.contract_endorsement_breakdown", lang, {c: contract.salary, b: brands.reduce((a:number,b:any)=>a+b.offer,0).toFixed(1)})}</div>
          </div>
        </div>
      )}

      {/* ════ FINANCES ════ */}
      {view==="finances" && (
        <div style={{padding:14}}>
          {/* Net worth summary */}
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:4}}>{t("fin.personal_wealth", lang)}</div>
            <div style={{fontSize:38,fontWeight:900,color:"#ffd700"}}>${savings.toFixed(2)}M</div>
            <div style={{fontSize:12,color:"#555",marginTop:2}}>{t("fin.savings_note", lang)}</div>
            {currentRental && <div style={{fontSize:11,color:"#f9a01b",marginTop:4}}>{t("fin.renting", lang, {name: tx(currentRental.name, lang), cost: (currentRental.monthly*12).toFixed(2), n: currentRental.monthsLeft||12})}</div>}
            {ownedHouse && <div style={{fontSize:11,color:"#00ff88",marginTop:4}}>{t("fin.owned_house", lang, {name: tx(ownedHouse.name, lang), city: ownedHouse.city})}</div>}
          </div>

          {/* Housing */}
          <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>{t("fin.housing", lang)}</div>
          <div style={{background:"#111827",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:12,color:"#666",marginBottom:10}}>{t("fin.current_city", lang, {city: teamCity(team.abbr, lang)})}</div>
            {!ownedHouse && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>{t("fin.rent_options", lang)}</div>
                {RENT_OPTIONS.map(r=>{
                  const isRenting = currentRental?.id===r.id;
                  const canAfford = savings >= r.monthly;
                  return (
                    <div key={r.id} style={{background:isRenting?"#1a2a0d":"#0d1117",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid "+(isRenting?"#00ff8844":"#ffffff0d"),display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,color:isRenting?"#00ff88":"#ccc"}}>{r.icon} {tx(r.name, lang)}</div>
                        <div style={{fontSize:10,color:"#555"}}>{t("fin.rent_per_year", lang, {desc: tx(r.desc, lang), cost: (r.monthly*12).toFixed(2)})}</div>
                      </div>
                      <button onClick={()=>{
                        if(isRenting) {
                          setCurrentRental(null);
                        } else {
                          // D11: prepay 12 months upfront. Auto-renew at season end if affordable.
                          const cost = +(r.monthly * 12).toFixed(2);
                          if(savings < cost) { alert(t("fin.cant_afford_year", lang, {n: cost})); return; }
                          setSavings((s: number) => +(s - cost).toFixed(2));
                          setCurrentRental({...r, monthsLeft: 12, prepaid: cost});
                        }
                      }} style={{padding:"5px 12px",background:isRenting?"#2a0d0d":"#1a2a1a",border:"1px solid "+(isRenting?"#ff444444":"#00ff8844"),borderRadius:8,color:isRenting?"#ff8888":"#00ff88",fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>
                        {isRenting?t("fin.unrent", lang):t("fin.rent", lang)}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>{t("fin.buy_in_city", lang, {city: teamCity(team.abbr, lang)})}</div>
            {HOUSES.map(h=>{
              const affordable = savings >= h.price;
              const isOwned = ownedHouse?.id===h.id;
              return (
                <div key={h.id} style={{background:isOwned?"#1a2a0d":"#0d1117",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid "+(isOwned?"#00ff8844":affordable?"#ffffff11":"#ffffff05"),display:"flex",justifyContent:"space-between",alignItems:"center",opacity:affordable||isOwned?1:0.5}}>
                  <div>
                    <div style={{fontSize:13,color:isOwned?"#00ff88":affordable?"#ccc":"#555"}}>{h.icon} {tx(h.name, lang)}</div>
                    <div style={{fontSize:10,color:"#555"}}>{tx(h.desc, lang)} · ${h.price}M</div>
                  </div>
                  {isOwned ? (
                    <button onClick={()=>{setSavings(prev=>+(prev+h.price*0.85).toFixed(2));setOwnedHouse(null);}} style={{padding:"5px 10px",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:8,color:"#ff8888",fontSize:10,cursor:"pointer",fontFamily:"sans-serif"}}>{t("fin.sell", lang)}</button>
                  ) : (
                    <button disabled={!affordable} onClick={()=>{setSavings(prev=>+(prev-h.price).toFixed(2));setOwnedHouse({...h,city:team.city});setCurrentRental(null);}} style={{padding:"5px 10px",background:affordable?"#1a2a1a":"#111",border:"1px solid "+(affordable?"#00ff8844":"#ffffff05"),borderRadius:8,color:affordable?"#00ff88":"#333",fontSize:11,cursor:affordable?"pointer":"not-allowed",fontFamily:"sans-serif"}}>
                      {affordable?"购买":"资金不足"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cars */}
          <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>{t("fin.car_label", lang)}</div>
          <div style={{background:"#111827",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #ffffff0d"}}>
            {ownedCars.length>0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#888",marginBottom:6}}>{t("fin.owned_cars", lang)}</div>
                {ownedCars.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #ffffff06"}}>
                    <div style={{fontSize:13,color:"#00ff88"}}>{c.icon} {tx(c.name, lang)}</div>
                    <button onClick={()=>{setSavings(prev=>+(prev+c.price*0.7).toFixed(2));setOwnedCars(prev=>prev.filter((_,j)=>j!==i));}} style={{padding:"4px 10px",background:"#2a0d0d",border:"1px solid #ff444422",borderRadius:6,color:"#ff8888",fontSize:10,cursor:"pointer",fontFamily:"sans-serif"}}>{t("fin.sell", lang)}</button>
                  </div>
                ))}
              </div>
            )}
            {CARS.map(c=>{
              const affordable = savings >= c.price;
              const owned = ownedCars.find(x=>x.id===c.id);
              if(owned) return null;
              return (
                <div key={c.id} style={{background:"#0d1117",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid "+(affordable?"#ffffff11":"#ffffff05"),display:"flex",justifyContent:"space-between",alignItems:"center",opacity:affordable?1:0.5}}>
                  <div>
                    <div style={{fontSize:13,color:affordable?"#ccc":"#555"}}>{c.icon} {tx(c.name, lang)}</div>
                    <div style={{fontSize:10,color:"#555"}}>{tx(c.desc, lang)} · ${c.price}M</div>
                  </div>
                  <button disabled={!affordable} onClick={()=>{setOwnedCars(prev=>{if(prev.find(x=>x.id===c.id))return prev;setSavings(s=>+(s-c.price).toFixed(2));return [...prev,c];});}} style={{padding:"5px 12px",background:affordable?"#1a2a1a":"#111",border:"1px solid "+(affordable?"#00ff8844":"#ffffff05"),borderRadius:8,color:affordable?"#00ff88":"#333",fontSize:11,cursor:affordable?"pointer":"not-allowed",fontFamily:"sans-serif"}}>
                    {affordable?"购买":"资金不足"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ DAY MODAL ════ */}
      {/* D5: retire confirmation modal */}
      {retireModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:380,border:"1px solid #ff444444"}}>
            <div style={{fontSize:36,textAlign:"center",marginBottom:12}}>🏁</div>
            <div style={{fontSize:17,fontWeight:800,marginBottom:8,textAlign:"center"}}>{t("retire.confirm_title", lang)}</div>
            <div style={{fontSize:13,color:"#aaa",lineHeight:1.7,marginBottom:20}}>
              {t("retire.confirm_subtitle", lang, {name: player.name, age: player.age, n: season})}<br/>
              {t("retire.career_ovr", lang, {ovr: player.overall})}<br/>
              {seasonAwards && seasonAwards.iChampion ? t("retire.champ_note", lang) : ""}<br/>
              <span style={{color:"#ff8888"}}>{t("retire.warn_backup", lang)}</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setRetired(true); setRetireModal(false); doSave();}}
                style={{flex:1,padding:"12px 0",background:"#ff4444",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>
                确认退役
              </button>
              <button onClick={()=>setRetireModal(false)}
                style={{flex:1,padding:"12px 0",background:"#222",border:"none",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                再想想
              </button>
            </div>
          </div>
        </div>
      )}

      {dayModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setDayModal(null)}>
          <div style={{background:"#111827",borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{t("cal.day_month", lang, {m: calMonth+1, d: dayModal.day})}</div>
            {dayModal.game ? (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,color:ac,marginBottom:4}}>{dayModal.game.home?t("cal.home", lang):t("cal.away", lang)} {t("cal.vs", lang)} {teamName(dayModal.game.opp, lang)}</div>
                {dayModal.game.status!=="upcoming" && <div style={{fontSize:12,color:dayModal.game.status==="won"?"#00ff88":"#ff5555"}}>{dayModal.game.status==="won"?t("cal.win", lang):t("cal.loss", lang)}{dayModal.game.stats&&!dayModal.game.stats.rested?" · "+dayModal.game.stats.pts+"分 "+dayModal.game.stats.ast+"助 "+dayModal.game.stats.reb+"篮":" "+t("cal.rested_marker", lang)}</div>}
              </div>
            ) : <div style={{fontSize:13,color:"#555",marginBottom:14}}>{t("cal.no_game_today", lang)}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {dayModal.game&&dayModal.game.status==="upcoming" && (
                <button onClick={async()=>{await simulateUpTo(dayModal.game.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"13px 0",background:team.color,border:"2px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:14,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  {t("cal.sim_to_this", lang)}
                </button>
              )}
              {calGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=calGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"12px 0",background:"#1a2a1a",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  {t("cal.sim_all_month", lang)}
                </button>
              )}
              {regularGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=regularGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"12px 0",background:"#1a1a2e",border:"1px solid #ffffff22",borderRadius:10,color:"#888",fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  {t("cal.sim_remaining", lang)}
                </button>
              )}
              <button onClick={()=>setDayModal(null)} style={{width:"100%",padding:"10px 0",background:"transparent",border:"1px solid #ffffff11",borderRadius:10,color:"#555",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.close", lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ REST MODAL ════ */}
      {restModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:360,border:"1px solid #88aaff44"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{t("rest.title", lang)}</div>
            <div style={{fontSize:13,color:"#888",marginBottom:20}}>{t("rest.body", lang)}</div>
            <div style={{fontSize:11,color:"#aaa",marginBottom:8}}>{t("rest.input_label", lang)}</div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <button onClick={()=>setRestInput(Math.max(1,restInput-1))} style={{width:40,height:40,borderRadius:10,background:"#1a1a2e",border:"1px solid #ffffff22",color:"#fff",fontSize:20,cursor:"pointer",fontFamily:"sans-serif"}}>−</button>
              <div style={{flex:1,textAlign:"center",fontSize:32,fontWeight:900,color:"#88aaff"}}>{restInput}</div>
              <button onClick={()=>setRestInput(Math.min(20,restInput+1))} style={{width:40,height:40,borderRadius:10,background:"#1a1a2e",border:"1px solid #88aaff44",color:"#88aaff",fontSize:20,cursor:"pointer",fontFamily:"sans-serif"}}>+</button>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setResting(restInput);setRestModal(false);}} style={{flex:1,padding:"12px 0",background:"#88aaff",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>{t("rest.confirm_n", lang, {n: restInput})}</button>
              <button onClick={()=>setRestModal(false)} style={{flex:1,padding:"12px 0",background:"#222",border:"none",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.cancel", lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ REL MODAL ════ */}
      {relModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}} onClick={()=>setRelModal(null)}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:400,border:"1px solid #ffffff11"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>{PERSON_TYPES.find(p=>p.key===relModal)?.icon} {PERSON_TYPES.find(p=>p.key===relModal)?.label}</div>
            <div style={{background:"#0f1923",borderRadius:10,padding:12,marginBottom:14,minHeight:60}}>
              <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>{relLoading?"加载中...":(relStory[relModal]||"点击「刷新」获取故事")}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>loadRelStory(relModal)} disabled={relLoading} style={{flex:1,padding:"10px 0",background:team.color,border:"none",borderRadius:10,color:ac,fontWeight:700,fontSize:13,cursor:relLoading?"not-allowed":"pointer",fontFamily:"sans-serif"}}>{relLoading?"加载中...":"刷新故事"}</button>
              <button onClick={()=>setRelModal(null)} style={{flex:1,padding:"10px 0",background:"#222",border:"none",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>{t("app.close", lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ CONTRACT MODAL ════ */}
      {contractModal && contractOffer && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:200,padding:"20px 16px",overflowY:"auto"}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:420,border:"1px solid #f9a01b44"}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:6}}>
              {freeAgent?"🏀 自由球员":"合同谈判"}
            </div>
            {freeAgent && (
              <div style={{fontSize:12,color:"#888",marginBottom:14}}>{t("neg.fa_intro", lang)}</div>
            )}

            {/* Current offer */}
            <div style={{background:"#0d1923",borderRadius:12,padding:16,marginBottom:12,border:"1px solid "+ac+"33"}}>
              <div style={{fontSize:12,color:"#888",marginBottom:4}}>{t("neg.selected_offer", lang)}</div>
              <div style={{fontSize:13,fontWeight:700,color:contractOffer.isHome?"#f9a01b":"#ccc",marginBottom:6}}>{teamFull(contractOffer.rivalAbbr, lang)}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:26,fontWeight:900,color:ac}}>${contractOffer.salary}M<span style={{fontSize:12,color:"#888",fontWeight:400}}>/年</span></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,color:"#ccc"}}>{contractOffer.years}年</div>
                  <div style={{fontSize:11,color:"#555"}}>{t("neg.total_value_M", lang, {total: (contractOffer.salary*contractOffer.years).toFixed(0)})}</div>
                </div>
              </div>
              {/* Adjust salary */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setContractOffer(prev=>({...prev,salary:Math.max(1,+(prev.salary-0.5).toFixed(1))}))}
                  style={{width:34,height:34,borderRadius:8,background:"#1a1a2e",border:"1px solid #ffffff22",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"sans-serif"}}>−</button>
                <div style={{flex:1,textAlign:"center",fontSize:11,color:"#555"}}>{t("neg.adjust_salary", lang)}</div>
                <button onClick={()=>setContractOffer(prev=>({...prev,salary:+(prev.salary+0.5).toFixed(1)}))}
                  style={{width:34,height:34,borderRadius:8,background:"#1a2a1a",border:"1px solid "+ac+"44",color:ac,fontSize:16,cursor:"pointer",fontFamily:"sans-serif"}}>+</button>
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button onClick={()=>{
                const newTeamAbbr = contractOffer.rivalAbbr;
                setContract({type:"standard",year:1,totalYears:contractOffer.years,salary:contractOffer.salary});
                if(newTeamAbbr && newTeamAbbr!==team.abbr) {
                  const newTeam = ALL_TEAMS.find(t=>t.abbr===newTeamAbbr);
                  if(newTeam) { setTeam(newTeam); setTeammates(generateTeammates()); setRelationships({coach:60,gm:55,owner:50,star:45,teammate:65}); }
                }
                setContractModal(false); setContractOffer(null); setFreeAgent(false); setFaOffers([]); setNegotiateResult(null);
              }} style={{flex:2,padding:"12px 0",background:"linear-gradient(135deg,#00ff88,#00cc66)",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                ✓ 接受
              </button>
              <button onClick={()=>{
                // D7: real negotiation — outcome depends on increase %, OVR, isHome.
                const increase = +(Math.floor(Math.random()*3)+1).toFixed(1);
                const maxAllowed = getMaxSalary(season);
                const r = negotiate(contractOffer.salary, increase, !!contractOffer.isHome, player.overall, maxAllowed, lang);
                setNegotiateResult(r);
                if(r.accepted) {
                  setContractOffer((prev: any) => ({...prev, salary: r.newSalary}));
                } else {
                  // Failed negotiations slightly damage relations with offering team
                  if(contractOffer.isHome) {
                    setRelationships((prev: any) => ({...prev, gm: Math.max(0, prev.gm - 2), owner: Math.max(0, prev.owner - 2)}));
                  }
                }
              }}
                style={{flex:1,padding:"12px 0",background:"#1a2a1a",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>
                {t("neg.raise", lang)}
              </button>
            </div>

            {/* All FA offers list */}
            {/* D7: negotiation result feedback */}
            {negotiateResult && (
              <div style={{background: negotiateResult.accepted?"#0d2a1a":"#2a0d0d", borderLeft:"3px solid "+(negotiateResult.accepted?"#00ff88":"#ff5555"), borderRadius:8, padding:"9px 12px", marginBottom:12, fontSize:12, color: negotiateResult.accepted?"#88ffbb":"#ffaaaa", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span>{negotiateResult.accepted?"✓ ":"✗ "}{negotiateResult.line}</span>
                <button onClick={()=>setNegotiateResult(null)} style={{background:"transparent",border:"none",color:"inherit",cursor:"pointer",fontSize:14,opacity:0.6,padding:0}}>×</button>
              </div>
            )}
            <div style={{fontSize:11,color:"#666",marginBottom:10}}>{t("neg.cap_note", lang, {max: getMaxSalary(season), cap: SALARY_CAP})}</div>
            {faOffers.length>0 && (
              <div>
                <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>{t("neg.league_offers", lang, {n: faOffers.length})}</div>
                <div style={{maxHeight:220,overflowY:"auto"}}>
                  {faOffers.map((o,i)=>{
                    const tm = ALL_TEAMS.find(t=>t.abbr===o.rivalAbbr);
                    const isSelected = contractOffer.rivalAbbr===o.rivalAbbr;
                    return (
                      <button key={i} onClick={()=>setContractOffer(o)}
                        style={{width:"100%",padding:"9px 12px",marginBottom:4,background:isSelected?ac+"22":"#0d1117",border:"1px solid "+(isSelected?ac+"66":"#ffffff0d"),borderRadius:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"sans-serif"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:8,height:8,borderRadius:2,background:tm?tm.color:"#333",border:"1px solid "+(tm?tm.accent:"#555"),flexShrink:0}}/>
                          <div style={{textAlign:"left"}}>
                            <div style={{fontSize:12,color:isSelected?ac:"#ccc",fontWeight:isSelected?700:400}}>{teamFull(o.rivalAbbr, lang)}</div>
                            <div style={{fontSize:10,color:"#555"}}>{o.years}年合同 {o.isHome?"· 原球队":""}</div>
                          </div>
                        </div>
                        <div style={{fontSize:14,fontWeight:700,color:isSelected?ac:"#888"}}>${o.salary}M</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!freeAgent && (
              <button onClick={()=>setContractModal(false)}
                style={{width:"100%",marginTop:10,padding:"9px 0",background:"transparent",border:"1px solid #ffffff11",borderRadius:10,color:"#555",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>
                {t("neg.later", lang)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════ AWARDS MODAL ════ */}
      {showAwards && seasonAwards && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:300,padding:"20px 16px",overflowY:"auto"}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:440,border:"1px solid #ffd70044"}}>
            <div style={{fontSize:11,color:"#ffd700",letterSpacing:3,marginBottom:8}}>{t("awards.title", lang)}</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>{t("awards.season_n", lang, {n: season})}</div>

            {[
              {label:t("awards.mvp", lang),icon:"🏆",value:seasonAwards.mvp},
              {label:t("awards.dpoy", lang),icon:"🛡",value:seasonAwards.dpoy},
              {label:t("awards.champion", lang),icon:"🏅",value:seasonAwards.champion},
              {label:t("awards.fmvp", lang),icon:"🥇",value:seasonAwards.fmvp},
              {label:t("awards.best_coach", lang),icon:"📋",value:seasonAwards.bestCoach},
            ].map(a=>{
              const isMe = a.value===player.name;
              const isMyTeam = a.icon==="🏅" && seasonAwards.iChampion;  // icon is locale-independent
              return (
                <div key={a.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #ffffff08"}}>
                  <div style={{fontSize:12,color:"#888"}}>{a.icon} {a.label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:(isMe||isMyTeam)?"#ffd700":"#ccc"}}>{a.value}{(isMe||isMyTeam)&&" ⭐"}</div>
                </div>
              );
            })}

            {[
              {label:t("awards.all_nba_1", lang),members:seasonAwards.allNBA1},
              {label:t("awards.all_nba_2", lang),members:seasonAwards.allNBA2},
              {label:t("awards.all_nba_3", lang),members:seasonAwards.allNBA3},
              {label:t("awards.all_def_1", lang),members:seasonAwards.allDef1},
              {label:t("awards.all_def_2", lang),members:seasonAwards.allDef2},
              {label:t("awards.all_rookie_1", lang),members:seasonAwards.allRookie1},
              {label:t("awards.all_rookie_2", lang),members:seasonAwards.allRookie2},
            ].map(a=>{
              const hasMe = a.members.includes(player.name);
              return (
                <div key={a.label} style={{marginTop:10}}>
                  <div style={{fontSize:11,color:hasMe?"#ffd700":"#666",marginBottom:4}}>{hasMe?"⭐ ":""}{a.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {a.members.map((m,i)=>(
                      <div key={i} style={{background:(typeof m==="string"&&m.indexOf(player.name+" (")===0)?"#ffd70022":"#1a1a2e",borderRadius:6,padding:"4px 10px",fontSize:11,color:(typeof m==="string"&&m.indexOf(player.name+" (")===0)?"#ffd700":"#aaa",border:"1px solid "+((typeof m==="string"&&m.indexOf(player.name+" (")===0)?"#ffd70044":"#ffffff0d")}}>{m}</div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button onClick={()=>setShowAwards(false)}
              style={{width:"100%",marginTop:20,padding:"13px 0",background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"sans-serif"}}>
              {t("awards.close", lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════ ROOT ════════════════
export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [pendingPlayer, setPendingPlayer] = useState(null);
  const [activeSaveId, setActiveSaveId] = useState(null);
  const [activeInit, setActiveInit] = useState(null);
  // i18n: language is global to the app; persists in localStorage
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());
  const setLang = (l: Lang) => { setLangState(l); saveLang(l); };
  // Mirror to window so non-React helpers (writeSaves) can read it
  useEffect(() => { (window as any).__nbaLang = lang; }, [lang]);

  function onLoad(id) {
    const saves = loadSaves(); const sv = saves[id]; if(!sv) return;
    setActiveSaveId(id);
    setActiveInit({
      player:sv.player, team:sv.team, draftPick:sv.draftPick, season:sv.season||1,
      phase:sv.phase||"regular", regularGames:sv.regularGames||generateRegularSeason(sv.team,2024),
      playoffBracket:sv.playoffBracket||null, playoffRound:sv.playoffRound||0,
      injury:sv.injury||null, resting:sv.resting||0, injuryLog:sv.injuryLog||[],
      relationships:sv.relationships||{coach:65,gm:60,owner:55,star:50,teammate:70},
      contract:sv.contract||{type:"rookie",year:1,totalYears:4,salary:2.5},
      brands:sv.brands||[], offseasonDone:sv.offseasonDone||false, pendingOffer:sv.pendingOffer||null,
      freeAgent:sv.freeAgent||false, seasonAwards:sv.seasonAwards||null, teammates:sv.teammates||null,
      savings:sv.savings||0, ownedCars:sv.ownedCars||[], ownedHouse:sv.ownedHouse||null,
      currentRental:sv.currentRental||null, faOffers:sv.faOffers||[]
    });
    setScreen("game");
  }

  function onDrafted(t, pick) {
    const id = "save_"+Date.now();
    const sy = 2024;
    const rg = generateRegularSeason(t, sy);
    const init = {
      player:pendingPlayer, team:t, draftPick:pick, season:1, phase:"regular",
      regularGames:rg, playoffBracket:null, playoffRound:0,
      injury:null, resting:0, injuryLog:[],
      relationships:{coach:65,gm:60,owner:55,star:50,teammate:70},
      contract:{type:"rookie",year:1,totalYears:4,salary:2.5},
      brands:[], offseasonDone:false, pendingOffer:null, freeAgent:false, seasonAwards:null, teammates:null, savings:0, ownedCars:[], ownedHouse:null, currentRental:null, faOffers:[]
    };
    const saves = loadSaves();
    saves[id] = {id, playerName:pendingPlayer.name, position:pendingPlayer.position, archetype:pendingPlayer.archetype,
      overall:pendingPlayer.overall, teamAbbr:t.abbr, wins:0, losses:0, gamesPlayed:0, season:1,
      injured:false, salary:2.5, savedAt:Date.now(), ...init};
    writeSaves(saves);
    setActiveSaveId(id); setActiveInit(init); setScreen("game");
  }

  const inner =
    screen==="lobby" ? <SavesLobby onLoad={onLoad} onNew={()=>setScreen("create")} setLang={setLang} lang={lang}/> :
    screen==="create" ? <CreateScreen onDone={p=>{setPendingPlayer(p);setScreen("draft");}} onBack={()=>setScreen("lobby")} setLang={setLang} lang={lang}/> :
    (screen==="draft" && pendingPlayer) ? <DraftScreen player={pendingPlayer} onDrafted={onDrafted} onBack={()=>setScreen("create")} setLang={setLang} lang={lang}/> :
    (screen==="game" && activeInit) ? <MainScreen saveId={activeSaveId} init={activeInit} onQuit={()=>setScreen("lobby")} setLang={setLang} lang={lang}/> :
    null;
  return <LangContext.Provider value={lang}>{inner}</LangContext.Provider>;
}

// ── Mount (browser entry) ───────────────────────────────────────────────────
declare const ReactDOM: any;
try {
  const _container = document.getElementById("root");
  if(_container) {
    const _root = ReactDOM.createRoot(_container);
    _root.render(<App />);
    const _l = document.getElementById("loading");
    if(_l) _l.style.display = "none";
  }
} catch(e: any) {
  const _l = document.getElementById("loading");
  if(_l) {
    _l.innerHTML = '<div style="color:#ff6b6b;padding:24px;text-align:center;max-width:360px"><div style="font-size:36px;margin-bottom:16px">⚠️</div><div style="font-size:15px;font-weight:700;margin-bottom:10px">{t("ui.error_title", lang)}</div><div style="font-size:11px;color:#888;word-break:break-all;line-height:1.6">' + ((e && e.message) || String(e)).substring(0,300) + '</div><div style="font-size:11px;color:#555;margin-top:12px">{t("ui.error_hint", lang)}</div></div>';
  }
  console.error(e);
}
