// src/i18n.ts
// Bilingual dictionary + helpers for NBA My Career.
// Language is persisted in localStorage under LANG_KEY.

import React, { useState, useEffect, createContext, useContext } from "react";

export type Lang = "zh" | "en";
export const LANG_KEY = "nba_lang";
export const LangContext = createContext<Lang>("zh");

export function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "zh" || saved === "en") return saved;
    const navLang = (typeof navigator !== "undefined" ? navigator.language : "") || "";
    return navLang.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch {
    return "zh";
  }
}
export function saveLang(lang: Lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
}
export function useLang(): Lang { return useContext(LangContext); }

// Pick zh/en value from a bilingual object, with safety fallback.
export function L(obj: any, lang: Lang): string {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.zh ?? obj.en ?? String(obj);
}

// Translate by dot-key, optionally interpolating {var} placeholders.
export function t(key: string, lang: Lang, vars?: Record<string, any>): string {
  const v = DICT[key];
  let s: string;
  if (!v) s = key; // fallback to key itself so missing strings stand out
  else s = v[lang] ?? v.zh ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? String(vars[k]) : "{"+k+"}");
  return s;
}

// ── Dictionary ───────────────────────────────────────────────────────────────
// Keyed by "section.subkey". Each value is { zh, en }.
type Entry = { zh: string; en: string };
export const DICT: Record<string, Entry> = {
  // App-level
  "app.title": { zh: "MY CAREER", en: "MY CAREER" },
  "app.subtitle": { zh: "NBA CAREER MODE", en: "NBA CAREER MODE" },
  "app.no_saves_emoji_caption": { zh: "还没有存档，创建你的第一个生涯", en: "No saves yet — start your first career" },
  "app.new_career": { zh: "+ 新建生涯", en: "+ New Career" },
  "app.continue": { zh: "继续游戏", en: "Continue" },
  "app.delete": { zh: "删除", en: "Delete" },
  "app.confirm_delete": { zh: "确认删除", en: "Confirm Delete" },
  "app.cancel": { zh: "取消", en: "Cancel" },
  "app.back": { zh: "返回", en: "Back" },
  "app.close": { zh: "关闭", en: "Close" },
  "app.season": { zh: "第{n}赛季", en: "Season {n}" },
  "app.wins_losses": { zh: "{w}胜{l}负", en: "{w}-{l}" },
  "app.injured_label": { zh: "🤕伤病", en: "🤕 Injured" },
  "app.years_old": { zh: "{n}岁", en: "Age {n}" },

  // Create
  "create.title": { zh: "创建球员", en: "Create Player" },
  "create.label_name": { zh: "球员姓名", en: "Player Name" },
  "create.placeholder_name": { zh: "输入你的名字或点击随机...", en: "Enter your name or hit random..." },
  "create.random_name": { zh: "🎲 随机", en: "🎲 Random" },
  "create.label_position": { zh: "位置", en: "Position" },
  "create.label_archetype": { zh: "打法风格", en: "Archetype" },
  "create.custom": { zh: "自定义", en: "Custom" },
  "create.checked_custom": { zh: "✓ 自定义", en: "✓ Custom" },
  "create.edit_custom": { zh: "✏ 自定义", en: "✏ Custom" },
  "create.other_custom": { zh: "✏ 其他（自定义输入）", en: "✏ Other (write your own)" },
  "create.custom_placeholder": { zh: "例如：全能摇摆人、空间型大前锋...", en: "e.g. all-around wing, stretch four..." },
  "create.custom_ai_note": { zh: "AI会根据你的风格生成解说", en: "Commentary will adapt to your style" },
  "create.label_age": { zh: "入联年龄", en: "Entry Age" },
  "create.age_value": { zh: "{n} 岁", en: "Age {n}" },
  "create.age_lo": { zh: "18 · 高潜力", en: "18 · High potential" },
  "create.age_hi": { zh: "26 · 已成熟", en: "26 · Mature" },
  "create.age_note": { zh: "年龄越大初始属性越高，但生涯越短。32 岁后潜力开始衰退。", en: "Older rookies start higher but careers are shorter. Potential decays after 32." },
  "create.label_physicals": { zh: "身体数据", en: "Physicals" },
  "create.reroll_physicals": { zh: "🎲 随机重置", en: "🎲 Re-roll" },
  "create.height": { zh: "身高", en: "Height" },
  "create.wingspan": { zh: "臂展", en: "Wingspan" },
  "create.weight": { zh: "体重", en: "Weight" },
  "create.static_traits": { zh: "静态天赋", en: "Static Traits" },
  "create.dynamic_traits": { zh: "动态天赋", en: "Dynamic Traits" },
  "create.traits_note": { zh: "(天赋随机生成，可重置)", en: "(Traits are random — re-roll if you want)" },
  "create.potential_warn": { zh: "⚠ 潜力说明", en: "⚠ About Potential" },
  "create.potential_body": { zh: "属性上限完全随机，身体天赋也各不相同。伤病可能永久限制成长空间。发挥打法特点才能最大化潜力。", en: "Stat ceilings are fully random and physical gifts vary. Injuries can permanently cap growth. Play to your archetype to maximize potential." },
  "create.go_draft": { zh: "前往选秀大会 →", en: "Go to Draft Night →" },

  // Draft
  "draft.subtitle": { zh: "NBA DRAFT NIGHT", en: "NBA DRAFT NIGHT" },
  "draft.you_are_in": { zh: "你已就位", en: "You're On the Clock" },
  "draft.intro": { zh: "30支球队的GM都在研究你的录像。\n选秀大厅灯光璀璨，你西装笔挺地坐在台下……", en: "All 30 GMs have your tape under their pillow.\nThe draft hall lights are blinding — you're in your sharpest suit." },
  "draft.start": { zh: "开始选秀", en: "Begin Draft" },
  "draft.in_progress": { zh: "选秀进行中...", en: "Draft underway..." },
  "draft.pick_n": { zh: "第 {n} 顺位", en: "Pick #{n}" },
  "draft.label_pick": { zh: "NBA DRAFT PICK", en: "NBA DRAFT PICK" },
  "draft.commentary": { zh: "解说", en: "Commentary" },
  "draft.start_career": { zh: "开始生涯 →", en: "Start Career →" },

  // Main header / tabs
  "main.save_btn": { zh: "← 存档", en: "← Saves" },
  "main.saved": { zh: "已保存 ✓", en: "Saved ✓" },
  "tab.calendar": { zh: "📅 赛程", en: "📅 Schedule" },
  "tab.playoffs": { zh: "🏆 季后赛", en: "🏆 Playoffs" },
  "tab.standings": { zh: "📋 战绩", en: "📋 Standings" },
  "tab.player": { zh: "🧬 球员", en: "🧬 Player" },
  "tab.stats": { zh: "📊 数据", en: "📊 Stats" },
  "tab.offseason": { zh: "🏋 训练", en: "🏋 Training" },
  "tab.relations": { zh: "👥 人际", en: "👥 Relations" },
  "tab.agent": { zh: "💰 经纪", en: "💰 Agent" },
  "tab.finances": { zh: "🏠 财产", en: "🏠 Assets" },

  // Alerts/banners
  "alert.trade_danger": { zh: "⚠ 管理层关系告急，可能被交易", en: "⚠ Front office relations critical — trade likely" },
  "alert.trade_view": { zh: "查看", en: "View" },
  "alert.brand_offer": { zh: "💼 经纪人：品牌邀约", en: "💼 Agent: Brand Offer" },
  "alert.brand_per_year": { zh: "{name}（{type}）→ ${offer}M/年", en: "{name} ({type}) → ${offer}M/yr" },
  "alert.accept": { zh: "接受", en: "Accept" },
  "alert.reject": { zh: "拒绝", en: "Decline" },

  // Standings view
  "standings.legend_direct": { zh: "■ 直接晋级", en: "■ Direct Seed" },
  "standings.legend_playin": { zh: "■ 附加赛 (7-10)", en: "■ Play-In (7-10)" },
  "standings.legend_out": { zh: "■ 淘汰", en: "■ Eliminated" },
  "standings.col_team": { zh: "球队", en: "Team" },
  "standings.col_w": { zh: "胜", en: "W" },
  "standings.col_l": { zh: "负", en: "L" },
  "standings.col_pct": { zh: "胜率", en: "PCT" },
  "standings.your_team": { zh: "← 你的球队", en: "← Your Team" },
  "standings.tab_west": { zh: "西部", en: "West" },
  "standings.tab_east": { zh: "东部", en: "East" },
  "standings.playin_rules_title": { zh: "附加赛规则", en: "Play-In Tournament Rules" },
  "standings.playin_rules": { zh: "7号打8号 → 赢者直接晋级第7种子\n9号打10号 → 赢者获得机会\n7/8输者 vs 9/10赢者 → 赢者晋级第8种子\n11-15名：直接无缘季后赛", en: "7 vs 8 → winner takes 7-seed\n9 vs 10 → winner advances\nLoser of 7-vs-8 vs winner of 9-vs-10 → winner takes 8-seed\n11-15: out of playoffs" },
  "standings.empty": { zh: "完成几场比赛后联盟战绩才会显示", en: "Play a few games — standings will appear" },

  // Playoffs view
  "playoffs.next_game": { zh: "下一场", en: "Next Game" },
  "playoffs.sim_one": { zh: "▶ 单场", en: "▶ Sim Game" },
  "playoffs.sim_all": { zh: "⏩ 全部", en: "⏩ Sim All" },
  "playoffs.simming": { zh: "模拟中...", en: "Simming..." },
  "playoffs.tab_pair": { zh: "{conf}对阵", en: "{conf} Bracket" },
  "playoffs.not_in_playoff": { zh: "⚠ 你的球队未进入季后赛 — 仍可观看并模拟其他对阵", en: "⚠ Your team missed the playoffs — you can still watch and sim others" },
  "playoffs.finals_label": { zh: "🏆 NBA总决赛", en: "🏆 NBA Finals" },
  "playoffs.champion_won": { zh: "NBA总冠军！", en: "NBA CHAMPIONS!" },
  "playoffs.champion_team": { zh: "季后赛冠军：{team}", en: "Playoff Champion: {team}" },
  "playoffs.to_offseason": { zh: "→ 进入休赛期", en: "→ Enter Offseason" },
  "playoffs.round_first": { zh: "首轮", en: "First Round" },
  "playoffs.round_semi": { zh: "半决赛", en: "Conference Semis" },
  "playoffs.round_conf": { zh: "分区决赛", en: "Conference Finals" },
  "playoffs.round_finals": { zh: "总决赛", en: "Finals" },
  "playoffs.my_match": { zh: "我的对阵", en: "Your Series" },
  "playoffs.advance": { zh: "✓ 晋级", en: "✓ Advance" },
  "playoffs.eliminated": { zh: "✗ 出局", en: "✗ Eliminated" },
  "playoffs.in_progress": { zh: "进行中", en: "In Progress" },
  "playoffs.sim_game_n": { zh: "▶ 模拟第{n}场", en: "▶ Sim Game {n}" },
  "playoffs.empty_waiting": { zh: "常规赛结束后自动生成对阵表", en: "Bracket appears once the regular season ends" },
  "playoffs.empty_games_left": { zh: "{n} 场比赛待模拟", en: "{n} games left" },
  "playoffs.generate_bracket": { zh: "生成季后赛对阵表", en: "Generate Bracket" },

  // Calendar view
  "cal.regular_season_done": { zh: "常规赛已结束", en: "Regular Season Complete" },
  "cal.go_playoffs": { zh: "前往「季后赛」标签继续", en: "Go to the Playoffs tab to continue" },
  "cal.to_playoffs": { zh: "→ 季后赛", en: "→ Playoffs" },
  "cal.offseason_title": { zh: "☀ 休赛期", en: "☀ Offseason" },
  "cal.offseason_hint": { zh: "前往「训练」强化属性", en: "Use the Training tab to improve attributes" },
  "cal.see_awards": { zh: "🏆 查看颁奖", en: "🏆 View Awards" },
  "cal.start_next_season": { zh: "开始 S{n}", en: "Start S{n}" },
  "cal.fa_waiting": { zh: "⚠ 自由球员，待签", en: "⚠ Free Agent — waiting" },
  "cal.injury_banner": { zh: "🤕 {name} · 还需 {n} 天", en: "🤕 {name} · {n} more days" },
  "cal.weekdays": { zh: "日,一,二,三,四,五,六", en: "Sun,Mon,Tue,Wed,Thu,Fri,Sat" },
  "cal.sim_month": { zh: "▶▶ 本月", en: "▶▶ This Month" },
  "cal.sim_rest": { zh: "⏩ 剩余常规赛", en: "⏩ Rest of Season" },
  "cal.no_game_today": { zh: "本日无比赛", en: "No game today" },
  "cal.home": { zh: "主场", en: "Home" },
  "cal.away": { zh: "客场", en: "Away" },
  "cal.vs": { zh: "vs", en: "vs" },
  "cal.win": { zh: "✅ 胜", en: "✅ W" },
  "cal.loss": { zh: "❌ 负", en: "❌ L" },
  "cal.rested_marker": { zh: "休战", en: "Rested" },
  "cal.sim_to_this": { zh: "▶ 模拟到这场比赛", en: "▶ Sim to this Game" },
  "cal.sim_all_month": { zh: "▶▶ 模拟本月所有比赛", en: "▶▶ Sim All This Month" },
  "cal.sim_remaining": { zh: "⏩ 模拟剩余所有常规赛", en: "⏩ Sim Rest of Season" },
  "cal.day_month": { zh: "{m}月{d}日", en: "{m}/{d}" },
  "cal.month_label": { zh: "{y}年 {m}月", en: "{m} {y}" },
  "cal.recent": { zh: "最近比赛", en: "Recent Games" },

  // Player view
  "player.health_title": { zh: "健康状态", en: "Health" },
  "player.body_static": { zh: "身体天赋（静态）", en: "Physical Gifts" },
  "player.body_dynamic": { zh: "动态天赋（技术特点）", en: "Skill Traits" },
  "player.dynamic_note": { zh: "动态天赋会影响比赛模拟中的数据加成", en: "Skill traits boost sim outputs in matching scenarios" },
  "player.injury_history": { zh: "伤病历史", en: "Injury History" },
  "player.injury_affected": { zh: "受影响属性：", en: "Affected stats: " },
  "player.injury_recovered": { zh: "已愈", en: "Recovered" },
  "player.request_rest": { zh: "😴 申请休战", en: "😴 Request Rest" },
  "player.cancel_rest": { zh: "取消休战", en: "End Rest" },
  "player.rest_games_left": { zh: "还有 {n} 场休战", en: "{n} games rest left" },
  "player.body_no_injury": { zh: "身体无异样", en: "All systems go" },

  // Stats view
  "stats.overall": { zh: "综合能力", en: "Overall" },
  "stats.attr_and_ceiling": { zh: "属性 & 潜力上限", en: "Attributes & Ceilings" },
  "stats.injury_orig": { zh: "🤕 伤病影响（原 {v}）", en: "🤕 Injury-affected (was {v})" },
  "stats.ceiling_note": { zh: "灰色区域 = 个人潜力上限", en: "Faded zone = individual ceiling" },
  "stats.season_avg": { zh: "本赛季场均", en: "Season Averages" },
  "stats.no_records": { zh: "还没有出场记录", en: "No games played yet" },
  "stats.growth_room": { zh: "提高空间分析", en: "Room to Grow" },
  "stats.tag_focus": { zh: "🔴 重点提升", en: "🔴 Priority" },
  "stats.tag_room": { zh: "🟡 有空间", en: "🟡 Room" },
  "stats.tag_near_cap": { zh: "🟢 接近上限", en: "🟢 Near cap" },

  // Stat labels & axis
  "stat.pts": { zh: "得分", en: "PTS" },
  "stat.ast": { zh: "助攻", en: "AST" },
  "stat.reb": { zh: "篮板", en: "REB" },
  "stat.stl": { zh: "抢断", en: "STL" },
  "stat.blk": { zh: "盖帽", en: "BLK" },
  "stat.speed": { zh: "速度", en: "Speed" },
  "stat.shooting": { zh: "投篮", en: "Shooting" },
  "stat.passing": { zh: "传球", en: "Passing" },
  "stat.defense": { zh: "防守", en: "Defense" },
  "stat.strength": { zh: "体能", en: "Strength" },
  "stat.iq": { zh: "篮球IQ", en: "Basketball IQ" },

  // Health statuses
  "health.healthy": { zh: "状态健康", en: "Healthy" },
  "health.rest": { zh: "主动休战", en: "Resting" },
  "health.rest_detail": { zh: "还有 {n} 场休战", en: "{n} games left" },
  "health.minor": { zh: "轻伤", en: "Minor Injury" },
  "health.medium": { zh: "轻中度伤病", en: "Moderate Injury" },
  "health.serious": { zh: "重伤", en: "Major Injury" },
  "health.season": { zh: "赛季报销", en: "Out for Season" },
  "health.detail_days": { zh: "{name} · 还需 {n} 天", en: "{name} · {n} more days" },
  "health.severity_minor": { zh: "轻伤", en: "Minor" },
  "health.severity_medium": { zh: "中伤", en: "Moderate" },
  "health.severity_serious": { zh: "重伤", en: "Major" },
  "health.severity_season": { zh: "赛季报销", en: "Season-Ending" },

  // Positions
  "pos.PG": { zh: "PG · 控卫", en: "PG · Point Guard" },
  "pos.SG": { zh: "SG · 得分后卫", en: "SG · Shooting Guard" },
  "pos.SF": { zh: "SF · 小前锋", en: "SF · Small Forward" },
  "pos.PF": { zh: "PF · 大前锋", en: "PF · Power Forward" },
  "pos.C":  { zh: "C · 中锋", en: "C · Center" },

  // Training view
  "training.points_title": { zh: "训练点数", en: "Training Points" },
  "training.points_note": { zh: "每点 +2属性 · 本赛季总额 {n} 点", en: "+2 each · {n} this season" },
  "training.at_cap": { zh: " · 已达上限", en: " · at cap" },
  "training.confirm": { zh: "确认训练计划", en: "Confirm Training" },
  "training.skip_and_start": { zh: "跳过训练，开始新赛季", en: "Skip Training, Start Next Season" },
  "training.completed": { zh: "训练已完成 · OVR {ovr}", en: "Training Complete · OVR {ovr}" },
  "training.go_calendar": { zh: "返回赛程页开始新赛季", en: "Head back to the Schedule tab" },
  "training.retire": { zh: "🏁 宣布退役", en: "🏁 Retire" },
  "training.closed_during_season": { zh: "⏳ 休赛期训练在赛季结束后开放", en: "⏳ Training opens once the season ends" },
  "training.label_progress": { zh: "{stat} /{cap}", en: "{stat} /{cap}" },

  // Training option labels
  "train_opt.speed": { zh: "速度训练", en: "Speed Drills" },
  "train_opt.speed_desc": { zh: "爆发力与移动速度", en: "Explosiveness & lateral quickness" },
  "train_opt.shooting": { zh: "投篮特训", en: "Shooting Workouts" },
  "train_opt.shooting_desc": { zh: "出手弧度与命中率", en: "Form & shot percentages" },
  "train_opt.passing": { zh: "传球训练", en: "Passing Drills" },
  "train_opt.passing_desc": { zh: "视野与传球精准", en: "Court vision & precision" },
  "train_opt.defense": { zh: "防守训练", en: "Defensive Reps" },
  "train_opt.defense_desc": { zh: "步伐、预判与对抗", en: "Footwork, anticipation, contesting" },
  "train_opt.strength": { zh: "体能训练", en: "Strength & Conditioning" },
  "train_opt.strength_desc": { zh: "力量、耐力与对抗", en: "Power, stamina, physicality" },
  "train_opt.iq": { zh: "战术学习", en: "Film Study" },
  "train_opt.iq_desc": { zh: "录像研究与战术理解", en: "Tape work & strategic IQ" },

  // Relations view
  "rel.title": { zh: "管理层关系", en: "Front Office Relations" },
  "rel.teammates_title": { zh: "队友关系", en: "Teammate Rapport" },
  "rel.detail": { zh: "详情", en: "Details" },
  "rel.very_bad": { zh: "⚠ 关系极差，可能被交易", en: "⚠ Critical — trade possible" },
  "rel.loading": { zh: "加载中...", en: "Loading..." },
  "rel.refresh_story": { zh: "刷新故事", en: "New Story" },
  "rel.no_story": { zh: "点击「刷新」获取故事", en: "Hit refresh for a story" },
  "rel.quality_good": { zh: "融洽", en: "Strong" },
  "rel.quality_neutral": { zh: "一般", en: "Neutral" },
  "rel.quality_bad": { zh: "紧张", en: "Strained" },
  "rel.rapport_close": { zh: "兄弟", en: "Close" },
  "rel.rapport_neutral": { zh: "普通", en: "Neutral" },
  "rel.rapport_bad": { zh: "不和", en: "Frosty" },
  "rel.trade_title": { zh: "申请交易", en: "Request Trade" },
  "rel.trade_note": { zh: "主动申请（GM -10，老板 -8）", en: "Request a trade (GM -10, Owner -8)" },
  "rel.trade_processing": { zh: "处理中...", en: "Processing..." },
  "rel.trade_button": { zh: "📤 申请交易", en: "📤 Request Trade" },

  // Person types
  "person.coach": { zh: "主教练", en: "Head Coach" },
  "person.gm": { zh: "总经理", en: "General Manager" },
  "person.owner": { zh: "老板", en: "Owner" },
  "person.star": { zh: "球队核心", en: "Team Star" },
  "person.teammate": { zh: "更衣室", en: "Locker Room" },

  // Teammate roles
  "role.start_pg": { zh: "首发控卫", en: "Starting PG" },
  "role.start_sg": { zh: "首发得分后卫", en: "Starting SG" },
  "role.start_sf": { zh: "首发小前锋", en: "Starting SF" },
  "role.start_pf": { zh: "首发大前锋", en: "Starting PF" },
  "role.start_c":  { zh: "首发中锋", en: "Starting C" },
  "role.sixth":    { zh: "第六人", en: "Sixth Man" },
  "role.rot_score":{ zh: "轮换得分手", en: "Rotation Scorer" },
  "role.def_spec": { zh: "防守专家", en: "Defensive Specialist" },
  "role.bench_pg": { zh: "组织替补", en: "Backup PG" },
  "role.energy":   { zh: "体能轮换", en: "Energy Rotation" },

  // Agent / contract
  "agent.contract_now": { zh: "当前合同", en: "Current Contract" },
  "agent.years_left": { zh: "剩余 {n} 年", en: "{n} year(s) left" },
  "agent.contract_rookie": { zh: "新秀合同", en: "Rookie Contract" },
  "agent.contract_standard": { zh: "标准合同", en: "Standard Contract" },
  "agent.year_n_of_m": { zh: "第{y}/{m}年", en: "Year {y} of {m}" },
  "agent.start_extension": { zh: "💼 开始续约谈判", en: "💼 Start Extension Talks" },
  "agent.brand_collab": { zh: "品牌合作", en: "Brand Deals" },
  "agent.no_brand": { zh: "还没有品牌合作", en: "No brand deals yet" },
  "agent.brand_hint": { zh: "打出成绩，经纪人自然会带来好消息", en: "Perform well — your agent will bring offers" },
  "agent.annual_income": { zh: "年度总收入", en: "Annual Income" },
  "agent.contract_endorsement_breakdown": { zh: "合同 ${c}M + 代言 ${b}M", en: "Salary ${c}M + Endorsements ${b}M" },
  "agent.per_year_M": { zh: "$/年", en: "/yr" },

  // Negotiation modal
  "neg.free_agent_tag": { zh: "🏀 自由球员", en: "🏀 Free Agent" },
  "neg.contract_negotiation": { zh: "合同谈判", en: "Negotiation" },
  "neg.fa_intro": { zh: "你的合同已到期，成为自由球员。选择一份合同开始新赛季。", en: "Your contract has ended. Pick an offer to start next season." },
  "neg.selected_offer": { zh: "当前选中的报价", en: "Current Offer" },
  "neg.total_value_M": { zh: "总值 ${total}M", en: "Total ${total}M" },
  "neg.adjust_salary": { zh: "手动调整薪水", en: "Tweak Salary" },
  "neg.cap_note": { zh: "顶薪上限 ${max}M · 联盟薪资帽 ${cap}M", en: "Max contract ${max}M · League cap ${cap}M" },
  "neg.accept": { zh: "✓ 接受", en: "✓ Accept" },
  "neg.raise": { zh: "📈 要价", en: "📈 Counter Higher" },
  "neg.league_offers": { zh: "全联盟报价 ({n}支球队)", en: "League-Wide Offers ({n} teams)" },
  "neg.years_contract": { zh: "{y}年合同 {extra}", en: "{y}-year deal {extra}" },
  "neg.home_team": { zh: "· 原球队", en: "· current team" },
  "neg.later": { zh: "稍后决定（成为自由球员）", en: "Decide later (stay FA)" },
  "neg.over_max": { zh: "超过顶薪上限 ${max}M，球队无法接受。", en: "Above max-contract ${max}M — team can't accept." },

  // Finances
  "fin.personal_wealth": { zh: "个人财产", en: "Personal Wealth" },
  "fin.savings_note": { zh: "储蓄 · 税后收入每赛季自动入账", en: "Savings · after-tax salary auto-deposits each season" },
  "fin.renting": { zh: "🏠 租房中：{name} · ${cost}M/年 · 剩余 {n} 个月", en: "🏠 Renting: {name} · ${cost}M/yr · {n} months left" },
  "fin.owned_house": { zh: "🏡 已购房：{name}（{city}）", en: "🏡 Owns: {name} ({city})" },
  "fin.housing": { zh: "住房", en: "Housing" },
  "fin.current_city": { zh: "当前城市：{city}", en: "Current city: {city}" },
  "fin.rent_options": { zh: "租房选项（每年扣除）", en: "Rentals (deducted yearly)" },
  "fin.rent_per_year": { zh: "{desc} · ${cost}M/年", en: "{desc} · ${cost}M/yr" },
  "fin.rent": { zh: "租房 (预付1年)", en: "Rent (prepay 1yr)" },
  "fin.unrent": { zh: "退租", en: "End Lease" },
  "fin.cant_afford_year": { zh: "资金不足，需要 ${n}M 才能预付一年租金", en: "Insufficient funds — need ${n}M for a year up front" },
  "fin.buy_in_city": { zh: "购房（{city}）", en: "Buy (in {city})" },
  "fin.buy": { zh: "购买", en: "Buy" },
  "fin.cant_afford": { zh: "资金不足", en: "Can't afford" },
  "fin.sell": { zh: "卖出", en: "Sell" },
  "fin.car_label": { zh: "车辆", en: "Vehicles" },
  "fin.owned_cars": { zh: "已拥有", en: "Owned" },

  // Personal-asset names
  "house.apartment": { zh: "公寓", en: "Apartment" },
  "house.apartment_desc": { zh: "市中心一居室", en: "Downtown 1-bedroom" },
  "house.condo": { zh: "豪华公寓", en: "Luxury Condo" },
  "house.condo_desc": { zh: "顶层复式", en: "Penthouse duplex" },
  "house.house": { zh: "独栋别墅", en: "Detached House" },
  "house.house_desc": { zh: "郊区四居室", en: "Suburban 4-bedroom" },
  "house.mansion": { zh: "豪宅", en: "Mansion" },
  "house.mansion_desc": { zh: "私人游泳池", en: "Private pool" },

  "rental.studio": { zh: "单间公寓", en: "Studio" },
  "rental.studio_desc": { zh: "简单够用", en: "Just the basics" },
  "rental.apt": { zh: "两居室公寓", en: "2-Bedroom Apt" },
  "rental.apt_desc": { zh: "舒适居住", en: "Comfortable living" },
  "rental.luxury_apt": { zh: "豪华公寓", en: "Luxury Apt" },
  "rental.luxury_apt_desc": { zh: "市中心景观", en: "Downtown view" },

  "car.economy": { zh: "丰田凯美瑞", en: "Toyota Camry" },
  "car.economy_desc": { zh: "省油耐用", en: "Reliable & efficient" },
  "car.luxury": { zh: "奔驰S级", en: "Mercedes S-Class" },
  "car.luxury_desc": { zh: "豪华座驾", en: "Executive luxury" },
  "car.super": { zh: "兰博基尼 Urus", en: "Lamborghini Urus" },
  "car.super_desc": { zh: "超跑SUV", en: "Performance SUV" },
  "car.hyper": { zh: "迈凯伦 720S", en: "McLaren 720S" },
  "car.hyper_desc": { zh: "纯种赛车", en: "Track thoroughbred" },

  // Awards modal
  "awards.title": { zh: "年度颁奖典礼", en: "Annual Awards Ceremony" },
  "awards.season_n": { zh: "第{n}赛季荣誉", en: "Season {n} Honors" },
  "awards.mvp": { zh: "常规赛MVP", en: "Regular Season MVP" },
  "awards.dpoy": { zh: "最佳防守球员 (DPOY)", en: "Defensive Player of the Year" },
  "awards.champion": { zh: "总冠军球队", en: "NBA Champion" },
  "awards.fmvp": { zh: "总决赛MVP", en: "Finals MVP" },
  "awards.best_coach": { zh: "最佳教练", en: "Coach of the Year" },
  "awards.all_nba_1": { zh: "年度最佳阵容一队", en: "All-NBA First Team" },
  "awards.all_nba_2": { zh: "年度最佳阵容二队", en: "All-NBA Second Team" },
  "awards.all_nba_3": { zh: "年度最佳阵容三队", en: "All-NBA Third Team" },
  "awards.all_def_1": { zh: "最佳防守阵容一队", en: "All-Defensive First Team" },
  "awards.all_def_2": { zh: "最佳防守阵容二队", en: "All-Defensive Second Team" },
  "awards.all_rookie_1": { zh: "最佳新秀阵容一队", en: "All-Rookie First Team" },
  "awards.all_rookie_2": { zh: "最佳新秀阵容二队", en: "All-Rookie Second Team" },
  "awards.close": { zh: "关闭颁奖典礼", en: "Close Ceremony" },

  // Retire screen
  "retire.confirm_title": { zh: "宣布退役？", en: "Announce Retirement?" },
  "retire.confirm_subtitle": { zh: "{name} · {age} 岁 · 共 {n} 个赛季", en: "{name} · {age} years old · {n} seasons" },
  "retire.career_ovr": { zh: "生涯 OVR: {ovr}", en: "Career OVR: {ovr}" },
  "retire.champ_note": { zh: "✨ 至少 1 次总冠军", en: "✨ At least 1 championship" },
  "retire.warn_backup": { zh: "退役后将无法继续这个存档。建议先 ⬇备份。", en: "After retirement this save can't continue. Back up first ⬇." },
  "retire.confirm": { zh: "确认退役", en: "Confirm Retirement" },
  "retire.reconsider": { zh: "再想想", en: "Reconsider" },
  "retire.complete": { zh: "CAREER COMPLETE", en: "CAREER COMPLETE" },
  "retire.summary": { zh: "生涯总览", en: "Career Summary" },
  "retire.seasons": { zh: "赛季数", en: "Seasons" },
  "retire.retire_ovr": { zh: "退役 OVR", en: "Final OVR" },
  "retire.championships": { zh: "总冠军", en: "Championships" },
  "retire.at_least_one_champ": { zh: "🏆 至少 1 次", en: "🏆 At least 1" },
  "retire.return_to_lobby": { zh: "返回存档大厅", en: "Return to Save Lobby" },

  // Rest modal
  "rest.title": { zh: "😴 申请休战", en: "😴 Request Rest" },
  "rest.body": { zh: "休战期间球队会用其他球员上场，比赛胜率略降但你的状态得到保护。", en: "During rest your team plays without you. Win rate drops slightly but your condition is preserved." },
  "rest.input_label": { zh: "休战场数", en: "Number of games to rest" },
  "rest.confirm_n": { zh: "确认休战 {n} 场", en: "Confirm {n} games rest" },

  // Misc UI
  "ui.loading": { zh: "加载中...", en: "Loading..." },
  "ui.error_title": { zh: "加载出错了", en: "Loading failed" },
  "ui.error_hint": { zh: "请截图这个错误发给开发者", en: "Please screenshot this error for the dev" },
  "ui.lang_switch": { zh: "中", en: "EN" },

  // Player roster — quick injury alert
  "trade.headline_player": { zh: "✓ 交易成功！你被交易到了 {team}。\n\n{story}", en: "✓ Trade complete! You've been traded to {team}.\n\n{story}" },
  "trade.rejected": { zh: "✗ 交易申请被拒绝。\n\n{story}", en: "✗ Your trade request was denied.\n\n{story}" },
  "trade.leaked": { zh: "✗ 交易申请泄露，更衣室震荡。\n\n{story}", en: "✗ The request leaked — locker-room fallout.\n\n{story}" },
  "trade.passive_headline": { zh: "📰 重磅交易！你被 {from} 送到了 {to}。{reasons}", en: "📰 BREAKING: You've been traded by {from} to {to}. {reasons}" },
  "trade.reason_bad_rel": { zh: "管理层关系恶化已久。", en: "Front office relations had soured." },
  "trade.reason_injury": { zh: "球队不愿承担你的伤病恢复成本。", en: "The team didn't want to absorb your injury recovery." },
  "trade.injurylog_trade_to": { zh: "交易至 {abbr}", en: "Traded to {abbr}" },
  "trade.injurylog_passive": { zh: "被交易至 {abbr}", en: "Traded by team to {abbr}" },

  // Storage quota
  "save.quota_warn": { zh: "⚠️ 存档空间不足！\n\n用右下角的 ⬇备份 按钮导出现有存档到本地文件，\n然后删掉几个旧存档释放空间，再继续游戏。", en: "⚠️ Out of save space!\n\nUse the ⬇ Backup button (bottom-right) to export your saves to a file,\nthen delete a few old ones to free up space." },

  // Brand offer types
  "brand_type.shoes": { zh: "球鞋", en: "Sneakers" },
  "brand_type.drink": { zh: "饮料", en: "Beverage" },
  "brand_type.fastfood": { zh: "快餐", en: "Fast Food" },
  "brand_type.insurance": { zh: "保险", en: "Insurance" },
  "brand_type.game": { zh: "游戏", en: "Game" },
  "brand_type.tech": { zh: "科技", en: "Tech" },

  // Brands (Nike etc keep English names; only 苹果 → Apple)
  "brand.nike": { zh: "Nike", en: "Nike" },
  "brand.adidas": { zh: "Adidas", en: "Adidas" },
  "brand.gatorade": { zh: "Gatorade", en: "Gatorade" },
  "brand.mcdonalds": { zh: "McDonald's", en: "McDonald's" },
  "brand.statefarm": { zh: "State Farm", en: "State Farm" },
  "brand.nba2k": { zh: "NBA 2K", en: "NBA 2K" },
  "brand.apple": { zh: "苹果", en: "Apple" },

  // Preset archetypes
  "arch.pg_lightning": { zh: "闪电控卫", en: "Lightning Guard" },
  "arch.pg_floor_general": { zh: "组织大师", en: "Floor General" },
  "arch.pg_scoring": { zh: "得分型控卫", en: "Scoring Point Guard" },
  "arch.sg_sharpshooter": { zh: "纯射手", en: "Sharpshooter" },
  "arch.sg_scoring_machine": { zh: "得分机器", en: "Scoring Machine" },
  "arch.sg_two_way": { zh: "双向护卫", en: "Two-Way Guard" },
  "arch.sf_versatile": { zh: "锋线全能", en: "Versatile Wing" },
  "arch.sf_3d": { zh: "3D小前", en: "3-and-D Wing" },
  "arch.sf_slasher": { zh: "持球突破手", en: "Slashing Creator" },
  "arch.pf_stretch": { zh: "拉开空间大前", en: "Stretch Four" },
  "arch.pf_inside_out": { zh: "内外线兼备", en: "Inside-Out Big" },
  "arch.pf_bluecollar": { zh: "硬汉蓝领", en: "Blue-Collar Big" },
  "arch.c_paint_dominator": { zh: "统治禁区", en: "Paint Dominator" },
  "arch.c_modern": { zh: "现代中锋", en: "Modern Center" },
  "arch.c_def_anchor": { zh: "防守专家", en: "Defensive Anchor" },

  // Injury types
  "inj.ankle": { zh: "踝关节扭伤", en: "Sprained Ankle" },
  "inj.knee": { zh: "膝盖韧带拉伤", en: "Knee Ligament Strain" },
  "inj.muscle": { zh: "肌肉拉伤", en: "Muscle Strain" },
  "inj.finger": { zh: "手指骨折", en: "Fractured Finger" },
  "inj.back": { zh: "背部痉挛", en: "Back Spasm" },
  "inj.achilles": { zh: "跟腱撕裂", en: "Torn Achilles" },

  // Traits — static
  "trait.bouncy": { zh: "弹跳精英", en: "Elite Leaper" },
  "trait.longarms": { zh: "长臂怪物", en: "Freaky Wingspan" },
  "trait.lowcenter": { zh: "低重心", en: "Low Center of Gravity" },
  "trait.broadshoulders": { zh: "宽肩膀", en: "Broad Shoulders" },
  "trait.bighands": { zh: "大手掌", en: "Massive Hands" },
  "trait.superwing": { zh: "超长臂展", en: "Super Wingspan" },
  "trait.explosive": { zh: "爆发型体格", en: "Explosive Frame" },
  "trait.quickfeet": { zh: "灵活脚步", en: "Quick Feet" },
  // Traits — dynamic
  "trait.stepback": { zh: "后撤步大师", en: "Stepback Master" },
  "trait.pnr": { zh: "挡拆高手", en: "Pick-and-Roll Maestro" },
  "trait.steal": { zh: "抢断嗅觉", en: "Steal Instinct" },
  "trait.pullup": { zh: "急停跳投", en: "Pull-Up Specialist" },
  "trait.offball": { zh: "无球跑位", en: "Off-Ball Movement" },
  "trait.eurostep": { zh: "欧步专家", en: "Euro-Step Wizard" },
  "trait.shotblock": { zh: "封盖时机", en: "Shot-Block Timing" },
  "trait.threehot": { zh: "三分手感", en: "Three-Point Touch" },

  // Status feedback
  "neg.accepted_default": { zh: "球队管理层经过短暂讨论后点头同意。", en: "The front office nods after brief deliberation." },
  "neg.rejected_default": { zh: "球队管理层摇头：「这超出了我们的预算」。", en: "The front office shakes their head: \"That's beyond our budget.\"" },

  // Brand acceptance phrases used in offer pop
  "ui.no_more_brand": { zh: "已签 5 个品牌", en: "5 brand cap reached" },

  // Trade UX
  "trade.ok_emoji": { zh: "📤 申请已提交，等待回应。", en: "📤 Request submitted, awaiting response." },

  // Career complete card extras
  "retire.position_age": { zh: "{city} {team} · {pos} · {age} 岁", en: "{city} {team} · {pos} · Age {age}" },
};

// ── English name pool (parallel to NAME_FIRST × NAME_LAST in Chinese) ────────
export const NAME_FIRST_EN = ["LeBron","Kevin","Stephen","James","Cameron","Chris","Derrick","Anthony","Paul","Luka","Jamal","Marcus","Trae","Giannis","Nikola","Joel","Damian","Jason","Damien","Darren","Brandon","Sean","Cedric","Terry","John","Miles","Jarrett","Tristan","Blake","Zach","Klay","Javale","Allen","DeAndre","Oscar","Vincent","Nate","Reggie","Oliver","Kenny","Tanner","Shane","Tyson","Jude","Alvin","Brad","Trevor","Iman","Tyler","Brian"];
export const NAME_LAST_EN = ["James","Durant","Curry","Harden","Leonard","Paul","Rose","Davis","Iverson","Duncan","Nowitzki","Nash","McGrady","Pierce","Gasol","Anthony","Howard","Boozer","Roy","Aldridge","Johnson","Smith","Brown","Williams","Miller","Moore","Martin","Thompson","Anderson","Thomas","Jackson","Robinson","Clark","Lewis","Walker","Hall","Allen","Young","Carter","Cole","Foster","Mitchell","Adams","Hayward","Irving","Adebayo","Nelson","Malkin","O'Sullivan","Baker"];

// ── English commentary pools (parallel to COMMENTARY) ────────────────────────
export const COMMENTARY_EN: any = {
  draft: [
    "The lights swing to the podium — from this moment on, that name belongs to the NBA!",
    "Thunderous applause fills the hall — the rookie's wait is over, the career officially begins!",
    "Years of sweat and sacrifice, all of it crystallizing in this single announcement!",
    "The draft hall erupts — the rookie walks the stage with the brightest of futures ahead!",
    "Every basketball kid's dream — being picked by an NBA team — and time seems to stop for him.",
    "Cameras catch the family in tears — every sacrifice, every late night, every bus ride, all worth it.",
    "The agent gives a tight hug, and in that moment he knows he's truly made it.",
    "The announcer's voice rolls through the building: \"This is the moment a future star is born!\"",
    "He breathes deep, slides on the cap, and his fate is tied to this franchise from here on out.",
    "Scouts have been raving for years — tonight, finally, payday.",
    "His hometown flags wave in the stands — pride radiating outward.",
    "Fans glued to screens hold their breath — this draft slot might mean the franchise's future.",
    "He clenches his fist and nods to his family. A decade of grinding pays off tonight.",
    "Press swarm in, camera flashes washing the room white.",
    "He walks through the cheering crowd to the stage — steady steps, eyes bright.",
  ],
  winGeneric: [
    "{pts} pts, {ast} ast, {reb} reb — a complete night and the W to show for it. He was the brightest light on the floor.",
    "Stepped up when it mattered — {pts} points reset the room, this win came right on time.",
    "Every drive and dish landed perfectly. {pts} & {ast} — flawless.",
    "The roar peaked on every shot of his — {pts} to seal it. Beautiful.",
    "Both ends were dialed in — {pts} pts says the work showed up. Team morale: through the roof.",
    "First half was a struggle, second half he detonated — {pts} flipped the script. Star DNA.",
    "Opponent's scheme was useless — {pts} means he found the zone.",
    "He stood up in the fourth — that last bucket in the {pts} was the dagger.",
    "Pace was his — {pts} & {ast} looked effortless out there.",
    "Full house chanting his name. {pts} pts and {reb} boards — that's domination.",
    "Tonight his footwork did the talking — {pts} plus a stack of and-ones.",
    "Pure franchise-cornerstone vibes — {pts} pts, {ast} ast, {reb} reb.",
    "Teammates mobbed him on the floor — {pts} was the right ending to that effort.",
    "Defense made stops, offense did {pts} — opposition demoralized.",
    "The louder the road boos got, the more he scored. {pts} — message received.",
    "Coach threw up the thumb on the sideline. {pts} pulled the whole bench into the fire.",
    "Other side's post-game just shook their head: \"He was unguardable.\" {pts} agrees.",
    "Felt like a one-man show — {pts} & {ast}, textbook superstar performance.",
  ],
  lossGeneric: [
    "{pts} & {reb} on the night — the individual line was fine but the team got out-executed. Time to review tape.",
    "Tough night with the bounces — a few key looks rimmed out. {pts} couldn't drag the W home.",
    "Losses sting — {pts} was visible effort, but the chemistry isn't there yet.",
    "Found stingy resistance tonight — {pts} came under heavy contest. Adjust next time.",
    "A whisker away — {pts} & {ast} couldn't seal it, but the fight was there.",
    "The other side was just hot — {pts} of grit lost to their cooler heads.",
    "Pressed too hard in the fourth, rushed shots opened the lead — finished at {pts}.",
    "Bench production was zero, starters had to drag it — {pts} alone wasn't enough.",
    "Couple of officials' calls flipped the rhythm — {pts} has some bitterness in it.",
    "Hostile road crowd ate them up — {pts} was a dogged effort even so.",
    "Got {pts} but never found the touch tonight.",
    "Turnovers killed possession after possession — {pts} couldn't make up for it.",
    "Coach kept it brief postgame: \"We let this one slip.\" {pts} carries that regret.",
    "Their star went nuclear — {pts} couldn't match the firepower, took the L.",
    "Got buried by second-half momentum — {pts} couldn't hold the line.",
  ],
  winShooter: [
    "Hot hand. {pts} all coming from snipe range — chained threes turned this into a track meet.",
    "\"Tonight the touch was there\" — that's all he said. The shooting clinic produced {pts}.",
    "Three-pointers fell like rain — at least half of those {pts} came catch-and-shoot.",
    "Even with double teams, {pts} — that's a top-tier sniper showcase.",
    "Corner, wing, way deep — {pts} from every spot. Two timeouts couldn't slow him.",
    "5 threes inside his {pts} — rhythm was untouchable.",
    "Switching defenders did nothing — {pts} kept dropping.",
  ],
  lossShooter: [
    "Touch wasn't there — {pts} came hard, still team-high, recalibrate next time.",
    "Threes weren't falling — most of {pts} came on drives, but efficiency dipped.",
    "Opposition stuck a long defender on him — {pts} came on heavy volume, low %.",
    "A shooter's cold stretch — {pts} surfaces around several missed clutch threes.",
  ],
  winPG: [
    "{ast} dimes orchestrated the whole offense — {pts} was almost a side dish. Tonight he was the conductor.",
    "His read of the floor was unreal — {ast} & {pts}, every pass three steps ahead.",
    "Off-ball, on-ball, pin-down screens — he ran the orchestra. {ast} dimes.",
    "{ast} made teammate buckets easy — added {pts} on his own. Picture-perfect PG night.",
    "Primary defender was toyed with — half of those {ast} were wide-open layups.",
    "Symphony-conductor mode unlocked — {pts} & {ast}, team in pure flow.",
    "Several passes inside the {ast} were straight imagination — the crowd gasped.",
  ],
  lossPG: [
    "Playmaking sputtered tonight — but {ast} & {pts} still respectable. Series isn't over.",
    "They locked onto the ball-handler — {ast} was discounted, {pts} couldn't save the team.",
    "Pace was disrupted, several of the {ast} turned into transition leak-outs going the other way.",
    "Execution was off — {pts} & {ast} couldn't convert to a W. Tape session inbound.",
  ],
  winDefender: [
    "Defensive impact tonight was suffocating — add {pts} on the other end and it's a two-way clinic.",
    "His pressure turned their main option ice-cold — {pts} is the cherry on top of a two-way masterpiece.",
    "Opposing star was locked up, his {pts} came in the flow — that's why two-way matters.",
    "Lock-down, jump steal, help — he was octopus-everywhere. {pts} a nice bonus.",
    "His charges and contests flipped pivotal possessions — {pts} only tells half the story.",
  ],
  lossDefender: [
    "Lost the game, but defensive effort was undeniable. Need more help on offense next time.",
    "He shut down their star but teammates couldn't keep up — {pts} alone wasn't enough.",
    "Grind on D was relentless, just couldn't crack {pts} past their wall.",
  ],
  poffWin: [
    "Playoff stage lights him up — {pts} & {ast} of domination, opposing comeback hopes shut down.",
    "Heart of a closer! He stepped up time and time again — {pts} & {reb}, into the next round!",
    "Series momentum is ours — {pts} left the other coaching staff staring at the floor. Unguardable.",
    "The louder the road boos, the harder he hit — {pts} delivered the only punctuation: DAGGER.",
    "Owned the fourth quarter — {pts} carried the swing of the series.",
    "{pts} on the Game-7 stage — \"clutch\" label is permanent now.",
    "Their coach's timeout face was grim — {pts} from every angle was scoring chemistry.",
    "Playoff-upgrade version of him is online — {pts} & {ast} is +30% on regular-season form.",
    "Teammate in the postgame: \"We all know who gets the ball when it matters.\" {pts} agrees.",
    "Crowd on its feet — the closing bucket of those {pts} felt like the arena went supernova.",
    "Full minutes on D too — {pts} plus stack of contested kick-outs and a chase-down block.",
    "Media is already chattering about FMVP — {pts} & {ast} is the ticket.",
  ],
  poffLoss: [
    "The playoffs are brutal — {pts} & {ast} pushed through, but the team underwhelmed. Series isn't over.",
    "That one hurts. His {pts} was team-high, but it can't be one-man-army — find another gear.",
    "Playoffs don't care about tears — {pts} wasn't enough, locker room silent, regroup.",
    "Their star went off — {pts} couldn't stop the bleeding.",
    "Late turnovers blew the lead open — {pts} sits with all that frustration.",
    "Road environment swallowed them — {pts} was a lonely warrior's effort.",
    "Mind cracked in the fourth — {pts} contains too many desperate looks.",
    "Their defensive game plan was tuned to him — {pts} came under heavy duress.",
    "Coach said only: \"We weren't ready.\" {pts} still aches.",
  ],
  relGood: [
    "The locker-room vibe is warm — folks linger after practice for extra shots together. That chemistry is the team's spine.",
    "It's built on mutual respect — strategy meetings are honest, frank exchanges. That's rare across this league.",
    "After late workouts the two of them have lingered outside the arena talking — that mutual admiration is real.",
    "On press day they exchange a quick smile — that ease isn't an act.",
    "They golf together off-court — the relationship has gone past business.",
    "When the road gets bumpy they stand together — that's the kind of support you can't fake.",
    "They're frequently the last two to leave the practice gym.",
    "He's publicly thanked them in interviews more than once — rare currency in the NBA.",
  ],
  relBad: [
    "Locker-room mood has been heavy lately — the rift blew open after a loss; they barely speak privately now.",
    "Management isn't pleased with the form — there are whispers they've quietly been talking to other teams. Trade winds are picking up.",
    "Surface is professional — beneath it the disagreements never went away.",
    "Multiple thrown-clipboard arguments in the locker room have made everyone uncomfortable.",
    "Public-facing they're polite — privately they don't talk; the air is glacial.",
    "Telling looks were caught on camera. The fracture chatter is growing.",
    "Practice has them shooting at separate hoops now — neither initiates.",
    "Agent has been meeting other front offices — no one in the building is fooled.",
  ],
  relNeutral: [
    "Professional, courteous, with that healthy NBA distance and trust.",
    "Both pros — get the job done is the highest form of respect.",
    "Public events go fine — private chatter is sparse, but no friction either.",
    "Classic NBA-coworker dynamic — not close, not distant.",
  ],
  trade: [
    "Word ripples through the locker room — he's filed the trade request. The front office is stone-faced; teammates' minds wander. This season won't be quiet.",
    "Agent confirms it: the request is formally on file. The other end of the line went quiet a long while before muttering, \"We'll consider it carefully.\"",
    "The decision shook the whole team — media swarmed in, speculation flooded everywhere — and he just showed up at practice as usual.",
    "He told the locker room before tipoff — teammates' expressions were a confusing mix.",
    "Front office held an emergency meeting overnight — no one knows what's next for him.",
    "ESPN's lead headline is already up: \"Star Demands Trade — What's the Next Stop?\"",
    "He mentioned it at a memoir signing — reporters jumped out of their seats.",
    "Fan petitions to keep him have stacked up — but the call belongs to him and the front office.",
  ],
  injuredPrefix: [
    "Played through the pain — admirable! ",
    "Knee was clearly off but he refused to leave, ",
    "Strapped up and laid out for big minutes, ",
    "Trainers said no but he said yes, ",
    "Pushed through discomfort to finish the game, ",
  ],
};

// ── Negotiation accept/reject lines, English version ─────────────────────────
export const NEGOTIATE_ACCEPT_EN = [
  "The front office discusses briefly, then nods.",
  "GM grins: \"Done — we can't wait to see you in our colors.\"",
  "The owner phones personally to welcome you.",
  "Agent confirms — terms agreed.",
];
export const NEGOTIATE_REJECT_EN = [
  "The front office shakes their head: \"That's above our budget.\"",
  "GM passes immediately: \"We don't have that kind of cap room.\"",
  "The owner answers coldly: \"That number isn't possible.\"",
  "Their advisors furrow their brows: \"We'll need to step back.\"",
  "Their negotiator pauses a long while: \"Please reconsider our original offer.\"",
  "GM walks: \"We'll explore other options.\"",
];

// ── Team data (parallel zh/en) ───────────────────────────────────────────────
// We keep the original ALL_TEAMS as the source of truth and provide a parallel
// lookup table keyed by abbr → { city: {zh,en}, name: {zh,en} }.
export const TEAM_LOCAL: Record<string, { city: Entry; name: Entry }> = {
  DEN: { city: { zh: "丹佛", en: "Denver" }, name: { zh: "掘金", en: "Nuggets" } },
  GSW: { city: { zh: "金州", en: "Golden State" }, name: { zh: "勇士", en: "Warriors" } },
  DAL: { city: { zh: "达拉斯", en: "Dallas" }, name: { zh: "独行侠", en: "Mavericks" } },
  MIN: { city: { zh: "明尼苏达", en: "Minnesota" }, name: { zh: "森林狼", en: "Timberwolves" } },
  LAL: { city: { zh: "洛杉矶", en: "Los Angeles" }, name: { zh: "湖人", en: "Lakers" } },
  HOU: { city: { zh: "休斯顿", en: "Houston" }, name: { zh: "火箭", en: "Rockets" } },
  OKC: { city: { zh: "俄克拉荷马", en: "Oklahoma City" }, name: { zh: "雷霆", en: "Thunder" } },
  LAC: { city: { zh: "洛杉矶", en: "LA" }, name: { zh: "快船", en: "Clippers" } },
  SAS: { city: { zh: "圣安东尼奥", en: "San Antonio" }, name: { zh: "马刺", en: "Spurs" } },
  POR: { city: { zh: "波特兰", en: "Portland" }, name: { zh: "开拓者", en: "Trail Blazers" } },
  PHX: { city: { zh: "菲尼克斯", en: "Phoenix" }, name: { zh: "太阳", en: "Suns" } },
  MEM: { city: { zh: "孟菲斯", en: "Memphis" }, name: { zh: "灰熊", en: "Grizzlies" } },
  UTA: { city: { zh: "犹他", en: "Utah" }, name: { zh: "爵士", en: "Jazz" } },
  SAC: { city: { zh: "萨克拉门托", en: "Sacramento" }, name: { zh: "国王", en: "Kings" } },
  NOP: { city: { zh: "新奥尔良", en: "New Orleans" }, name: { zh: "鹈鹕", en: "Pelicans" } },
  BOS: { city: { zh: "波士顿", en: "Boston" }, name: { zh: "凯尔特人", en: "Celtics" } },
  MIL: { city: { zh: "密尔沃基", en: "Milwaukee" }, name: { zh: "雄鹿", en: "Bucks" } },
  MIA: { city: { zh: "迈阿密", en: "Miami" }, name: { zh: "热火", en: "Heat" } },
  PHI: { city: { zh: "费城", en: "Philadelphia" }, name: { zh: "76人", en: "76ers" } },
  CLE: { city: { zh: "克利夫兰", en: "Cleveland" }, name: { zh: "骑士", en: "Cavaliers" } },
  ATL: { city: { zh: "亚特兰大", en: "Atlanta" }, name: { zh: "老鹰", en: "Hawks" } },
  NYK: { city: { zh: "纽约", en: "New York" }, name: { zh: "尼克斯", en: "Knicks" } },
  IND: { city: { zh: "印第安纳", en: "Indiana" }, name: { zh: "步行者", en: "Pacers" } },
  ORL: { city: { zh: "奥兰多", en: "Orlando" }, name: { zh: "魔术", en: "Magic" } },
  BKN: { city: { zh: "布鲁克林", en: "Brooklyn" }, name: { zh: "篮网", en: "Nets" } },
  DET: { city: { zh: "底特律", en: "Detroit" }, name: { zh: "活塞", en: "Pistons" } },
  CHA: { city: { zh: "夏洛特", en: "Charlotte" }, name: { zh: "黄蜂", en: "Hornets" } },
  TOR: { city: { zh: "多伦多", en: "Toronto" }, name: { zh: "猛龙", en: "Raptors" } },
  CHI: { city: { zh: "芝加哥", en: "Chicago" }, name: { zh: "公牛", en: "Bulls" } },
  WAS: { city: { zh: "华盛顿", en: "Washington" }, name: { zh: "奇才", en: "Wizards" } },
};

// Convenience getters for team city/name based on current lang.
export function teamCity(abbr: string, lang: Lang): string {
  return TEAM_LOCAL[abbr]?.city[lang] ?? abbr;
}
export function teamName(abbr: string, lang: Lang): string {
  return TEAM_LOCAL[abbr]?.name[lang] ?? abbr;
}
export function teamFull(abbr: string, lang: Lang): string {
  const t = TEAM_LOCAL[abbr];
  if (!t) return abbr;
  return lang === "en" ? `${t.city.en} ${t.name.en}` : `${t.city.zh} ${t.name.zh}`;
}

// Best coaches list (zh/en parallel)
export const COACHES_BILINGUAL: Entry[] = [
  { zh: "史蒂夫·科尔", en: "Steve Kerr" },
  { zh: "泰隆·卢", en: "Tyronn Lue" },
  { zh: "迈克·布登霍尔泽", en: "Mike Budenholzer" },
  { zh: "埃里克·斯波斯特拉", en: "Erik Spoelstra" },
  { zh: "里克·卡莱尔", en: "Rick Carlisle" },
  { zh: "格雷格·波波维奇", en: "Gregg Popovich" },
  { zh: "扬尼斯·阿代托昆博", en: "Doc Rivers" },
  { zh: "蒙蒂·威廉斯", en: "Monty Williams" },
  { zh: "迈克·马龙", en: "Michael Malone" },
  { zh: "贾森·基德", en: "Jason Kidd" },
];

// Teammate first / last name pools (parallel)
export const TEAMMATE_FIRST_EN = ["Jamal","Derrick","Tyler","Marcus","Kyle","Jordan","Tanner","Miles","Oliver","Sean","Blake","Davonte","Reggie","Trey","Nate"];
export const TEAMMATE_LAST_EN  = ["Smith","Johnson","Williams","Brown","Davis","Martin","Thompson","Anderson","Thomas","Jackson"];

// ── Reverse map: zh value → translation key. Lets us avoid touching every
// place where Chinese data is referenced by string identity (e.g. PRESET_ARCHETYPES,
// INJURY_TYPES, TRAINING_OPTIONS — game logic uses zh strings as IDs).
export const ZH_TO_KEY: Record<string, string> = {
  // Positions
  "PG · 控卫": "pos.PG",
  "SG · 得分后卫": "pos.SG",
  "SF · 小前锋": "pos.SF",
  "PF · 大前锋": "pos.PF",
  "C · 中锋": "pos.C",
  // Archetypes
  "闪电控卫": "arch.pg_lightning",
  "组织大师": "arch.pg_floor_general",
  "得分型控卫": "arch.pg_scoring",
  "纯射手": "arch.sg_sharpshooter",
  "得分机器": "arch.sg_scoring_machine",
  "双向护卫": "arch.sg_two_way",
  "锋线全能": "arch.sf_versatile",
  "3D小前": "arch.sf_3d",
  "持球突破手": "arch.sf_slasher",
  "拉开空间大前": "arch.pf_stretch",
  "内外线兼备": "arch.pf_inside_out",
  "硬汉蓝领": "arch.pf_bluecollar",
  "统治禁区": "arch.c_paint_dominator",
  "现代中锋": "arch.c_modern",
  "防守专家": "arch.c_def_anchor",
  // Stats
  "速度": "stat.speed",
  "投篮": "stat.shooting",
  "传球": "stat.passing",
  "防守": "stat.defense",
  "体能": "stat.strength",
  "篮球IQ": "stat.iq",
  // Training labels
  "速度训练": "train_opt.speed",
  "投篮特训": "train_opt.shooting",
  "传球训练": "train_opt.passing",
  "防守训练": "train_opt.defense",
  "体能训练": "train_opt.strength",
  "战术学习": "train_opt.iq",
  "爆发力与移动速度": "train_opt.speed_desc",
  "出手弧度与命中率": "train_opt.shooting_desc",
  "视野与传球精准": "train_opt.passing_desc",
  "步伐、预判与对抗": "train_opt.defense_desc",
  "力量、耐力与对抗": "train_opt.strength_desc",
  "录像研究与战术理解": "train_opt.iq_desc",
  // Injuries
  "踝关节扭伤": "inj.ankle",
  "膝盖韧带拉伤": "inj.knee",
  "肌肉拉伤": "inj.muscle",
  "手指骨折": "inj.finger",
  "背部痉挛": "inj.back",
  "跟腱撕裂": "inj.achilles",
  // Severity
  "轻伤": "health.severity_minor",
  "中伤": "health.severity_medium",
  "重伤": "health.severity_serious",
  "赛季报销": "health.severity_season",
  // Person types
  "主教练": "person.coach",
  "总经理": "person.gm",
  "老板": "person.owner",
  "球队核心": "person.star",
  "更衣室": "person.teammate",
  // Roles
  "首发控卫": "role.start_pg",
  "首发得分后卫": "role.start_sg",
  "首发小前锋": "role.start_sf",
  "首发大前锋": "role.start_pf",
  "首发中锋": "role.start_c",
  "第六人": "role.sixth",
  "轮换得分手": "role.rot_score",
  "防守专家_role": "role.def_spec",   // disambiguate from arch.c_def_anchor
  "组织替补": "role.bench_pg",
  "体能轮换": "role.energy",
  // Traits
  "弹跳精英": "trait.bouncy",
  "长臂怪物": "trait.longarms",
  "低重心": "trait.lowcenter",
  "宽肩膀": "trait.broadshoulders",
  "大手掌": "trait.bighands",
  "超长臂展": "trait.superwing",
  "爆发型体格": "trait.explosive",
  "灵活脚步": "trait.quickfeet",
  "后撤步大师": "trait.stepback",
  "挡拆高手": "trait.pnr",
  "抢断嗅觉": "trait.steal",
  "急停跳投": "trait.pullup",
  "无球跑位": "trait.offball",
  "欧步专家": "trait.eurostep",
  "封盖时机": "trait.shotblock",
  "三分手感": "trait.threehot",
  // Brand types
  "球鞋": "brand_type.shoes",
  "饮料": "brand_type.drink",
  "快餐": "brand_type.fastfood",
  "保险": "brand_type.insurance",
  "游戏": "brand_type.game",
  "科技": "brand_type.tech",
  // Houses / rentals / cars
  "公寓": "house.apartment",
  "豪华公寓": "house.condo",
  "独栋别墅": "house.house",
  "豪宅": "house.mansion",
  "市中心一居室": "house.apartment_desc",
  "顶层复式": "house.condo_desc",
  "郊区四居室": "house.house_desc",
  "私人游泳池": "house.mansion_desc",
  "单间公寓": "rental.studio",
  "两居室公寓": "rental.apt",
  "豪华公寓_rent": "rental.luxury_apt",  // disambiguate from house.condo
  "简单够用": "rental.studio_desc",
  "舒适居住": "rental.apt_desc",
  "市中心景观": "rental.luxury_apt_desc",
  "丰田凯美瑞": "car.economy",
  "省油耐用": "car.economy_desc",
  "奔驰S级": "car.luxury",
  "豪华座驾": "car.luxury_desc",
  "兰博基尼 Urus": "car.super",
  "超跑SUV": "car.super_desc",
  "迈凯伦 720S": "car.hyper",
  "纯种赛车": "car.hyper_desc",
};

// Translate a zh value to current lang. Falls back to original if unknown.
export function tx(zhValue: string | undefined | null, lang: Lang): string {
  if (!zhValue) return "";
  if (lang === "zh") return zhValue;
  const key = ZH_TO_KEY[zhValue];
  return key ? t(key, lang) : zhValue;
}
