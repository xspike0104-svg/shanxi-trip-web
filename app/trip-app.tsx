"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TripItem = {
  id: number;
  day: number;
  time: string;
  title: string;
  detail: string;
  done: number;
  updatedAt: string;
  reviewUrl?: string;
};

type Expense = {
  id: number;
  description: string;
  amountCents: number;
  paidBy: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
};

type ChecklistItem = {
  id: number;
  label: string;
  checked: number;
  updatedAt: string;
};

type AuditEntry = {
  id: number;
  actor: string;
  action: string;
  summary: string;
  createdAt: string;
  undoable: boolean;
  undone: boolean;
};

type SharedState = {
  itinerary: TripItem[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  audit: AuditEntry[];
};

const MEMBERS = ["大王", "小曾", "大曾", "小陈"];
const DATES = ["8月8日", "8月9日", "8月10日", "8月11日", "8月12日"];
const CITIES = ["太原", "太原 → 大同", "大同", "大同 → 太原", "太原"];
const WEEKDAYS = ["周六", "周日", "周一", "周二", "周三"];
const DAY_ROUTES = [
  "太原机场 → 晋祠 → 钟楼街",
  "山西博物院 → 大同古城",
  "云冈石窟 → 大同古城深度游",
  "大同 → 悬空寺 → 浑源午餐 → 应县木塔 → 太原",
  "太原市内 → 特色午餐 → 机场",
];
const DAY_SCENES = ["晋祠", "山西博物院", "云冈石窟", "悬空寺", "双塔寺"];
const EMPTY_TIME = new Date(0).toISOString();

const FALLBACK: SharedState = {
  itinerary: [
    { id: 1, day: 1, time: "12:00", title: "抵达太原机场", detail: "机场取车，检查车况并拍照", done: 0, updatedAt: EMPTY_TIME },
    { id: 18, day: 1, time: "13:00", title: "卫家剔尖小馆（午餐）", detail: "取车后先吃午饭，再前往晋祠", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/l1y54Qx0N0nti9Aj" },
    { id: 19, day: 1, time: "13:00备", title: "龙聚祥（午餐备选）", detail: "卫家排队较久或路线临时调整时使用", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/k9leS84p5DO2618O" },
    { id: 2, day: 1, time: "14:30", title: "晋祠", detail: "建议游览至 17:30 左右", done: 0, updatedAt: EMPTY_TIME },
    { id: 3, day: 1, time: "19:00", title: "老太原菜馆（晚餐）", detail: "晋祠游览后返回市区，品尝经典晋菜", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/l45LUzCIO2sjR4rC" },
    { id: 20, day: 1, time: "19:00备", title: "利源沾片子（晚餐备选）", detail: "老太原菜馆排队较久时使用", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/G6ipBZ73IHlW7slp" },
    { id: 4, day: 2, time: "09:00", title: "山西博物院", detail: "提前预约，预留 3 小时", done: 0, updatedAt: EMPTY_TIME },
    { id: 5, day: 2, time: "13:30", title: "自驾前往大同", detail: "约 280km / 3.5～4 小时", done: 0, updatedAt: EMPTY_TIME },
    { id: 21, day: 2, time: "17:30", title: "三道菜·明堂公园店（晚餐主选）", detail: "进大同城南顺路先吃；饭后入住并夜游古城", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/G5LH68mS2bcQh3JN" },
    { id: 22, day: 2, time: "17:30备", title: "花园大饭店（晚餐备选）", detail: "若先进入古城，可改在永泰街、鼓楼附近用餐", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/EZgfZLvc4J1aqt1K" },
    { id: 23, day: 2, time: "17:30备", title: "田园北魏家宴·御东店（晚餐备选）", detail: "适合走御东一侧或酒店在城东时选择", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/l28atK9sjAQTYE2F" },
    { id: 6, day: 2, time: "18:00", title: "大同古城夜游", detail: "华严广场与城墙夜景", done: 0, updatedAt: EMPTY_TIME },
    { id: 15, day: 3, time: "07:00", title: "喜晋道刀削面（早餐）", detail: "7:00 营业；吃完前往云冈石窟", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/G8YwWWTb0pJHeRVc" },
    { id: 7, day: 3, time: "08:00", title: "云冈石窟", detail: "重点参观昙曜五窟", done: 0, updatedAt: EMPTY_TIME },
    { id: 24, day: 3, time: "12:30", title: "红旗瑞丰楼·北魏家宴（午餐主选）", detail: "返城后在清远街用餐；饭后从附近华严寺开始古城游", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/jR1yAJB7FNYJ95pE" },
    { id: 25, day: 3, time: "12:30备", title: "凯鸽·云冈石窟店（午餐备选）", detail: "云冈游览结束就近用餐，时间紧时最省路", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/l20iC9dhpy1Kkn9C" },
    { id: 26, day: 3, time: "12:30备", title: "紫泥369·四牌楼店（午餐备选）", detail: "回到古城后用餐；热门时段建议先取号", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/77277092" },
    { id: 8, day: 3, time: "14:00", title: "大同古城深度游", detail: "华严寺、善化寺、九龙壁", done: 0, updatedAt: EMPTY_TIME },
    { id: 27, day: 3, time: "18:30", title: "弘雅饭店（晚餐主选）", detail: "古城深度游结束后用餐，优先提前确认桌位", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/2120494" },
    { id: 28, day: 3, time: "18:30备", title: "花园大饭店（晚餐备选）", detail: "鼓楼、永泰街附近收尾时顺路", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/EZgfZLvc4J1aqt1K" },
    { id: 29, day: 3, time: "18:30备", title: "紫泥369·四牌楼店（晚餐备选）", detail: "位于古城中心，建议下午游览时先取号", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/77277092" },
    { id: 17, day: 3, time: "备选", title: "老柴刀削面（备选）", detail: "9:00 开门；若当天晚出发或临时调整时使用", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/H9rkzCvOKyordHic" },
    { id: 16, day: 4, time: "07:00", title: "东方刀削面（早餐）", detail: "7:00 营业；吃完出发前往悬空寺", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.dianping.com/shop/H2e1JbZiMquWmo1H" },
    { id: 9, day: 4, time: "09:00", title: "悬空寺", detail: "登临票限流，穿防滑鞋", done: 0, updatedAt: EMPTY_TIME },
    { id: 30, day: 4, time: "11:30", title: "张三凉粉（浑源加餐）", detail: "悬空寺后进浑源县城，少量尝鲜；出发前确认门店位置与营业状态", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.amap.com/search?query=%E5%BC%A0%E4%B8%89%E5%87%89%E7%B2%89&city=%E6%B5%91%E6%BA%90%E5%8E%BF" },
    { id: 31, day: 4, time: "12:00", title: "鸿福酒楼·恒山南路山门店（午餐主选）", detail: "恒山南路56号（岳麓家园对面）；适合4人正式午餐，饭后前往应县木塔", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://gs.ctrip.com/html5/you/foods/fooddetail/3026/8321177.html" },
    { id: 32, day: 4, time: "12:00备", title: "大霞凉粉（午餐备选）", detail: "浑源本地老字号；最新门店信息不完整，出发前在地图确认营业状态", done: 0, updatedAt: EMPTY_TIME, reviewUrl: "https://www.amap.com/search?query=%E5%A4%A7%E9%9C%9E%E5%87%89%E7%B2%89&city=%E6%B5%91%E6%BA%90%E5%8E%BF" },
    { id: 10, day: 4, time: "13:30", title: "应县木塔", detail: "15:00 左右启程返回太原", done: 0, updatedAt: EMPTY_TIME },
    { id: 11, day: 4, time: "18:30", title: "抵达太原", detail: "入住带停车场的酒店", done: 0, updatedAt: EMPTY_TIME },
    { id: 12, day: 5, time: "08:30", title: "双塔寺", detail: "随后前往柳巷、钟楼街", done: 0, updatedAt: EMPTY_TIME },
    { id: 13, day: 5, time: "11:30", title: "晋菜午餐", detail: "13:00～13:30 出发去机场", done: 0, updatedAt: EMPTY_TIME },
    { id: 14, day: 5, time: "14:00", title: "机场还车", detail: "验车、值机，16:00 返程", done: 0, updatedAt: EMPTY_TIME },
  ],
  expenses: [],
  checklist: [
    { id: 1, label: "4人身份证与驾驶证", checked: 0, updatedAt: EMPTY_TIME },
    { id: 2, label: "山西博物院预约", checked: 0, updatedAt: EMPTY_TIME },
    { id: 3, label: "云冈石窟预约", checked: 0, updatedAt: EMPTY_TIME },
    { id: 4, label: "悬空寺入园票与登临票", checked: 0, updatedAt: EMPTY_TIME },
    { id: 5, label: "租车订单与取车资料", checked: 0, updatedAt: EMPTY_TIME },
    { id: 6, label: "雨具、防晒、防滑运动鞋", checked: 0, updatedAt: EMPTY_TIME },
  ],
  audit: [],
};

function formatMoney(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function handbookTag(item: TripItem) {
  if (item.time.includes("备") || item.title.includes("备选")) return { label: "备", tone: "optional" };
  if (/入住|酒店|住宿/.test(`${item.title}${item.detail}`)) return { label: "住", tone: "stay" };
  if (/早餐|午餐|晚餐|刀削面|觅食|晋菜|小吃/.test(`${item.title}${item.detail}`)) return { label: "食", tone: "food" };
  if (/机场|抵达|自驾|前往|还车|返程/.test(`${item.title}${item.detail}`)) return { label: "行", tone: "drive" };
  return { label: "游", tone: "visit" };
}

function savedMember() {
  if (typeof window === "undefined") return MEMBERS[0];
  const value = window.localStorage.getItem("shanxi-member");
  return value && MEMBERS.includes(value) ? value : MEMBERS[0];
}

export default function TripApp() {
  const [member, setMember] = useState(savedMember);
  const [tab, setTab] = useState<"home" | "itinerary" | "expenses" | "prep" | "activity">("home");
  const [day, setDay] = useState(1);
  const [state, setState] = useState<SharedState>(FALLBACK);
  const [online, setOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(savedMember);
  const [participants, setParticipants] = useState<string[]>(MEMBERS);

  async function loadSharedState(options: { silent?: boolean } = {}) {
    if (!options.silent) setSyncing(true);
    try {
      const response = await fetch("/api/trip", { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as SharedState;
      setState(data);
      setOnline(true);
      setLastSyncedAt(new Date());
    } catch {
      setOnline(false);
    } finally {
      if (!options.silent) setSyncing(false);
    }
  }

  useEffect(() => {
    const initialSync = window.setTimeout(() => loadSharedState(), 0);
    const timer = window.setInterval(() => loadSharedState({ silent: true }), 10_000);
    const refresh = () => {
      if (document.visibilityState === "visible") loadSharedState({ silent: true });
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function chooseMember(name: string) {
    localStorage.setItem("shanxi-member", name);
    setMember(name);
    setPaidBy(name);
    setNotice("");
  }

  async function mutate(payload: Record<string, unknown>) {
    const response = await fetch("/api/trip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ actor: member, ...payload }),
    });
    if (response.status === 409) {
      const result = await response.json() as { error?: string };
      setNotice(result.error || "数据已被其他成员更新，已为你刷新");
      await loadSharedState();
      return "conflict" as const;
    }
    if (!response.ok) {
      setOnline(false);
      setNotice("保存失败，请检查网络后重试");
      return "error" as const;
    }
    setNotice("");
    await loadSharedState({ silent: true });
    return "ok" as const;
  }

  async function toggleItinerary(item: TripItem) {
    const previous = state;
    setState((current) => ({
      ...current,
      itinerary: current.itinerary.map((entry) =>
        entry.id === item.id ? { ...entry, done: entry.done ? 0 : 1 } : entry
      ),
    }));
    const result = await mutate({
      action: "toggleItinerary",
      id: item.id,
      value: item.done ? 0 : 1,
      expectedUpdatedAt: item.updatedAt,
    });
    if (result === "error") setState(previous);
  }

  async function toggleChecklist(item: ChecklistItem) {
    const previous = state;
    setState((current) => ({
      ...current,
      checklist: current.checklist.map((entry) =>
        entry.id === item.id ? { ...entry, checked: entry.checked ? 0 : 1 } : entry
      ),
    }));
    const result = await mutate({
      action: "toggleChecklist",
      id: item.id,
      value: item.checked ? 0 : 1,
      expectedUpdatedAt: item.updatedAt,
    });
    if (result === "error") setState(previous);
  }

  function openAddExpense() {
    setEditingExpense(null);
    setDescription("");
    setAmount("");
    setPaidBy(member);
    setParticipants(MEMBERS);
    setExpenseOpen(true);
  }

  function openEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount((expense.amountCents / 100).toFixed(2));
    setPaidBy(expense.paidBy);
    setParticipants(expense.participants.length ? expense.participants : MEMBERS);
    setExpenseOpen(true);
  }

  function toggleParticipant(name: string) {
    setParticipants((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }

  async function saveExpense(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!description.trim() || !Number.isFinite(value) || value <= 0 || participants.length === 0) {
      setNotice("请填写金额，并至少选择一位参与分摊的成员");
      return;
    }
    const payload = {
      description: description.trim(),
      amountCents: Math.round(value * 100),
      paidBy,
      participants,
    };
    const result = editingExpense
      ? await mutate({
          action: "editExpense",
          id: editingExpense.id,
          expectedUpdatedAt: editingExpense.updatedAt,
          ...payload,
        })
      : await mutate({ action: "addExpense", ...payload });
    if (result === "ok") setExpenseOpen(false);
  }

  async function deleteExpense(expense: Expense) {
    if (!window.confirm(`确定删除“${expense.description}”这笔费用吗？删除后可以在动态中撤销。`)) return;
    await mutate({
      action: "deleteExpense",
      id: expense.id,
      expectedUpdatedAt: expense.updatedAt,
    });
  }

  async function undoAudit(entry: AuditEntry) {
    await mutate({ action: "undo", auditId: entry.id });
  }

  const todayItems = state.itinerary.filter((item) => item.day === day);
  const totalCents = useMemo(
    () => state.expenses.reduce((sum, item) => sum + item.amountCents, 0),
    [state.expenses],
  );
  const completed = state.itinerary.filter((item) => item.done).length;
  const prepDone = state.checklist.filter((item) => item.checked).length;
  const settlements = useMemo(() => {
    const balances = Object.fromEntries(MEMBERS.map((name) => [name, 0])) as Record<string, number>;
    for (const expense of state.expenses) {
      const included = expense.participants.filter((name) => MEMBERS.includes(name));
      if (!included.length || !MEMBERS.includes(expense.paidBy)) continue;
      balances[expense.paidBy] += expense.amountCents;
      const base = Math.floor(expense.amountCents / included.length);
      let remainder = expense.amountCents - base * included.length;
      for (const name of included) {
        balances[name] -= base + (remainder > 0 ? 1 : 0);
        remainder -= remainder > 0 ? 1 : 0;
      }
    }
    const creditors = MEMBERS.map((name) => ({ name, cents: balances[name] }))
      .filter((item) => item.cents > 0)
      .sort((a, b) => b.cents - a.cents);
    const debtors = MEMBERS.map((name) => ({ name, cents: -balances[name] }))
      .filter((item) => item.cents > 0)
      .sort((a, b) => b.cents - a.cents);
    const result: Array<{ from: string; to: string; cents: number }> = [];
    let debtorIndex = 0;
    let creditorIndex = 0;
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const cents = Math.min(debtors[debtorIndex].cents, creditors[creditorIndex].cents);
      if (cents > 0) result.push({ from: debtors[debtorIndex].name, to: creditors[creditorIndex].name, cents });
      debtors[debtorIndex].cents -= cents;
      creditors[creditorIndex].cents -= cents;
      if (debtors[debtorIndex].cents === 0) debtorIndex += 1;
      if (creditors[creditorIndex].cents === 0) creditorIndex += 1;
    }
    return result;
  }, [state.expenses]);

  return (
    <main className="app-shell">
      <header className={tab === "home" ? "hero home-hero" : "hero"}>
        <div className="topline">
          <span className="brand">晋行</span>
          <button className={online ? "sync online" : "sync"} onClick={() => loadSharedState()} disabled={syncing}>
            {syncing ? "同步中…" : online ? "已同步" : "离线预览"}
          </button>
        </div>
        <div className="member-switch" aria-label="选择当前成员">
          <span>当前：</span>
          {MEMBERS.map((name) => (
            <button key={name} className={member === name ? "active" : ""} onClick={() => chooseMember(name)}>{name}</button>
          ))}
        </div>
        <p className="kicker">4人 · 8月8日—8月12日 · 太原进出</p>
        <h1>{tab === "home" ? "晋韵双城" : "太原 ↔ 大同"}</h1>
        <p className="hero-copy">{tab === "home" ? "太原 → 大同 → 太原 · 五日自驾手册" : "大家共同维护的实时旅行计划。"}</p>
        <div className="hero-stats">
          <div><strong>5</strong><span>天</span></div>
          <div><strong>{completed}/{state.itinerary.length}</strong><span>行程</span></div>
          <div><strong>{formatMoney(totalCents)}</strong><span>已记录</span></div>
        </div>
      </header>

      <section className="content">
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
        <div className="sync-note">
          {lastSyncedAt ? `每10秒自动同步 · 最近同步 ${lastSyncedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : "正在连接共享空间…"}
        </div>

        {tab === "home" && (
          <>
            <section className="handbook-intro">
              <span className="eyebrow">五日路线总览</span>
              <h2>一页看完整趟山西</h2>
              <p>点击任意一天，进入可勾选、可查看餐厅链接的详细行程。</p>
            </section>
            <section className="route-ribbon" aria-label="总路线">
              <span>成都（2人）</span><b>→</b><span>重庆集合（4人）</span><b>→</b><span>太原</span><b>→</b><span>大同</span><b>→</b><span>太原</span>
            </section>
            <section className="handbook-days">
              {DATES.map((date, index) => {
                const items = state.itinerary.filter((item) => item.day === index + 1);
                return (
                  <article className={`handbook-day day-${index + 1}`} key={date}>
                    <div className="route-node"><span>{CITIES[index].split(" → ")[0]}</span></div>
                    <button onClick={() => { setDay(index + 1); setTab("itinerary"); }}>
                      <div className="day-stamp"><b>D{index + 1}</b><strong>{date}</strong><small>{WEEKDAYS[index]}</small></div>
                      <div className="day-brief">
                        <h3>{DAY_ROUTES[index]}</h3>
                        <div className="day-lines">
                          {items.map((item) => {
                            const tag = handbookTag(item);
                            return (
                              <p key={item.id}>
                                <span className={`handbook-tag ${tag.tone}`}>{tag.label}</span>
                                <b>{item.time}</b>
                                <span>{item.title.replace(/（早餐）|（备选）/g, "")}</span>
                                {item.reviewUrl && <em>有点评链接</em>}
                              </p>
                            );
                          })}
                        </div>
                        <span className="open-day">查看 D{index + 1} 详细安排 →</span>
                      </div>
                      <div className="day-photo" aria-label={`${DAY_SCENES[index]}景点照片`}><span>{DAY_SCENES[index]}</span></div>
                    </button>
                  </article>
                );
              })}
            </section>
            <details className="photo-credits">
              <summary>景点图片来源与授权</summary>
              <p>
                <a href="https://commons.wikimedia.org/wiki/File:Jinci_Temple_(54572159327).jpg" target="_blank" rel="noreferrer">晋祠 · xiquinhosilva（CC BY 2.0）</a>
                <a href="https://commons.wikimedia.org/wiki/File:2013_Shanxi_Provincial_Museum,_Taiyuan.jpg" target="_blank" rel="noreferrer">山西博物院 · Gary Todd（CC0）</a>
                <a href="https://commons.wikimedia.org/wiki/File:Yungang_Grottoes.jpg" target="_blank" rel="noreferrer">云冈石窟（公共领域）</a>
                <a href="https://commons.wikimedia.org/wiki/File:Hunyuan_Xuankong_Si_2013.08.30_09-02-11.jpg" target="_blank" rel="noreferrer">悬空寺 · Zhangzhugang（CC BY-SA 3.0）</a>
                <a href="https://commons.wikimedia.org/wiki/File:Yongzuo_Temple_Twin_Towers.jpg" target="_blank" rel="noreferrer">双塔寺 · Roland Longbow（CC BY-SA 3.0）</a>
              </p>
            </details>
            <section className="home-toolbox">
              <div className="section-heading"><div><span className="eyebrow">出发前一页搞定</span><h2>其他功能</h2></div></div>
              <div className="tool-grid">
                <button onClick={() => setTab("expenses")}><span>¥</span><strong>费用速算</strong><small>已记录 {formatMoney(totalCents)}<br />人均 {formatMoney(Math.round(totalCents / 4))}</small></button>
                <button onClick={() => setTab("prep")}><span>✓</span><strong>预约准备</strong><small>{prepDone}/{state.checklist.length} 项完成<br />门票与行李清单</small></button>
                <button onClick={() => setTab("activity")}><span>↶</span><strong>成员动态</strong><small>{state.audit.length} 条记录<br />修改可撤销</small></button>
              </div>
            </section>
          </>
        )}

        {tab === "itinerary" && (
          <>
            <section className="section-heading"><div><span className="eyebrow">共享行程</span><h2>{DATES[day - 1]} · {CITIES[day - 1]}</h2></div></section>
            <div className="day-tabs">
              {DATES.map((_, index) => <button key={index} className={day === index + 1 ? "active" : ""} onClick={() => setDay(index + 1)}>D{index + 1}</button>)}
            </div>
            <section className="timeline">
              {todayItems.map((item) => (
                <article className="timeline-row" key={item.id}>
                  <button className={item.done ? "timeline-item done" : "timeline-item"} onClick={() => toggleItinerary(item)}>
                    <span className="time">{item.time}</span><span className="dot" />
                    <span className="event"><strong>{item.title}</strong><small>{item.detail}</small></span>
                    <span className="check">{item.done ? "✓" : ""}</span>
                  </button>
                  {item.reviewUrl && (
                    <a className="restaurant-link" href={item.reviewUrl} target="_blank" rel="noreferrer" aria-label={`查看${item.title}门店信息`}>
                      查看门店信息 ↗
                    </a>
                  )}
                </article>
              ))}
            </section>
            <p className="hint">点击行程即可标记完成；误操作可前往“动态”撤销。</p>
          </>
        )}

        {tab === "expenses" && (
          <>
            <section className="section-heading">
              <div><span className="eyebrow">真实共享账本</span><h2>旅行费用</h2></div>
              <button className="add-button" onClick={openAddExpense}>＋ 记一笔</button>
            </section>
            <section className="budget-card">
              <span>当前总支出</span><strong>{formatMoney(totalCents)}</strong><p>4人平均约 {formatMoney(Math.round(totalCents / 4))} / 人</p>
            </section>
            <section className="settlement panel">
              <div className="settlement-head"><strong>当前结算建议</strong><small>按每笔实际参与人计算</small></div>
              {settlements.length === 0
                ? <p className="settled">目前已经结清</p>
                : settlements.map((item) => <p key={`${item.from}-${item.to}`}><b>{item.from}</b><span>转给</span><b>{item.to}</b><strong>{formatMoney(item.cents)}</strong></p>)}
            </section>
            <section className="expense-list">
              {state.expenses.length === 0
                ? <div className="empty">还没有费用记录，试着添加第一笔租车费。</div>
                : state.expenses.map((item) => (
                    <article key={item.id}>
                      <button className="expense-main" onClick={() => openEditExpense(item)}>
                        <span><strong>{item.description}</strong><small>{item.paidBy} 支付 · {item.participants.join("、")} 分摊</small></span>
                        <b>{formatMoney(item.amountCents)}</b>
                      </button>
                      <button className="delete-button" aria-label={`删除${item.description}`} onClick={() => deleteExpense(item)}>删除</button>
                    </article>
                  ))}
            </section>
          </>
        )}

        {tab === "prep" && (
          <>
            <section className="section-heading">
              <div><span className="eyebrow">出发前</span><h2>预约与行李清单</h2></div>
              <strong className="progress">{prepDone}/{state.checklist.length}</strong>
            </section>
            <section className="checklist">
              {state.checklist.map((item) => (
                <button key={item.id} className={item.checked ? "checked" : ""} onClick={() => toggleChecklist(item)}>
                  <span>{item.checked ? "✓" : ""}</span><strong>{item.label}</strong>
                </button>
              ))}
            </section>
            <section className="panel reminder">
              <span className="eyebrow">关键日期</span>
              <p><strong>8月1日</strong> 关注云冈石窟放票</p>
              <p><strong>8月5日</strong> 预约8月9日山西博物院</p>
            </section>
          </>
        )}

        {tab === "activity" && (
          <>
            <section className="section-heading"><div><span className="eyebrow">操作留痕</span><h2>成员动态</h2></div></section>
            <section className="activity-list">
              {state.audit.length === 0
                ? <div className="empty">成员的修改会记录在这里。</div>
                : state.audit.map((entry) => (
                    <article key={entry.id} className={entry.undone ? "undone" : ""}>
                      <div className="avatar">{entry.actor.slice(0, 1)}</div>
                      <div><strong>{entry.actor}</strong><p>{entry.summary}</p><small>{formatActivityTime(entry.createdAt)}{entry.undone ? " · 已撤销" : ""}</small></div>
                      {entry.undoable && !entry.undone && <button className="undo-button" onClick={() => undoAudit(entry)}>撤销</button>}
                    </article>
                  ))}
            </section>
          </>
        )}
      </section>

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><span>⌂</span>首页</button>
        <button className={tab === "itinerary" ? "active" : ""} onClick={() => setTab("itinerary")}><span>●</span>行程</button>
        <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}><span>¥</span>费用</button>
        <button className={tab === "prep" ? "active" : ""} onClick={() => setTab("prep")}><span>✓</span>准备</button>
        <button className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}><span>↶</span>动态</button>
      </nav>

      {expenseOpen && (
        <div className="modal-backdrop" onClick={() => setExpenseOpen(false)}>
          <form className="modal" onSubmit={saveExpense} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head"><h3>{editingExpense ? "编辑费用" : "记一笔费用"}</h3><button type="button" onClick={() => setExpenseOpen(false)}>×</button></div>
            <label>费用说明<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="例如：机场租车" autoFocus /></label>
            <label>金额<input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" /></label>
            <label>谁付款<select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>{MEMBERS.map((name) => <option key={name}>{name}</option>)}</select></label>
            <fieldset className="participant-field">
              <legend>谁参与分摊</legend>
              <div className="participant-grid">
                {MEMBERS.map((name) => (
                  <button type="button" key={name} className={participants.includes(name) ? "selected" : ""} onClick={() => toggleParticipant(name)}>
                    {participants.includes(name) ? "✓ " : ""}{name}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="primary" type="submit">{editingExpense ? "保存修改" : "保存并同步"}</button>
          </form>
        </div>
      )}
    </main>
  );
}
