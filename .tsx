import { useState, useMemo, useEffect, useCallback } from "react";

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
const INJURY_TYPES = [
  {name:"踝关节扭伤",minG:3,maxG:8,stats:["speed"],severity:"轻伤"},
  {name:"膝盖韧带拉伤",minG:12,maxG:30,stats:["speed","strength"],severity:"重伤"},
  {name:"肌肉拉伤",minG:4,maxG:12,stats:["strength"],severity:"轻伤"},
  {name:"手指骨折",minG:6,maxG:18,stats:["shooting","passing"],severity:"中伤"},
  {name:"背部痉挛",minG:3,maxG:8,stats:["strength","defense"],severity:"轻伤"},
  {name:"跟腱撕裂",minG:40,maxG:60,stats:["speed","strength"],severity:"赛季报销"},
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadSaves() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch(e) { return {}; } }
function writeSaves(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e) {} }
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
    const base = 85 + Math.max(0, b[k]);
    const roll = Math.floor(Math.random() * (100 - base + 1)); // 0 to (99-base)
    c[k] = Math.min(99, base + roll);
  });
  return c;
}

function generateInitialStats(pos, ceiling) {
  const s = {};
  Object.keys(ceiling).forEach(k => {
    const r = 0.52 + Math.random()*0.22;
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
  while(count < 82) {
    const gap = Math.random()<0.4 ? 1 : Math.random()<0.6 ? 2 : 3;
    date = new Date(date.getTime()+gap*86400000);
    if(date > new Date(startYear+1, 3, 13)) break;
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

async function aiCall(prompt) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:800, messages:[{role:"user",content:prompt}]})});
    const d = await r.json();
    return (d.content||[]).map(c=>typeof c.text==="string"?c.text:"").join("").trim();
  } catch(e) { return ""; }
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

// ════════════════ SAVES LOBBY ════════════════
function SavesLobby({onLoad, onNew}) {
  const [saves, setSaves] = useState(loadSaves);
  const [del, setDel] = useState(null);
  function doDelete(id) { const s={...saves}; delete s[id]; writeSaves(s); setSaves(s); setDel(null); }
  const list = Object.values(saves).sort((a,b)=>b.savedAt-a.savedAt);
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(180deg,#1a1a2e,#0a0a0f)",padding:"48px 20px 28px",textAlign:"center"}}>
        <div style={{fontSize:11,color:"#f9a01b",letterSpacing:5,marginBottom:10}}>NBA CAREER MODE</div>
        <div style={{fontSize:38,fontWeight:900,letterSpacing:3}}>MY CAREER</div>
      </div>
      <div style={{padding:20,maxWidth:460,margin:"0 auto"}}>
        <button onClick={onNew} style={{width:"100%",padding:"18px 0",fontSize:17,fontWeight:700,background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:14,color:"#000",cursor:"pointer",fontFamily:"sans-serif",marginBottom:24}}>+ 新建生涯</button>
        {list.length===0 ? (
          <div style={{textAlign:"center",padding:"40px 0",color:"#444"}}>
            <div style={{fontSize:32,marginBottom:12}}>🏀</div>
            <div>还没有存档，创建你的第一个生涯</div>
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
                  <span style={{color:"#888"}}>{sv.position} · {sv.archetype}</span>
                  <span style={{color:"#f9a01b"}}>OVR {sv.overall}</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:12,color:"#666",marginBottom:12}}>
                  <span>第{sv.season||1}赛季</span>
                  <span>{sv.wins}胜{sv.losses}负</span>
                  <span>${sv.salary||2.5}M/年</span>
                  {sv.injured && <span style={{color:"#ff6b6b"}}>🤕伤病</span>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>onLoad(sv.id)} style={{flex:1,padding:"10px 0",background:tm.color,border:"none",borderRadius:10,color:tm.accent,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>继续游戏</button>
                  {del===sv.id ? (
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>doDelete(sv.id)} style={{padding:"10px 12px",background:"#ff4444",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>确认删除</button>
                      <button onClick={()=>setDel(null)} style={{padding:"10px 12px",background:"#333",border:"none",borderRadius:10,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>取消</button>
                    </div>
                  ) : (
                    <button onClick={()=>setDel(sv.id)} style={{padding:"10px 12px",background:"#1a1a2e",border:"1px solid #ffffff11",borderRadius:10,color:"#555",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>删除</button>
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
function CreateScreen({onDone, onBack}) {
  const [name, setName] = useState("");
  const [pos, setPos] = useState("PG");
  const [arc, setArc] = useState("");
  const [custom, setCustom] = useState(false);
  const [ctext, setCtext] = useState("");
  const finalArc = custom ? ctext : arc;

  function submit() {
    if(!name.trim() || !finalArc.trim()) return;
    const ceiling = generatePotential(pos, finalArc);
    const stats = generateInitialStats(pos, ceiling);
    const physicals = generatePhysicals(pos);
    onDone({name:name.trim(), position:pos, archetype:finalArc.trim(), stats, ceiling, overall:calcOverall(stats), physicals});
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(180deg,#1a1a2e,#0a0a0f)",padding:"32px 20px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"#ffffff11",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>返回</button>
        <div>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:3}}>NEW CAREER</div>
          <div style={{fontSize:24,fontWeight:900}}>创建球员</div>
        </div>
      </div>
      <div style={{padding:20,maxWidth:440,margin:"0 auto"}}>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:8}}>球员姓名</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="输入你的名字..."
            style={{width:"100%",padding:"14px 16px",background:"#111827",border:"1px solid #ffffff22",borderRadius:10,color:"#fff",fontSize:16,boxSizing:"border-box",outline:"none",fontFamily:"sans-serif"}}/>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:8}}>位置</div>
          <div style={{display:"flex",gap:8}}>
            {POSITIONS.map(p => (
              <button key={p} onClick={()=>{setPos(p);setArc("");}}
                style={{flex:1,padding:"12px 4px",background:pos===p?"#f9a01b":"#111827",border:"1px solid "+(pos===p?"#f9a01b":"#ffffff22"),color:pos===p?"#000":"#fff",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"sans-serif",fontWeight:700}}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2}}>打法风格</div>
            <button onClick={()=>{setCustom(!custom);setArc("");setCtext("");}}
              style={{fontSize:11,color:custom?"#00ff88":"#888",background:"transparent",border:"1px solid "+(custom?"#00ff8844":"#ffffff22"),borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"sans-serif"}}>{custom?"✓ 自定义":"✏ 自定义"}</button>
          </div>
          {!custom ? (
            <div>
              {PRESET_ARCHETYPES[pos].map(a => (
                <button key={a} onClick={()=>setArc(a)}
                  style={{width:"100%",padding:"14px 16px",textAlign:"left",marginBottom:8,background:arc===a?"#1a2a1a":"#111827",border:"1px solid "+(arc===a?"#00ff88":"#ffffff22"),color:arc===a?"#00ff88":"#ccc",borderRadius:10,cursor:"pointer",fontSize:15,fontFamily:"sans-serif"}}>{a}</button>
              ))}
              <button onClick={()=>{setCustom(true);setArc("");}}
                style={{width:"100%",padding:"14px 16px",textAlign:"left",marginBottom:8,background:"#0d1117",border:"1px dashed #ffffff33",color:"#888",borderRadius:10,cursor:"pointer",fontSize:14,fontFamily:"sans-serif"}}>✏ 其他（自定义输入）</button>
            </div>
          ) : (
            <div>
              <input value={ctext} onChange={e=>setCtext(e.target.value)} placeholder="例如：全能摇摆人、空间型大前锋..."
                style={{width:"100%",padding:"14px 16px",background:"#111827",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"sans-serif"}}/>
              <div style={{fontSize:11,color:"#666",marginTop:6}}>AI会根据你的风格生成解说</div>
            </div>
          )}
        </div>
        <div style={{background:"#0f1923",borderRadius:10,padding:14,marginBottom:20,border:"1px solid #f9a01b22"}}>
          <div style={{fontSize:11,color:"#f9a01b",marginBottom:4}}>⚠ 潜力说明</div>
          <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>属性上限完全随机，身体天赋也各不相同。伤病可能永久限制成长空间。发挥打法特点才能最大化潜力。</div>
        </div>
        <button onClick={submit} disabled={!name.trim()||!finalArc.trim()}
          style={{width:"100%",padding:"18px 0",fontSize:18,fontWeight:700,background:name.trim()&&finalArc.trim()?"linear-gradient(135deg,#f9a01b,#ffd700)":"#222",border:"none",borderRadius:12,color:name.trim()&&finalArc.trim()?"#000":"#555",cursor:name.trim()&&finalArc.trim()?"pointer":"not-allowed",fontFamily:"sans-serif"}}>
          前往选秀大会 →
        </button>
      </div>
    </div>
  );
}

// ════════════════ DRAFT ════════════════
function DraftScreen({player, onDrafted, onBack}) {
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
    const txt = await aiCall("你是NBA选秀夜解说员。中文3句话："+player.name+"（"+player.position+"，"+player.archetype+"）第"+pn+"顺位被"+t.city+t.name+"选中。画面感强，充满戏剧性。只输出解说词。");
    setStory(txt||"掌声雷动！这位新秀即将开启他的NBA传奇！");
    setLoading(false); setPhase("result");
  }

  if(phase==="intro") return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"sans-serif",color:"#fff",position:"relative"}}>
      <button onClick={onBack} style={{position:"absolute",top:20,left:20,background:"#ffffff11",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>返回</button>
      <div style={{fontSize:11,color:"#f9a01b",letterSpacing:4,marginBottom:12}}>NBA DRAFT NIGHT</div>
      <div style={{fontSize:36,fontWeight:900,textAlign:"center",marginBottom:8}}>你已就位</div>
      <div style={{fontSize:15,color:"#888",textAlign:"center",marginBottom:36}}>{player.name} · {player.position} · {player.archetype}</div>
      <div style={{fontSize:14,color:"#aaa",textAlign:"center",lineHeight:1.8,marginBottom:48,maxWidth:300}}>30支球队的GM都在研究你的录像。<br/>选秀大厅灯光璀璨，你西装笔挺地坐在台下……</div>
      <button onClick={runDraft} style={{padding:"18px 48px",fontSize:18,fontWeight:700,background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:14,color:"#000",cursor:"pointer",fontFamily:"sans-serif"}}>开始选秀</button>
    </div>
  );

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{fontSize:48,marginBottom:20}}>🎤</div>
      <div style={{fontSize:18,color:"#f9a01b"}}>选秀进行中...</div>
    </div>
  );

  if(phase==="result" && dt) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"sans-serif",color:"#fff"}}>
      <div style={{fontSize:13,color:"#888",letterSpacing:3,marginBottom:4}}>第 {pick} 顺位</div>
      <div style={{fontSize:11,color:"#f9a01b",letterSpacing:4,marginBottom:20}}>NBA DRAFT PICK</div>
      <div style={{background:dt.color,border:"2px solid "+dt.accent,borderRadius:20,padding:"24px 40px",textAlign:"center",marginBottom:20,boxShadow:"0 0 40px "+dt.accent+"44"}}>
        <div style={{fontSize:42,color:dt.accent,fontWeight:900}}>{dt.abbr}</div>
        <div style={{fontSize:15,color:"#fff"}}>{dt.city} {dt.name}</div>
      </div>
      <div style={{fontSize:21,fontWeight:700,marginBottom:4}}>{player.name}</div>
      <div style={{fontSize:13,color:"#aaa",marginBottom:20}}>{player.position} · {player.archetype}</div>
      {story && <div style={{background:"#0f1923",borderRadius:12,padding:14,borderLeft:"4px solid "+dt.accent,marginBottom:24,maxWidth:360}}>
        <div style={{fontSize:10,color:dt.accent,letterSpacing:2,marginBottom:6}}>解说</div>
        <div style={{fontSize:14,color:"#ddd",lineHeight:1.7}}>{story}</div>
      </div>}
      <button onClick={()=>onDrafted(dt,pick)} style={{padding:"16px 40px",fontSize:16,fontWeight:700,background:dt.color,border:"2px solid "+dt.accent,borderRadius:12,color:dt.accent,cursor:"pointer",fontFamily:"sans-serif"}}>开始生涯 →</button>
    </div>
  );

  return null;
}

// ════════════════ MAIN SCREEN ════════════════
// ════════════════ STANDINGS VIEW ════════════════
function StandingsView({standings, myTeamAbbr, ac}) {
  const [tab, setTab] = useState("west");
  if(!standings) return (
    <div style={{padding:20,textAlign:"center",color:"#444"}}>
      <div style={{fontSize:28,marginBottom:8}}>📊</div>
      <div>完成几场比赛后联盟战绩才会显示</div>
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
        <span style={{color:"#00ff88"}}>■ 直接晋级</span>
        <span style={{color:"#f9a01b"}}>■ 附加赛 (7-10)</span>
        <span>■ 淘汰</span>
      </div>

      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"24px 1fr 36px 36px 50px",gap:4,padding:"6px 10px",borderBottom:"1px solid #ffffff11",fontSize:10,color:"#555"}}>
        <span>#</span><span>球队</span><span style={{textAlign:"center"}}>胜</span><span style={{textAlign:"center"}}>负</span><span style={{textAlign:"right"}}>胜率</span>
      </div>

      {data.map((t,i)=>{
        const isMine = t.abbr===myTeamAbbr;
        const sl = seedLabel(i);
        const pctStr = t.gp>0 ? (t.pct).toFixed(3).replace("0.",".")  : "-";
        return (
          <div key={t.abbr} style={{display:"grid",gridTemplateColumns:"24px 1fr 36px 36px 50px",gap:4,padding:"9px 10px",background:isMine?ac+"18":"transparent",borderBottom:"1px solid #ffffff06",borderLeft:isMine?"3px solid "+ac:"3px solid transparent",alignItems:"center"}}>
            <span style={{fontSize:11,color:sl.color,fontWeight:700}}>{i+1}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:2,background:t.color,border:"1px solid "+t.accent,flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:isMine?700:400,color:isMine?"#fff":"#ccc"}}>{t.city} {t.name}</div>
                {isMine && <div style={{fontSize:9,color:ac}}>← 你的球队</div>}
              </div>
            </div>
            <span style={{textAlign:"center",fontSize:13,fontWeight:700,color:"#00ff88"}}>{t.wins}</span>
            <span style={{textAlign:"center",fontSize:13,color:"#ff5555"}}>{t.losses}</span>
            <span style={{textAlign:"right",fontSize:12,color:"#aaa"}}>{pctStr}</span>
          </div>
        );
      })}

      {/* Play-in explanation */}
      <div style={{background:"#111827",borderRadius:10,padding:12,marginTop:14,border:"1px solid #ffffff0d"}}>
        <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>附加赛规则</div>
        <div style={{fontSize:11,color:"#777",lineHeight:1.7}}>
          7号打8号 → 赢者直接晋级第7种子<br/>
          9号打10号 → 赢者获得机会<br/>
          7/8输者 vs 9/10赢者 → 赢者晋级第8种子<br/>
          11-15名：直接无缘季后赛
        </div>
      </div>
    </div>
  );
}

// ════════════════ PLAYOFF VIEW ════════════════
function SeriesCard({series, myTeamAbbr, teamColor, ac, onSimGame, simming}) {
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
    const aT=ALL_TEAMS.find(t=>t.abbr===series.teamA.abbr)||series.teamA;
    const bT=ALL_TEAMS.find(t=>t.abbr===series.teamB.abbr)||series.teamB;
    return (
      <div style={{background:"#111827",borderRadius:8,padding:"8px 12px",marginBottom:6,border:"1px solid #ffffff0d",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:series.winner===aT.abbr?"#00ff88":"#aaa",fontWeight:series.winner===aT.abbr?700:400}}>{aT.abbr}</div>
        <div style={{fontSize:12,color:"#555"}}>{series.winsA} - {series.winsB}</div>
        <div style={{fontSize:12,color:series.winner===bT.abbr?"#00ff88":"#aaa",fontWeight:series.winner===bT.abbr?700:400}}>{bT.abbr}</div>
        {!done && <div style={{fontSize:10,color:"#444"}}>进行中</div>}
        {done && <div style={{fontSize:10,color:"#00ff88"}}>✓</div>}
      </div>
    );
  }

  // My match — featured card
  return (
    <div style={{background:iWon?"#0d2a1a":iLost?"#2a0d0d":"#0d1a2a",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(iWon?"#00ff8844":iLost?"#ff444444":ac+"44")}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:12,color:"#888"}}>{series.round} {isMyMatch&&"· 我的对阵"}</div>
        {iWon && <div style={{fontSize:12,color:"#00ff88",fontWeight:700}}>✓ 晋级</div>}
        {iLost && <div style={{fontSize:12,color:"#ff5555",fontWeight:700}}>✗ 出局</div>}
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
          const isPlayed = g.status!=="upcoming";
          const iWonThisGame = isPlayed&&((series.teamA.abbr===myTeamAbbr&&g.status==="won")||(series.teamB.abbr===myTeamAbbr&&g.status==="lost"?"lost":"won")===g.status&&series.teamA.abbr!==myTeamAbbr?false:g.status==="won");
          const myWonGame = isPlayed&&series.games[gi].status==="won"?series.teamA.abbr===myTeamAbbr:false;
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
          {simming?"模拟中...":"▶ 模拟第"+(myWins+oppWins+1)+"场"}
        </button>
      )}
    </div>
  );
}

function PlayoffView({bracket, myTeam, onSimGame, simming, onOffseason, ac, narrative, narrativeCtx}) {
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
        <div style={{background:"#111827",borderRadius:10,padding:"12px 14px",marginBottom:12,border:"1px solid "+ac+"44",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"#888"}}>下一场</div>
            <div style={{fontSize:13,fontWeight:700,color:"#ccc"}}>{nextActiveSeries.teamA.abbr} vs {nextActiveSeries.teamB.abbr} · {nextActiveSeries.round}</div>
          </div>
          <button onClick={()=>onSimGame(nextActiveSeries)} disabled={simming}
            style={{padding:"9px 18px",background:simming?"#222":myTeam.color,border:"1px solid "+(simming?"#333":ac),borderRadius:9,color:simming?"#444":ac,fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
            {simming?"模拟中...":"▶ 模拟"}
          </button>
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
          ⚠ 你的球队未进入季后赛 — 仍可观看并模拟其他对阵
        </div>
      )}

      {allCurSeries.map((s,i)=>(
        <SeriesCard key={i} series={s} myTeamAbbr={myTeam.abbr} teamColor={myTeam.color} ac={ac} onSimGame={()=>onSimGame(s)} simming={simming}/>
      ))}

      {finals && (
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"#f9a01b",letterSpacing:2,marginBottom:8}}>🏆 NBA总决赛</div>
          <SeriesCard series={finals} myTeamAbbr={myTeam.abbr} teamColor={myTeam.color} ac={ac} onSimGame={()=>onSimGame(finals)} simming={simming}/>
        </div>
      )}

      {champion && (
        <div style={{background:"#1a2a0d",borderRadius:12,padding:16,textAlign:"center",border:"1px solid #ffd70044",marginTop:10}}>
          <div style={{fontSize:28,marginBottom:4}}>🏆</div>
          <div style={{fontSize:18,fontWeight:900,color:"#ffd700"}}>{champion===myTeam.abbr?"NBA总冠军！":"季后赛冠军："+champion}</div>
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
          → 进入休赛期
        </button>
      )}
    </div>
  );
}

const TEAMMATE_NAMES = ["贾马尔","德里克","泰勒","马库斯","凯尔","乔丹","坦纳","迈尔斯","奥利弗","肖恩","布莱克","达文特","雷吉","特雷","内特"];
const TEAMMATE_ROLES = ["首发控卫","首发得分后卫","首发小前锋","首发大前锋","首发中锋","第六人","轮换得分手","防守专家","组织替补","体能轮换"];

function generateTeammates() {
  return Array(5).fill(null).map((_,i)=>({
    id:i,
    name:TEAMMATE_NAMES[Math.floor(Math.random()*TEAMMATE_NAMES.length)]+"·"+["史密斯","约翰逊","威廉斯","布朗","戴维斯","马丁","汤普森","安德森","托马斯","杰克逊"][Math.floor(Math.random()*10)],
    role:TEAMMATE_ROLES[i]||TEAMMATE_ROLES[Math.floor(Math.random()*TEAMMATE_ROLES.length)],
    rapport:Math.floor(Math.random()*40)+40, // 40-80 initial
    ovr:Math.floor(Math.random()*25)+70,
  }));
}

function generateSeasonAwards(playerName, teamAbbr, teamName, avg, ovr, wins, season, playoffBracket) {
  const stars = [...ALL_TEAMS.map(t=>t.city+" "+t.name)].sort(()=>Math.random()-0.5);
  const starNames = stars.map(s=>s+" 球员");
  const pick = (arr,n)=>arr.slice(0,n);
  const isGoodSeason = avg.pts>20 && wins>41;
  const isMVPCandidate = avg.pts>25 && avg.ast>5 && wins>50 && ovr>85;
  const isDPOY = avg.stl>1.5 && avg.blk>1.2 && ovr>82;
  const isRookie = season===1;

  // Get actual champion from bracket
  const actualChampAbbr = playoffBracket?.champion || null;
  const actualChampTeam = actualChampAbbr ? (ALL_TEAMS.find(t=>t.abbr===actualChampAbbr) || null) : null;
  const championName = actualChampTeam ? actualChampTeam.city+" "+actualChampTeam.name : starNames[0].replace(" 球员","");

  // Player won championship?
  const iChampion = actualChampAbbr === teamAbbr;
  // FMVP: if player's team won, check if player was MVP-caliber; otherwise random finals player
  const fmvp = iChampion && isMVPCandidate ? playerName : (iChampion ? playerName : starNames[0]);

  const mvp = isMVPCandidate ? playerName : starNames[0];

  return {
    mvp,
    allNBA1: isGoodSeason ? [playerName,...pick(starNames,4)] : pick(starNames,5),
    allNBA2: pick(starNames.slice(5),5),
    allNBA3: pick(starNames.slice(10),5),
    allDef1: isDPOY ? [playerName,...pick(starNames,4)] : pick(starNames,5),
    allDef2: pick(starNames.slice(5),5),
    allRookie1: isRookie ? [playerName,...pick(starNames,4)] : pick(starNames,5),
    allRookie2: isRookie ? pick(starNames.slice(5),5) : pick(starNames.slice(1),5),
    dpoy: isDPOY ? playerName : starNames[0],
    bestCoach: ["史蒂夫·科尔","泰隆·卢","迈克·布登霍尔泽","埃里克·斯波斯特拉","里克·卡莱尔","格雷格·波波维奇","扬尼斯·阿代托昆博"][Math.floor(Math.random()*7)],
    champion: championName,
    iChampion,
    fmvp,
  };
}

function MainScreen({saveId, init, onQuit}) {
  const [player, setPlayer] = useState(init.player);
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
  const [restInput, setRestInput] = useState(1);

  const played = regularGames.filter(g=>g.status!=="upcoming");
  const wins = regularGames.filter(g=>g.status==="won").length;
  const seasonOver = regularGames.filter(g=>g.status==="upcoming").length===0;
  const totalAlloc = Object.values(trainAlloc).reduce((a,b)=>a+b,0);

  const avg = useMemo(()=>{
    const pg = played.filter(g=>g.stats);
    if(!pg.length) return {pts:0,ast:0,reb:0,stl:0,blk:0};
    const s = pg.reduce((a,g)=>({pts:a.pts+g.stats.pts,ast:a.ast+g.stats.ast,reb:a.reb+g.stats.reb,stl:a.stl+g.stats.stl,blk:a.blk+g.stats.blk}),{pts:0,ast:0,reb:0,stl:0,blk:0});
    const n = pg.length;
    return {pts:+(s.pts/n).toFixed(1),ast:+(s.ast/n).toFixed(1),reb:+(s.reb/n).toFixed(1),stl:+(s.stl/n).toFixed(1),blk:+(s.blk/n).toFixed(1)};
  },[played]);

  const doSave = useCallback(()=>{
    const saves = loadSaves();
    saves[saveId] = {
      id:saveId, playerName:player.name, position:player.position, archetype:player.archetype,
      overall:player.overall, teamAbbr:team.abbr, wins, losses:played.length-wins,
      gamesPlayed:played.length, season, injured:!!injury, salary:contract.salary, savedAt:Date.now(),
      player, team, draftPick:init.draftPick, season, phase, regularGames, playoffBracket, playoffRound,
      injury, resting, injuryLog, relationships, contract, brands, offseasonDone, pendingOffer:contractOffer,
      freeAgent, seasonAwards, teammates, savings, ownedCars, ownedHouse, currentRental, faOffers
    };
    writeSaves(saves);
    setSaveMsg("已保存 ✓");
    setTimeout(()=>setSaveMsg(""),2000);
  },[player,team,season,phase,regularGames,playoffBracket,playoffRound,injury,resting,injuryLog,relationships,contract,brands,offseasonDone,wins,played,saveId,contractOffer]);

  useEffect(()=>{ if(played.length>0) doSave(); },[regularGames,playoffBracket]);

  function checkNewInjury() {
    const chance = 0.02; // ~1-2 injuries per 82 games, many seasons injury-free
    if(Math.random()<chance) {
      const t = INJURY_TYPES[Math.floor(Math.random()*INJURY_TYPES.length)];
      const g = t.minG + Math.floor(Math.random()*(t.maxG-t.minG+1));
      return {name:t.name, gamesLeft:g, affectedStats:t.stats, severity:t.severity};
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
    const games = regularGames.filter(g=>g.status==="upcoming" && g.id<=targetId);
    if(!games.length) { setSimming(false); return; }
    let newReg = [...regularGames];
    let curInj = injury;
    let curRest = resting;
    let newInjLog = [...injuryLog];
    let newRels = {...relationships};
    let injEvent = null;
    for(let i=0; i<games.length; i++) {
      const g = games[i];
      const isResting = curRest>0;
      if(isResting) { curRest--; }
      else if(curInj) {
        curInj = {...curInj, gamesLeft:curInj.gamesLeft-1};
        if(curInj.gamesLeft<=0) {
          newInjLog.push({name:curInj.name,date:g.date,type:"recovered"});
          injEvent = "🟢 已从「"+curInj.name+"」中恢复！";
          curInj = null;
        }
      } else {
        const ni = checkNewInjury();
        if(ni) { curInj=ni; newInjLog.push({name:ni.name,date:g.date,games:ni.gamesLeft,type:"injured"}); injEvent="🔴 受伤！"+ni.name+"，预计缺席 "+ni.gamesLeft+" 场"; }
      }
      const res = simOneGame(curInj, isResting);
      newReg = newReg.map(s=>s.id===g.id?{...s,status:res.win?"won":"lost",stats:res}:s);
      const winD = res.win?2:-1;
      newRels = {...newRels,coach:Math.min(100,Math.max(0,newRels.coach+winD)),teammate:Math.min(100,Math.max(0,newRels.teammate+(res.win?1:-1)))};
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
        const txt = await aiCall("你是NBA解说员。中文3句话："+player.name+"（"+team.city+team.name+"，"+player.position+"，"+player.archetype+"）对阵"+oppT.city+oppT.name+"。"+lastG.stats.pts+"分 "+lastG.stats.ast+"助 "+lastG.stats.reb+"篮，"+(lastG.status==="won"?"胜":"负")+"。"+(lastG.stats.injured?"带伤出战。":"")+"体现"+player.archetype+"风格。只输出解说词。");
        setNarrative((injEvent?injEvent+"\n\n":"")+(txt||"精彩比赛！"));
      } else {
        setNarrative((injEvent||"")+(injEvent?"\n\n":"")+(games.length>1?"已完成 "+games.length+" 场模拟。":"本场球员休战。"));
      }
    }
    setSimming(false);
  }

  async function simPlayoffGame(series) {
    if(simming||!playoffBracket) return;
    setSimming(true); setNarrative(""); setNarrativeCtx(null);
    const nb = JSON.parse(JSON.stringify(playoffBracket));

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
          if(curInj){curInj={...curInj,gamesLeft:curInj.gamesLeft-1};if(curInj.gamesLeft<=0){newInjLog.push({name:curInj.name,date:nextG.date,type:"recovered"});injEvent="🟢 已恢复！";curInj=null;}}
          else if(isMyMatch){const ni=checkNewInjury();if(ni){curInj=ni;newInjLog.push({name:ni.name,date:nextG.date,games:ni.gamesLeft,type:"injured"});injEvent="🔴 受伤！"+ni.name;}}
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
        if(curInj){curInj={...curInj,gamesLeft:curInj.gamesLeft-1};if(curInj.gamesLeft<=0){newInjLog.push({name:curInj.name,date:nextG.date,type:"recovered"});injEvent="🟢 已恢复！";curInj=null;}}
        else if(isMyMatch){const ni=checkNewInjury();if(ni){curInj=ni;newInjLog.push({name:ni.name,date:nextG.date,games:ni.gamesLeft,type:"injured"});injEvent="🔴 受伤！"+ni.name;}}
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

    if(result&&result.isMyMatch) {
      const oppT = ALL_TEAMS.find(t=>t.abbr===result.nextG.opp)||ALL_TEAMS[0];
      const myWin = result.imTeamA?(result.s.games.find(g=>g.id===result.nextG.id)?.status==="won"):!(result.s.games.find(g=>g.id===result.nextG.id)?.status==="won");
      const txt = await aiCall("NBA季后赛解说员。中文3句话："+player.name+"（"+team.city+team.name+"）季后赛"+result.s.round+"对阵"+oppT.city+oppT.name+"。"+result.res.pts+"分 "+result.res.ast+"助 "+result.res.reb+"篮，"+(myWin?"胜":"负")+"，系列赛"+(result.imTeamA?result.s.winsA:result.s.winsB)+"-"+(result.imTeamA?result.s.winsB:result.s.winsA)+"。只输出解说词。");
      setNarrative((result.injEvent?result.injEvent+"\n\n":"")+(txt||"季后赛激战！"));
    }
    setSimming(false);
  }


  function allocTrain(stat, delta) {
    const c = trainAlloc[stat]; if(c+delta<0) return; if(delta>0&&totalAlloc>=6) return;
    setTrainAlloc({...trainAlloc,[stat]:c+delta});
  }
  function confirmTraining() {
    const ns = {...player.stats};
    Object.entries(trainAlloc).forEach(([s,p])=>{ ns[s]=Math.min(player.ceiling[s],ns[s]+p*2); });
    setPlayer({...player,stats:ns,overall:calcOverall(ns)});
    setOffseasonDone(true);
    setTrainAlloc({speed:0,shooting:0,passing:0,defense:0,strength:0,iq:0});
  }
  function startNextSeason() {
    if(freeAgent && !contractOffer) return;
    const ns = season+1; const sy = 2024+(ns-1);
    setSeason(ns); setRegularGames(generateRegularSeason(team,sy));
    setPlayoffBracket(null); setPlayoffRound(0); setPhase("regular"); setOffseasonDone(false);
    setNarrative(""); setCalYear(sy); setCalMonth(9);
    setFreeAgent(false); setSeasonAwards(null); setShowAwards(false); setFaOffers([]);
    // Add salary to savings (after taxes ~40%)
    const annualSavings = contract.salary * 0.6;
    // Deduct rent if renting
    const rentCost = currentRental ? currentRental.monthly * 12 : 0;
    setSavings(prev => Math.max(0, +(prev + annualSavings - rentCost).toFixed(2)));
    // Generate awards
    const awards = generateSeasonAwards(player.name, team.abbr, team.name, avg, player.overall, wins, season, playoffBracket);
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
        const baseSalary = Math.max(3, Math.round((myOvr - 60) * 0.9 + ns * 0.5));
        const salary = Math.round((baseSalary * (0.7 + interest * 0.6)) * 10) / 10;
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
    if(resting>0) return {label:"主动休战",color:"#88aaff",icon:"😴",detail:"还有 "+resting+" 场休战"};
    if(!injury) return {label:"状态健康",color:"#00ff88",icon:"✅",detail:"身体无异样"};
    if(injury.severity==="赛季报销") return {label:"赛季报销",color:"#ff2244",icon:"🚑",detail:injury.name+" · 缺席 "+injury.gamesLeft+" 场"};
    if(injury.severity==="重伤") return {label:"重伤",color:"#ff4444",icon:"🤕",detail:injury.name+" · 缺席 "+injury.gamesLeft+" 场"};
    if(injury.severity==="中伤") return {label:"轻中度伤病",color:"#ff8844",icon:"🤕",detail:injury.name+" · 缺席 "+injury.gamesLeft+" 场"};
    return {label:"轻伤",color:"#ffaa44",icon:"🤕",detail:injury.name+" · 缺席 "+injury.gamesLeft+" 场"};
  }
  const health = getHealthStatus();

  async function loadRelStory(key) {
    setRelLoading(true);
    const labs={coach:"主教练",gm:"总经理",owner:"老板",star:"球队核心",teammate:"更衣室"};
    const val=relationships[key];
    const q=val>=70?"融洽":val>=45?"一般":"紧张";
    const txt=await aiCall("NBA剧情叙述者。中文2句话："+player.name+"与"+labs[key]+"关系（值"+val+"/100，"+q+"）。根据好坏写不同故事，真实感强。只输出叙述。");
    setRelStory(prev=>({...prev,[key]:txt||"关系"+q+"，保持职业。"}));
    setRelLoading(false);
  }

  async function doRequestTrade() {
    setTradeLoading(true);
    const tgt = ALL_TEAMS.find(t=>t.abbr!==team.abbr)||ALL_TEAMS[0];
    const txt = await aiCall("NBA剧情叙述者。中文3句话："+player.name+"向"+team.city+team.name+"申请交易，可能去"+tgt.city+tgt.name+"。戏剧性强。只输出叙述。");
    setTradeResult(txt||"交易申请已提交，管理层正在考虑。");
    setRelationships(prev=>({...prev,gm:Math.max(0,prev.gm-10),owner:Math.max(0,prev.owner-8)}));
    setTradeLoading(false);
  }

  const ph = player.physicals||{heightCm:188,wingspanCm:191,wingDelta:3,weightKg:88,staticTraits:["弹跳精英"],dynamicTraits:["挡拆高手"]};

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#fff",fontFamily:"sans-serif",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:team.color,padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{doSave();onQuit();}} style={{background:"rgba(0,0,0,0.3)",border:"none",color:"#fff",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:"sans-serif",fontSize:12}}>← 存档</button>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:ac}}>{player.name}</div>
              <div style={{fontSize:11,opacity:0.8}}>{team.city} {team.name} · S{season} · ${contract.salary}M</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:700}}>{wins}胜 {played.length-wins}负</div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",fontSize:11}}>
              <span style={{color:ac}}>OVR {player.overall}</span>
              <span style={{color:health.color}}>{health.icon} {health.label}</span>
              {saveMsg && <span style={{color:"#00ff88"}}>{saveMsg}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#0d0d14",borderBottom:"1px solid #ffffff0d",overflowX:"auto"}}>
        {[["calendar","📅 赛程"],["playoffs","🏆 季后赛"],["standings","📋 战绩"],["player","🧬 球员"],["stats","📊 数据"],["offseason","🏋 训练"],["relations","👥 人际"],["agent","💰 经纪"],["finances","🏠 财产"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{flex:"0 0 auto",padding:"11px 12px",background:"transparent",border:"none",borderBottom:view===v?"2px solid "+ac:"2px solid transparent",color:view===v?ac:"#555",fontSize:11,fontWeight:view===v?700:400,cursor:"pointer",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {tradeDanger && (
        <div style={{background:"#2a0d0d",padding:"8px 16px",fontSize:12,color:"#ff8888",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>⚠ 管理层关系告急，可能被交易</span>
          <button onClick={()=>setView("relations")} style={{background:"transparent",border:"1px solid #ff8888",color:"#ff8888",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>查看</button>
        </div>
      )}
      {pendingBrand && (
        <div style={{background:"#0d2a1a",padding:"10px 16px",margin:"8px 14px",borderRadius:10,border:"1px solid #00ff8844",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#00ff88"}}>💼 经纪人：品牌邀约</div>
            <div style={{fontSize:12,color:"#aaa"}}>{pendingBrand.icon} {pendingBrand.name}（{pendingBrand.type}）→ ${pendingBrand.offer}M/年</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setBrands(prev=>[...prev,pendingBrand]);setPendingBrand(null);}} style={{padding:"6px 12px",background:"#00ff88",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>接受</button>
            <button onClick={()=>setPendingBrand(null)} style={{padding:"6px 10px",background:"#333",border:"none",borderRadius:8,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>拒绝</button>
          </div>
        </div>
      )}

      {/* ════ PLAYOFFS ════ */}
      {view==="playoffs" && (
        <div style={{padding:14}}>
          {!seasonOver && !playoffBracket && (
            <div style={{background:"#111827",borderRadius:12,padding:24,textAlign:"center",border:"1px solid #ffffff0d"}}>
              <div style={{fontSize:28,marginBottom:10}}>🏀</div>
              <div style={{fontSize:14,color:"#888"}}>常规赛结束后自动生成对阵表</div>
              <div style={{fontSize:12,color:"#555",marginTop:6}}>{regularGames.filter(g=>g.status==="upcoming").length} 场比赛待模拟</div>
            </div>
          )}
          {playoffBracket && (
            <PlayoffView
              bracket={playoffBracket}
              myTeam={team}
              onSimGame={simPlayoffGame}
              simming={simming}
              onOffseason={()=>setPhase("offseason")}
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
                生成季后赛对阵表
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
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>健康状态</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:health.color}}>{health.icon} {health.label}</div>
                <div style={{fontSize:12,color:"#888",marginTop:4}}>{health.detail}</div>
                {injury && <div style={{fontSize:11,color:"#aaa",marginTop:4}}>受影响属性：{injury.affectedStats.map(s=>STAT_LABELS[s]).join("、")}</div>}
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
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>身体天赋（静态）</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>身高</div>
                <div style={{fontSize:17,fontWeight:700,color:ac}}>{ph.heightCm}<span style={{fontSize:11,color:"#666"}}>cm</span></div>
              </div>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>臂展</div>
                <div style={{fontSize:17,fontWeight:700,color:"#ccc"}}>{ph.wingspanCm}<span style={{fontSize:11,color:"#666"}}>cm</span></div>
                <div style={{fontSize:9,color:ph.wingDelta>=6?"#00ff88":ph.wingDelta<0?"#ff8888":"#888"}}>{ph.wingDelta>0?"+"+ph.wingDelta:ph.wingDelta}cm</div>
              </div>
              <div style={{background:"#1a1a2e",borderRadius:10,padding:"10px 12px",flex:"1 1 80px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:3}}>体重</div>
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
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>动态天赋（技术特点）</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {ph.dynamicTraits.map((t,i)=>(
                <div key={i} style={{background:ac+"22",borderRadius:20,padding:"6px 14px",fontSize:12,color:ac,border:"1px solid "+ac+"33"}}>{t}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:"#555",marginTop:10}}>动态天赋会影响比赛模拟中的数据加成</div>
          </div>

          {/* Injury history */}
          {injuryLog.length>0 && (
            <div style={{background:"#111827",borderRadius:12,padding:16,border:"1px solid #ffffff0d"}}>
              <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>伤病历史</div>
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
                <div style={{fontSize:13,fontWeight:700,color:ac}}>常规赛已结束</div>
                <div style={{fontSize:11,color:"#888"}}>前往「季后赛」标签继续</div>
              </div>
              <button onClick={()=>setView("playoffs")} style={{padding:"8px 16px",background:team.color,border:"1px solid "+ac,borderRadius:8,color:ac,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>→ 季后赛</button>
            </div>
          )}
          {phase==="offseason" && (
            <div style={{background:"#1a1a0d",borderRadius:10,padding:12,marginBottom:10,border:"1px solid #f9a01b44"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#f9a01b"}}>☀ 休赛期</div>
                  <div style={{fontSize:11,color:"#888"}}>前往「训练」强化属性</div>
                </div>
                <div style={{display:"flex",gap:8,flexDirection:"column",alignItems:"flex-end"}}>
                  {seasonAwards && <button onClick={()=>setShowAwards(true)} style={{padding:"6px 12px",background:"#ffd70022",border:"1px solid #ffd70044",borderRadius:8,color:"#ffd700",fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>🏆 查看颁奖</button>}
                  {offseasonDone && !freeAgent && <button onClick={startNextSeason} style={{padding:"6px 12px",background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>开始 S{season+1}</button>}
                  {freeAgent && <button onClick={()=>setContractModal(true)} style={{padding:"6px 12px",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:8,color:"#ff8888",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>⚠ 自由球员，待签</button>}
                </div>
              </div>
            </div>
          )}
          {injury && (
            <div style={{background:"#2a0d0d",borderRadius:10,padding:"9px 14px",marginBottom:10,border:"1px solid #ff444444"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#ff6b6b"}}>🤕 {injury.name} · 还需 {injury.gamesLeft} 场</div>
            </div>
          )}

          {/* Month nav — always visible */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <button onClick={prevMonth} style={{background:"#111827",border:"1px solid #ffffff22",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"sans-serif"}}>‹</button>
            <div style={{fontSize:14,fontWeight:700}}>{fmtMonthLabel(calYear,calMonth)}</div>
            <button onClick={nextMonth} style={{background:"#111827",border:"1px solid #ffffff22",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"sans-serif"}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:3}}>
            {["日","一","二","三","四","五","六"].map(d=>(
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
              <div style={{fontSize:11,color:"#555",letterSpacing:1,marginBottom:6}}>最近比赛</div>
              {played.slice(-4).reverse().map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#111827",borderRadius:8,marginBottom:5,border:"1px solid "+(g.status==="won"?"#00ff8818":"#ff44441a")}}>
                  <div style={{fontSize:12,fontWeight:700,color:g.status==="won"?"#00ff88":"#ff5555",minWidth:16}}>{g.status==="won"?"W":"L"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#ccc"}}>vs {g.opp}{g.stats?.rested&&<span style={{color:"#88aaff",fontSize:10}}> 休战</span>}{g.stats?.injured&&<span style={{color:"#ff8888",fontSize:10}}> 🤕</span>}</div>
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
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:4}}>综合能力</div>
            <div style={{fontSize:50,fontWeight:900,color:ac,lineHeight:1}}>{player.overall}</div>
            <div style={{fontSize:12,color:"#555"}}>OVR · {player.archetype} · S{season}</div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:12}}>属性 & 潜力上限</div>
            {Object.entries(player.stats).map(([k,v])=>{
              const eff = injury&&injury.affectedStats.includes(k)?Math.max(28,Math.round(v*0.68)):v;
              return (
                <div key={k}>
                  <StatBar label={STAT_LABELS[k]} value={eff} ceiling={player.ceiling[k]} max={99} color={injury&&injury.affectedStats.includes(k)?"#ff6b6b":ac}/>
                  {injury&&injury.affectedStats.includes(k) && <div style={{fontSize:10,color:"#ff8888",marginTop:-6,marginBottom:6}}>🤕 伤病影响（原 {v}）</div>}
                </div>
              );
            })}
            <div style={{fontSize:10,color:"#333",marginTop:6}}>灰色区域 = 个人潜力上限</div>
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>本赛季场均</div>
            {played.filter(g=>!g.stats?.rested).length===0 ? <div style={{fontSize:13,color:"#444",textAlign:"center",padding:"12px 0"}}>还没有出场记录</div> :
              [["得分",avg.pts,40],["助攻",avg.ast,15],["篮板",avg.reb,20],["抢断",avg.stl,5],["盖帽",avg.blk,5]].map(([l,v,m])=>(<StatBar key={l} label={l} value={v} max={m} color={ac}/>))}
          </div>
          <div style={{background:"#111827",borderRadius:12,padding:16,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>提高空间分析</div>
            {Object.entries(player.stats).map(([k,v])=>{
              const cap=player.ceiling[k], gap=cap-v;
              const lbl=gap>20?"🔴 重点提升":gap>10?"🟡 有空间":"🟢 接近上限";
              return (
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #ffffff06"}}>
                  <span style={{fontSize:13,color:"#ccc"}}>{STAT_LABELS[k]}</span>
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
                  <div><div style={{fontSize:14,fontWeight:700}}>训练点数</div><div style={{fontSize:11,color:"#555",marginTop:2}}>每点 +2属性（不超个人上限）</div></div>
                  <div style={{fontSize:28,fontWeight:900,color:ac}}>{6-totalAlloc}</div>
                </div>
              </div>
              {TRAINING_OPTIONS.map(opt=>{
                const alloc=trainAlloc[opt.stat], cur=player.stats[opt.stat], cap=player.ceiling[opt.stat];
                const proj=Math.min(cap,cur+alloc*2), atCap=cur>=cap;
                return (
                  <div key={opt.id} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(alloc>0?ac+"44":"#ffffff0d"),opacity:atCap?0.4:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div><div style={{fontSize:14,fontWeight:700}}>{opt.icon} {opt.label}</div><div style={{fontSize:11,color:"#555",marginTop:2}}>{opt.desc}{atCap?" · 已达上限":""}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#666"}}>{STAT_LABELS[opt.stat]} /{cap}</div><div style={{fontSize:15,fontWeight:700,color:alloc>0?"#00ff88":ac}}>{cur}{alloc>0&&<span style={{fontSize:12,color:"#00ff88"}}> → {proj}</span>}</div></div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button onClick={()=>allocTrain(opt.stat,-1)} disabled={alloc===0||atCap}
                        style={{width:34,height:34,borderRadius:8,background:"#1a1a2e",border:"1px solid #ffffff22",color:(alloc===0||atCap)?"#333":"#fff",fontSize:18,cursor:(alloc===0||atCap)?"not-allowed":"pointer",fontFamily:"sans-serif"}}>−</button>
                      <div style={{flex:1,height:7,background:"#1a1a2e",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:(alloc/6*100)+"%",background:ac,transition:"width 0.3s"}}/></div>
                      <div style={{fontSize:14,fontWeight:700,color:ac,minWidth:18,textAlign:"center"}}>{alloc}</div>
                      <button onClick={()=>allocTrain(opt.stat,1)} disabled={totalAlloc>=6||atCap}
                        style={{width:34,height:34,borderRadius:8,background:(totalAlloc>=6||atCap)?"#111":"#1a2a1a",border:"1px solid "+((totalAlloc>=6||atCap)?"#333":ac+"44"),color:(totalAlloc>=6||atCap)?"#333":ac,fontSize:18,cursor:(totalAlloc>=6||atCap)?"not-allowed":"pointer",fontFamily:"sans-serif"}}>+</button>
                    </div>
                  </div>
                );
              })}
              <button onClick={confirmTraining} disabled={totalAlloc===0}
                style={{width:"100%",padding:"15px 0",fontSize:15,fontWeight:700,background:totalAlloc>0?"linear-gradient(135deg,#f9a01b,#ffd700)":"#222",border:"none",borderRadius:12,color:totalAlloc>0?"#000":"#555",cursor:totalAlloc>0?"pointer":"not-allowed",fontFamily:"sans-serif",marginTop:4}}>
                确认训练计划
              </button>
            </div>
          ) : offseasonDone ? (
            <div style={{background:"#1a2a1a",borderRadius:12,padding:20,border:"1px solid #00ff8844",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:8}}>✅</div>
              <div style={{fontSize:15,fontWeight:700,color:"#00ff88"}}>训练已完成 · OVR {player.overall}</div>
              <div style={{fontSize:13,color:"#888",marginTop:6}}>返回赛程页开始新赛季</div>
            </div>
          ) : (
            <div style={{background:"#1a1a0d",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #f9a01b44"}}>
              <div style={{fontSize:14,color:"#f9a01b"}}>⏳ 休赛期训练在赛季结束后开放</div>
            </div>
          )}
        </div>
      )}

      {/* ════ RELATIONS ════ */}
      {view==="relations" && (
        <div style={{padding:14}}>
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:12}}>管理层关系</div>
          {PERSON_TYPES.map(pt=>{
            const val=relationships[pt.key];
            const q=val>=70?"融洽":val>=45?"一般":"紧张";
            const col=val>=70?"#00ff88":val>=45?"#f9a01b":"#ff5555";
            return (
              <div key={pt.key} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid "+(val<30?"#ff444444":"#ffffff0d")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div style={{fontSize:15,fontWeight:700}}>{pt.icon} {pt.label}</div><div style={{fontSize:11,color:col,marginTop:2}}>{q} · {val}/100</div></div>
                  <button onClick={async()=>{setRelModal(pt.key);if(!relStory[pt.key])await loadRelStory(pt.key);}}
                    style={{padding:"6px 12px",background:"#1a1a2e",border:"1px solid "+ac+"44",borderRadius:8,color:ac,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>详情</button>
                </div>
                <div style={{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:val+"%",background:col,borderRadius:3,transition:"width 0.5s"}}/></div>
                {val<30 && <div style={{fontSize:11,color:"#ff6b6b",marginTop:6}}>⚠ 关系极差，可能被交易</div>}
              </div>
            );
          })}

          {/* Teammates */}
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10,marginTop:4}}>队友关系</div>
          {teammates.map((tm,i)=>{
            const col=tm.rapport>=70?"#00ff88":tm.rapport>=45?"#f9a01b":"#ff5555";
            const q=tm.rapport>=70?"兄弟":tm.rapport>=45?"普通":"不和";
            return (
              <div key={tm.id} style={{background:"#111827",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #ffffff0d"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>🏀 {tm.name}</div>
                    <div style={{fontSize:11,color:"#555"}}>{tm.role} · OVR {tm.ovr}</div>
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
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>申请交易</div>
            <div style={{fontSize:12,color:"#666",marginBottom:10}}>主动申请（GM -10，老板 -8）</div>
            {tradeResult ? (
              <div>
                <div style={{background:"#0f1923",borderRadius:10,padding:12,borderLeft:"4px solid #f9a01b",marginBottom:10}}>
                  <div style={{fontSize:13,color:"#ddd",lineHeight:1.6}}>{tradeResult}</div>
                </div>
                <button onClick={()=>setTradeResult(null)} style={{padding:"6px 14px",background:"#333",border:"none",borderRadius:8,color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>关闭</button>
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
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:10}}>当前合同</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:ac}}>${contract.salary}M / 年</div>
                <div style={{fontSize:12,color:"#666"}}>{contract.type==="rookie"?"新秀合同":"标准合同"} · 第{contract.year}/{contract.totalYears}年</div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,color:"#888"}}>剩余 {Math.max(0,contract.totalYears-contract.year)} 年</div></div>
            </div>
            {contract.year>=contract.totalYears && !contractOffer && (
              <button onClick={()=>{const base=Math.max(8,Math.round((player.overall-60)*0.9+season*0.5));const yrs=Math.floor(Math.random()*3)+2;setContractOffer({salary:base,years:yrs});setContractModal(true);}}
                style={{width:"100%",marginTop:12,padding:"10px 0",background:team.color,border:"1px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                💼 开始续约谈判
              </button>
            )}
          </div>
          <div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:10}}>品牌合作</div>
          {brands.length===0 ? (
            <div style={{background:"#111827",borderRadius:12,padding:20,textAlign:"center",color:"#444",marginBottom:12}}>
              <div style={{fontSize:28,marginBottom:8}}>📦</div>
              <div>还没有品牌合作</div>
              <div style={{fontSize:12,marginTop:4}}>打出成绩，经纪人自然会带来好消息</div>
            </div>
          ) : brands.map((b,i)=>(
            <div key={i} style={{background:"#111827",borderRadius:12,padding:14,marginBottom:10,border:"1px solid #ffffff0d",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{b.icon} {b.name}</div><div style={{fontSize:12,color:"#888"}}>{b.type}</div></div>
              <div style={{fontSize:16,fontWeight:700,color:"#00ff88"}}>${b.offer}M/年</div>
            </div>
          ))}
          <div style={{background:"#0f1923",borderRadius:10,padding:14,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",marginBottom:6}}>年度总收入</div>
            <div style={{fontSize:22,fontWeight:700,color:"#ffd700"}}>${(contract.salary+brands.reduce((a,b)=>a+b.offer,0)).toFixed(1)}M</div>
            <div style={{fontSize:11,color:"#555"}}>合同 ${contract.salary}M + 代言 ${brands.reduce((a,b)=>a+b.offer,0).toFixed(1)}M</div>
          </div>
        </div>
      )}

      {/* ════ FINANCES ════ */}
      {view==="finances" && (
        <div style={{padding:14}}>
          {/* Net worth summary */}
          <div style={{background:"#111827",borderRadius:12,padding:16,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:4}}>个人财产</div>
            <div style={{fontSize:38,fontWeight:900,color:"#ffd700"}}>${savings.toFixed(2)}M</div>
            <div style={{fontSize:12,color:"#555",marginTop:2}}>储蓄 · 税后收入每赛季自动入账</div>
            {currentRental && <div style={{fontSize:11,color:"#f9a01b",marginTop:4}}>🏠 租房中：{currentRental.name} · ${(currentRental.monthly*12).toFixed(2)}M/年</div>}
            {ownedHouse && <div style={{fontSize:11,color:"#00ff88",marginTop:4}}>🏡 已购房：{ownedHouse.name}（{ownedHouse.city}）</div>}
          </div>

          {/* Housing */}
          <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>住房</div>
          <div style={{background:"#111827",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #ffffff0d"}}>
            <div style={{fontSize:12,color:"#666",marginBottom:10}}>当前城市：{team.city}</div>
            {!ownedHouse && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>租房选项（每年扣除）</div>
                {RENT_OPTIONS.map(r=>{
                  const isRenting = currentRental?.id===r.id;
                  const canAfford = savings >= r.monthly;
                  return (
                    <div key={r.id} style={{background:isRenting?"#1a2a0d":"#0d1117",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid "+(isRenting?"#00ff8844":"#ffffff0d"),display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,color:isRenting?"#00ff88":"#ccc"}}>{r.icon} {r.name}</div>
                        <div style={{fontSize:10,color:"#555"}}>{r.desc} · ${(r.monthly*12).toFixed(2)}M/年</div>
                      </div>
                      <button onClick={()=>setCurrentRental(isRenting?null:r)} style={{padding:"5px 12px",background:isRenting?"#2a0d0d":"#1a2a1a",border:"1px solid "+(isRenting?"#ff444444":"#00ff8844"),borderRadius:8,color:isRenting?"#ff8888":"#00ff88",fontSize:11,cursor:"pointer",fontFamily:"sans-serif"}}>
                        {isRenting?"退租":"租房"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{fontSize:11,color:"#f9a01b",marginBottom:6}}>购房（{team.city}）</div>
            {HOUSES.map(h=>{
              const affordable = savings >= h.price;
              const isOwned = ownedHouse?.id===h.id;
              return (
                <div key={h.id} style={{background:isOwned?"#1a2a0d":"#0d1117",borderRadius:8,padding:"10px 12px",marginBottom:6,border:"1px solid "+(isOwned?"#00ff8844":affordable?"#ffffff11":"#ffffff05"),display:"flex",justifyContent:"space-between",alignItems:"center",opacity:affordable||isOwned?1:0.5}}>
                  <div>
                    <div style={{fontSize:13,color:isOwned?"#00ff88":affordable?"#ccc":"#555"}}>{h.icon} {h.name}</div>
                    <div style={{fontSize:10,color:"#555"}}>{h.desc} · ${h.price}M</div>
                  </div>
                  {isOwned ? (
                    <button onClick={()=>{setSavings(prev=>+(prev+h.price*0.85).toFixed(2));setOwnedHouse(null);}} style={{padding:"5px 10px",background:"#2a0d0d",border:"1px solid #ff444444",borderRadius:8,color:"#ff8888",fontSize:10,cursor:"pointer",fontFamily:"sans-serif"}}>卖出</button>
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
          <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>车辆</div>
          <div style={{background:"#111827",borderRadius:12,padding:14,marginBottom:12,border:"1px solid #ffffff0d"}}>
            {ownedCars.length>0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#888",marginBottom:6}}>已拥有</div>
                {ownedCars.map((c,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #ffffff06"}}>
                    <div style={{fontSize:13,color:"#00ff88"}}>{c.icon} {c.name}</div>
                    <button onClick={()=>{setSavings(prev=>+(prev+c.price*0.7).toFixed(2));setOwnedCars(prev=>prev.filter((_,j)=>j!==i));}} style={{padding:"4px 10px",background:"#2a0d0d",border:"1px solid #ff444422",borderRadius:6,color:"#ff8888",fontSize:10,cursor:"pointer",fontFamily:"sans-serif"}}>卖出</button>
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
                    <div style={{fontSize:13,color:affordable?"#ccc":"#555"}}>{c.icon} {c.name}</div>
                    <div style={{fontSize:10,color:"#555"}}>{c.desc} · ${c.price}M</div>
                  </div>
                  <button disabled={!affordable} onClick={()=>{setSavings(prev=>+(prev-c.price).toFixed(2));setOwnedCars(prev=>[...prev,c]);}} style={{padding:"5px 12px",background:affordable?"#1a2a1a":"#111",border:"1px solid "+(affordable?"#00ff8844":"#ffffff05"),borderRadius:8,color:affordable?"#00ff88":"#333",fontSize:11,cursor:affordable?"pointer":"not-allowed",fontFamily:"sans-serif"}}>
                    {affordable?"购买":"资金不足"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ DAY MODAL ════ */}
      {dayModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setDayModal(null)}>
          <div style={{background:"#111827",borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{(calMonth+1)+"月"+dayModal.day+"日"}</div>
            {dayModal.game ? (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,color:ac,marginBottom:4}}>{dayModal.game.home?"主场":"客场"} vs {dayModal.game.opp}</div>
                {dayModal.game.status!=="upcoming" && <div style={{fontSize:12,color:dayModal.game.status==="won"?"#00ff88":"#ff5555"}}>{dayModal.game.status==="won"?"✅ 胜":"❌ 负"}{dayModal.game.stats&&!dayModal.game.stats.rested?" · "+dayModal.game.stats.pts+"分 "+dayModal.game.stats.ast+"助 "+dayModal.game.stats.reb+"篮":"  休战"}</div>}
              </div>
            ) : <div style={{fontSize:13,color:"#555",marginBottom:14}}>本日无比赛</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {dayModal.game&&dayModal.game.status==="upcoming" && (
                <button onClick={async()=>{await simulateUpTo(dayModal.game.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"13px 0",background:team.color,border:"2px solid "+ac,borderRadius:10,color:ac,fontWeight:700,fontSize:14,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  ▶ 模拟到这场比赛
                </button>
              )}
              {calGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=calGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"12px 0",background:"#1a2a1a",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontWeight:700,fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  ▶▶ 模拟本月所有比赛
                </button>
              )}
              {regularGames.filter(g=>g.status==="upcoming").length>0 && (
                <button onClick={async()=>{const l=regularGames.filter(g=>g.status==="upcoming").slice(-1)[0];if(l)await simulateUpTo(l.id);setDayModal(null);}} disabled={simming}
                  style={{width:"100%",padding:"12px 0",background:"#1a1a2e",border:"1px solid #ffffff22",borderRadius:10,color:"#888",fontSize:13,cursor:simming?"not-allowed":"pointer",fontFamily:"sans-serif"}}>
                  ⏩ 模拟剩余所有常规赛
                </button>
              )}
              <button onClick={()=>setDayModal(null)} style={{width:"100%",padding:"10px 0",background:"transparent",border:"1px solid #ffffff11",borderRadius:10,color:"#555",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ REST MODAL ════ */}
      {restModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:360,border:"1px solid #88aaff44"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>😴 申请休战</div>
            <div style={{fontSize:13,color:"#888",marginBottom:20}}>休战期间球队会用其他球员上场，比赛胜率略降但你的状态得到保护。</div>
            <div style={{fontSize:11,color:"#aaa",marginBottom:8}}>休战场数</div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <button onClick={()=>setRestInput(Math.max(1,restInput-1))} style={{width:40,height:40,borderRadius:10,background:"#1a1a2e",border:"1px solid #ffffff22",color:"#fff",fontSize:20,cursor:"pointer",fontFamily:"sans-serif"}}>−</button>
              <div style={{flex:1,textAlign:"center",fontSize:32,fontWeight:900,color:"#88aaff"}}>{restInput}</div>
              <button onClick={()=>setRestInput(Math.min(20,restInput+1))} style={{width:40,height:40,borderRadius:10,background:"#1a1a2e",border:"1px solid #88aaff44",color:"#88aaff",fontSize:20,cursor:"pointer",fontFamily:"sans-serif"}}>+</button>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setResting(restInput);setRestModal(false);}} style={{flex:1,padding:"12px 0",background:"#88aaff",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"sans-serif"}}>确认休战 {restInput} 场</button>
              <button onClick={()=>setRestModal(false)} style={{flex:1,padding:"12px 0",background:"#222",border:"none",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>取消</button>
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
              <button onClick={()=>setRelModal(null)} style={{flex:1,padding:"10px 0",background:"#222",border:"none",borderRadius:10,color:"#888",fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>关闭</button>
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
              <div style={{fontSize:12,color:"#888",marginBottom:14}}>你的合同已到期，成为自由球员。选择一份合同开始新赛季。</div>
            )}

            {/* Current offer */}
            <div style={{background:"#0d1923",borderRadius:12,padding:16,marginBottom:12,border:"1px solid "+ac+"33"}}>
              <div style={{fontSize:12,color:"#888",marginBottom:4}}>当前选中的报价</div>
              <div style={{fontSize:13,fontWeight:700,color:contractOffer.isHome?"#f9a01b":"#ccc",marginBottom:6}}>{contractOffer.source}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:26,fontWeight:900,color:ac}}>${contractOffer.salary}M<span style={{fontSize:12,color:"#888",fontWeight:400}}>/年</span></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,color:"#ccc"}}>{contractOffer.years}年</div>
                  <div style={{fontSize:11,color:"#555"}}>总值 ${(contractOffer.salary*contractOffer.years).toFixed(0)}M</div>
                </div>
              </div>
              {/* Adjust salary */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setContractOffer(prev=>({...prev,salary:Math.max(1,+(prev.salary-0.5).toFixed(1))}))}
                  style={{width:34,height:34,borderRadius:8,background:"#1a1a2e",border:"1px solid #ffffff22",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"sans-serif"}}>−</button>
                <div style={{flex:1,textAlign:"center",fontSize:11,color:"#555"}}>手动调整薪水</div>
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
                setContractModal(false); setContractOffer(null); setFreeAgent(false); setFaOffers([]);
              }} style={{flex:2,padding:"12px 0",background:"linear-gradient(135deg,#00ff88,#00cc66)",border:"none",borderRadius:10,color:"#000",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"sans-serif"}}>
                ✓ 接受
              </button>
              <button onClick={()=>setContractOffer(prev=>({...prev,salary:+(prev.salary+Math.floor(Math.random()*3)+1).toFixed(1)}))}
                style={{flex:1,padding:"12px 0",background:"#1a2a1a",border:"1px solid #00ff8844",borderRadius:10,color:"#00ff88",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>
                📈 要价
              </button>
            </div>

            {/* All FA offers list */}
            {faOffers.length>0 && (
              <div>
                <div style={{fontSize:11,color:"#888",letterSpacing:1,marginBottom:8}}>全联盟报价 ({faOffers.length}支球队)</div>
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
                            <div style={{fontSize:12,color:isSelected?ac:"#ccc",fontWeight:isSelected?700:400}}>{o.source}</div>
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
                稍后决定（成为自由球员）
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════ AWARDS MODAL ════ */}
      {showAwards && seasonAwards && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:300,padding:"20px 16px",overflowY:"auto"}}>
          <div style={{background:"#111827",borderRadius:16,padding:24,width:"100%",maxWidth:440,border:"1px solid #ffd70044"}}>
            <div style={{fontSize:11,color:"#ffd700",letterSpacing:3,marginBottom:8}}>年度颁奖典礼</div>
            <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>第{season}赛季荣誉</div>

            {[
              {label:"常规赛MVP",icon:"🏆",value:seasonAwards.mvp},
              {label:"最佳防守球员 (DPOY)",icon:"🛡",value:seasonAwards.dpoy},
              {label:"总冠军球队",icon:"🏅",value:seasonAwards.champion},
              {label:"总决赛MVP",icon:"🥇",value:seasonAwards.fmvp},
              {label:"最佳教练",icon:"📋",value:seasonAwards.bestCoach},
            ].map(a=>{
              const isMe = a.value===player.name;
              const isMyTeam = a.label==="总冠军球队" && seasonAwards.iChampion;
              return (
                <div key={a.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #ffffff08"}}>
                  <div style={{fontSize:12,color:"#888"}}>{a.icon} {a.label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:(isMe||isMyTeam)?"#ffd700":"#ccc"}}>{a.value}{(isMe||isMyTeam)&&" ⭐"}</div>
                </div>
              );
            })}

            {[
              {label:"年度最佳阵容一队",members:seasonAwards.allNBA1},
              {label:"年度最佳阵容二队",members:seasonAwards.allNBA2},
              {label:"年度最佳阵容三队",members:seasonAwards.allNBA3},
              {label:"最佳防守阵容一队",members:seasonAwards.allDef1},
              {label:"最佳防守阵容二队",members:seasonAwards.allDef2},
              {label:"最佳新秀阵容一队",members:seasonAwards.allRookie1},
              {label:"最佳新秀阵容二队",members:seasonAwards.allRookie2},
            ].map(a=>{
              const hasMe = a.members.includes(player.name);
              return (
                <div key={a.label} style={{marginTop:10}}>
                  <div style={{fontSize:11,color:hasMe?"#ffd700":"#666",marginBottom:4}}>{hasMe?"⭐ ":""}{a.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {a.members.map((m,i)=>(
                      <div key={i} style={{background:m===player.name?"#ffd70022":"#1a1a2e",borderRadius:6,padding:"4px 10px",fontSize:11,color:m===player.name?"#ffd700":"#aaa",border:"1px solid "+(m===player.name?"#ffd70044":"#ffffff0d")}}>{m}</div>
                    ))}
                  </div>
                </div>
              );
            })}

            <button onClick={()=>setShowAwards(false)}
              style={{width:"100%",marginTop:20,padding:"13px 0",background:"linear-gradient(135deg,#f9a01b,#ffd700)",border:"none",borderRadius:12,color:"#000",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"sans-serif"}}>
              关闭颁奖典礼
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

  if(screen==="lobby") return <SavesLobby onLoad={onLoad} onNew={()=>setScreen("create")}/>;
  if(screen==="create") return <CreateScreen onDone={p=>{setPendingPlayer(p);setScreen("draft");}} onBack={()=>setScreen("lobby")}/>;
  if(screen==="draft" && pendingPlayer) return <DraftScreen player={pendingPlayer} onDrafted={onDrafted} onBack={()=>setScreen("create")}/>;
  if(screen==="game" && activeInit) return <MainScreen saveId={activeSaveId} init={activeInit} onQuit={()=>setScreen("lobby")}/>;
  return null;
}
