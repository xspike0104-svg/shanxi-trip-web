"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TripItem = {
  id: number;
  day: number;
  time: string;
  title: string;
  detail: string;
  done: number;
};

type Expense = {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  sharedBy: number;
  createdAt: string;
};

type ChecklistItem = {
  id: number;
  label: string;
  checked: number;
};

type SharedState = {
  itinerary: TripItem[];
  expenses: Expense[];
  checklist: ChecklistItem[];
};

const MEMBERS = ["小晋", "阿同", "云云", "木木"];
const ROOM_CODE = "JIN2026";
const DATES = ["8月8日", "8月9日", "8月10日", "8月11日", "8月12日"];
const CITIES = ["太原", "太原 → 大同", "大同", "大同 → 太原", "太原"];

const FALLBACK: SharedState = {
  itinerary: [
    { id: 1, day: 1, time: "12:00", title: "抵达太原机场", detail: "机场取车，检查车况并拍照", done: 0 },
    { id: 2, day: 1, time: "14:00", title: "晋祠", detail: "建议游览 2.5—3 小时", done: 0 },
    { id: 3, day: 1, time: "18:30", title: "钟楼街觅食", detail: "过油肉、灌肠、莜面、羊杂割", done: 0 },
    { id: 4, day: 2, time: "09:00", title: "山西博物院", detail: "提前预约，预留 3 小时", done: 0 },
    { id: 5, day: 2, time: "13:30", title: "自驾前往大同", detail: "约 280km / 3.5—4 小时", done: 0 },
    { id: 6, day: 2, time: "18:00", title: "大同古城夜游", detail: "华严广场与城墙夜景", done: 0 },
    { id: 7, day: 3, time: "08:00", title: "云冈石窟", detail: "重点参观昙曜五窟", done: 0 },
    { id: 8, day: 3, time: "14:00", title: "大同古城深度游", detail: "华严寺、善化寺、九龙壁", done: 0 },
    { id: 9, day: 4, time: "09:00", title: "悬空寺", detail: "登临票限流，穿防滑鞋", done: 0 },
    { id: 10, day: 4, time: "13:30", title: "应县木塔", detail: "15:00 左右启程返回太原", done: 0 },
    { id: 11, day: 4, time: "18:30", title: "抵达太原", detail: "入住带停车场的酒店", done: 0 },
    { id: 12, day: 5, time: "08:30", title: "双塔寺", detail: "随后前往柳巷、钟楼街", done: 0 },
    { id: 13, day: 5, time: "11:30", title: "晋菜午餐", detail: "13:00—13:30 出发去机场", done: 0 },
    { id: 14, day: 5, time: "14:00", title: "机场还车", detail: "验车、值机，16:00 返程", done: 0 },
  ],
  expenses: [],
  checklist: [
    { id: 1, label: "4人身份证与驾驶证", checked: 0 },
    { id: 2, label: "山西博物院预约", checked: 0 },
    { id: 3, label: "云冈石窟预约", checked: 0 },
    { id: 4, label: "悬空寺入园票与登临票", checked: 0 },
    { id: 5, label: "租车订单与取车资料", checked: 0 },
    { id: 6, label: "雨具、防晒、防滑运动鞋", checked: 0 },
  ],
};

export default function TripApp() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [member, setMember] = useState(MEMBERS[0]);
  const [tab, setTab] = useState<"home" | "itinerary" | "expenses" | "prep">("home");
  const [day, setDay] = useState(1);
  const [state, setState] = useState<SharedState>(FALLBACK);
  const [online, setOnline] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(MEMBERS[0]);

  async function loadSharedState() {
    try {
      const response = await fetch(`/api/trip?code=${ROOM_CODE}`, { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as SharedState;
      setState(data);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }

  useEffect(() => {
    if (joined) loadSharedState();
  }, [joined]);

  function enterTrip(event: FormEvent) {
    event.preventDefault();
    if (room.trim().toUpperCase() !== ROOM_CODE) return;
    localStorage.setItem("shanxi-member", member);
    setJoined(true);
  }

  async function mutate(payload: Record<string, unknown>) {
    const optimistic = state;
    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: ROOM_CODE, actor: member, ...payload }),
      });
      if (!response.ok) throw new Error("save failed");
      await loadSharedState();
    } catch {
      setState(optimistic);
      setOnline(false);
    }
  }

  function toggleItinerary(id: number, done: number) {
    setState((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item) => item.id === id ? { ...item, done: done ? 0 : 1 } : item),
    }));
    mutate({ action: "toggleItinerary", id, value: done ? 0 : 1 });
  }

  function toggleChecklist(id: number, checked: number) {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) => item.id === id ? { ...item, checked: checked ? 0 : 1 } : item),
    }));
    mutate({ action: "toggleChecklist", id, value: checked ? 0 : 1 });
  }

  function addExpense(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!description.trim() || !Number.isFinite(value) || value <= 0) return;
    mutate({ action: "addExpense", description: description.trim(), amount: value, paidBy, sharedBy: 4 });
    setDescription("");
    setAmount("");
    setExpenseOpen(false);
  }

  const todayItems = state.itinerary.filter((item) => item.day === day);
  const total = useMemo(() => state.expenses.reduce((sum, item) => sum + item.amount, 0), [state.expenses]);
  const completed = state.itinerary.filter((item) => item.done).length;
  const prepDone = state.checklist.filter((item) => item.checked).length;

  if (!joined) {
    return (
      <main className="join-screen">
        <section className="join-card">
          <span className="eyebrow">山西 · 4人共享旅行空间</span>
          <h1>晋行</h1>
          <p className="join-lead">太原与大同的五日自驾，行程、费用和准备事项都放在这里。</p>
          <form onSubmit={enterTrip}>
            <label>旅行口令</label>
            <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="输入 JIN2026" />
            <label>我是谁</label>
            <div className="member-grid">
              {MEMBERS.map((name) => (
                <button type="button" key={name} className={member === name ? "member active" : "member"} onClick={() => setMember(name)}>
                  {name}
                </button>
              ))}
            </div>
            <button className="primary" type="submit">进入旅行空间</button>
          </form>
          <small>框架演示口令：JIN2026</small>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="topline">
          <span className="brand">晋行</span>
          <span className={online ? "sync online" : "sync"}>{online ? "已同步" : "离线预览"}</span>
        </div>
        <p className="kicker">2026.08.08—08.12 · 四人自驾</p>
        <h1>太原 ⇄ 大同</h1>
        <p className="hero-copy">下一次出发，从一份大家都能修改的计划开始。</p>
        <div className="hero-stats">
          <div><strong>5</strong><span>天</span></div>
          <div><strong>{completed}/{state.itinerary.length}</strong><span>行程</span></div>
          <div><strong>¥{total.toFixed(0)}</strong><span>已记录</span></div>
        </div>
      </header>

      <section className="content">
        {tab === "home" && (
          <>
            <section className="section-heading">
              <div><span className="eyebrow">旅程总览</span><h2>今天先看什么？</h2></div>
              <button className="text-button" onClick={() => setTab("itinerary")}>查看全部</button>
            </section>
            <div className="day-strip">
              {DATES.map((date, index) => (
                <button key={date} onClick={() => { setDay(index + 1); setTab("itinerary"); }}>
                  <span>D{index + 1}</span><strong>{date}</strong><small>{CITIES[index]}</small>
                </button>
              ))}
            </div>
            <section className="panel next-card">
              <div className="pin">下一站</div>
              <span>8月8日 · 14:00</span>
              <h3>晋祠</h3>
              <p>从机场取车后前往，建议游览 2.5—3 小时。</p>
              <button className="secondary" onClick={() => { setDay(1); setTab("itinerary"); }}>开始今日行程</button>
            </section>
            <div className="two-columns">
              <section className="panel compact">
                <span className="panel-icon">✓</span>
                <div><strong>准备进度</strong><p>{prepDone}/{state.checklist.length} 项已完成</p></div>
              </section>
              <section className="panel compact">
                <span className="panel-icon">¥</span>
                <div><strong>人均支出</strong><p>¥{(total / 4).toFixed(0)}</p></div>
              </section>
            </div>
          </>
        )}

        {tab === "itinerary" && (
          <>
            <section className="section-heading">
              <div><span className="eyebrow">共享行程</span><h2>{DATES[day - 1]} · {CITIES[day - 1]}</h2></div>
            </section>
            <div className="day-tabs">
              {DATES.map((_, index) => <button key={index} className={day === index + 1 ? "active" : ""} onClick={() => setDay(index + 1)}>D{index + 1}</button>)}
            </div>
            <section className="timeline">
              {todayItems.map((item) => (
                <button key={item.id} className={item.done ? "timeline-item done" : "timeline-item"} onClick={() => toggleItinerary(item.id, item.done)}>
                  <span className="time">{item.time}</span>
                  <span className="dot" />
                  <span className="event"><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <span className="check">{item.done ? "✓" : ""}</span>
                </button>
              ))}
            </section>
            <p className="hint">点击行程即可由任意成员标记完成。</p>
          </>
        )}

        {tab === "expenses" && (
          <>
            <section className="section-heading">
              <div><span className="eyebrow">真实共享账本</span><h2>旅行费用</h2></div>
              <button className="add-button" onClick={() => setExpenseOpen(true)}>＋ 记一笔</button>
            </section>
            <section className="budget-card">
              <span>当前总支出</span><strong>¥{total.toFixed(2)}</strong><p>4人均摊约 ¥{(total / 4).toFixed(2)} / 人</p>
            </section>
            <section className="expense-list">
              {state.expenses.length === 0 ? <div className="empty">还没有费用记录，试着添加第一笔租车费。</div> : state.expenses.map((item) => (
                <article key={item.id}>
                  <div><strong>{item.description}</strong><small>{item.paidBy} 支付 · {item.sharedBy}人平摊</small></div>
                  <b>¥{item.amount.toFixed(2)}</b>
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
                <button key={item.id} className={item.checked ? "checked" : ""} onClick={() => toggleChecklist(item.id, item.checked)}>
                  <span>{item.checked ? "✓" : ""}</span><strong>{item.label}</strong>
                </button>
              ))}
            </section>
            <section className="panel reminder">
              <span className="eyebrow">关键日期</span>
              <p><strong>8月3日</strong> 关注云冈石窟放票</p>
              <p><strong>8月6日</strong> 预约8月9日山西博物院</p>
            </section>
          </>
        )}
      </section>

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><span>⌂</span>首页</button>
        <button className={tab === "itinerary" ? "active" : ""} onClick={() => setTab("itinerary")}><span>◫</span>行程</button>
        <button className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}><span>¥</span>费用</button>
        <button className={tab === "prep" ? "active" : ""} onClick={() => setTab("prep")}><span>✓</span>准备</button>
      </nav>

      {expenseOpen && (
        <div className="modal-backdrop" onClick={() => setExpenseOpen(false)}>
          <form className="modal" onSubmit={addExpense} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3>记一笔费用</h3><button type="button" onClick={() => setExpenseOpen(false)}>×</button></div>
            <label>费用说明<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="例如：机场租车" autoFocus /></label>
            <label>金额<input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" /></label>
            <label>谁付款<select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>{MEMBERS.map((name) => <option key={name}>{name}</option>)}</select></label>
            <button className="primary" type="submit">保存并同步</button>
          </form>
        </div>
      )}
    </main>
  );
}
