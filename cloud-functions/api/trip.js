import { getStore } from "@edgeone/pages-blob";

const STORE_NAME = "shanxi-trip-state";
const MEMBERS = ["大王", "小曾", "大曾", "小陈"];
const DEFAULT_STATE_KEY = "rooms/public-shanxi-2026/state-v2.json";

const ITINERARY = [
  [1, "12:00", "抵达太原机场", "机场取车，检查车况并拍照"],
  [1, "14:30", "晋祠", "建议游览至 17:30 左右"],
  [1, "19:00", "老太原菜馆（晚餐）", "晋祠游览后返回市区，品尝经典晋菜"],
  [2, "09:00", "山西博物院", "提前预约，预留 3 小时"],
  [2, "13:30", "自驾前往大同", "约 280km / 3.5～4 小时"],
  [2, "18:00", "大同古城夜游", "华严广场与城墙夜景"],
  [3, "08:00", "云冈石窟", "重点参观昙曜五窟"],
  [3, "14:00", "大同古城深度游", "华严寺、善化寺、九龙壁"],
  [4, "09:00", "悬空寺", "登临票限流，穿防滑鞋"],
  [4, "13:30", "应县木塔", "15:00 左右启程返回太原"],
  [4, "18:30", "抵达太原", "入住带停车场的酒店"],
  [5, "08:30", "双塔寺", "随后前往柳巷、钟楼街"],
  [5, "11:30", "晋菜午餐", "13:00～13:30 出发去机场"],
  [5, "14:00", "机场还车", "验车、值机，16:00 返程"],
];

const FOOD_ITEMS = [
  { id: 15, day: 3, time: "07:00", title: "喜晋道刀削面（早餐）", detail: "7:00 营业；吃完前往云冈石窟", reviewUrl: "https://www.dianping.com/shop/G8YwWWTb0pJHeRVc" },
  { id: 16, day: 4, time: "07:00", title: "东方刀削面（早餐）", detail: "7:00 营业；吃完出发前往悬空寺", reviewUrl: "https://www.dianping.com/shop/H2e1JbZiMquWmo1H" },
  { id: 17, day: 3, time: "备选", title: "老柴刀削面（备选）", detail: "9:00 开门；若当天晚出发或临时调整时使用", reviewUrl: "https://www.dianping.com/shop/H9rkzCvOKyordHic" },
  { id: 18, day: 1, time: "13:00", title: "卫家剔尖小馆（午餐）", detail: "取车后先吃午饭，再前往晋祠", reviewUrl: "https://www.dianping.com/shop/l1y54Qx0N0nti9Aj" },
  { id: 19, day: 1, time: "13:00备", title: "龙聚祥（午餐备选）", detail: "卫家排队较久或路线临时调整时使用", reviewUrl: "https://www.dianping.com/shop/k9leS84p5DO2618O" },
  { id: 20, day: 1, time: "19:00备", title: "利源沾片子（晚餐备选）", detail: "老太原菜馆排队较久时使用", reviewUrl: "https://www.dianping.com/shop/G6ipBZ73IHlW7slp" },
  { id: 21, day: 2, time: "17:30", title: "三道菜·明堂公园店（晚餐主选）", detail: "进大同城南顺路先吃；饭后入住并夜游古城", reviewUrl: "https://www.dianping.com/shop/G5LH68mS2bcQh3JN" },
  { id: 22, day: 2, time: "17:30备", title: "花园大饭店（晚餐备选）", detail: "若先进入古城，可改在永泰街、鼓楼附近用餐", reviewUrl: "https://www.dianping.com/shop/EZgfZLvc4J1aqt1K" },
  { id: 23, day: 2, time: "17:30备", title: "田园北魏家宴·御东店（晚餐备选）", detail: "适合走御东一侧或酒店在城东时选择", reviewUrl: "https://www.dianping.com/shop/l28atK9sjAQTYE2F" },
  { id: 24, day: 3, time: "12:30", title: "红旗瑞丰楼·北魏家宴（午餐主选）", detail: "返城后在清远街用餐；饭后从附近华严寺开始古城游", reviewUrl: "https://www.dianping.com/shop/jR1yAJB7FNYJ95pE" },
  { id: 25, day: 3, time: "12:30备", title: "凯鸽·云冈石窟店（午餐备选）", detail: "云冈游览结束就近用餐，时间紧时最省路", reviewUrl: "https://www.dianping.com/shop/l20iC9dhpy1Kkn9C" },
  { id: 26, day: 3, time: "12:30备", title: "紫泥369·四牌楼店（午餐备选）", detail: "回到古城后用餐；热门时段建议先取号", reviewUrl: "https://www.dianping.com/shop/77277092" },
  { id: 27, day: 3, time: "18:30", title: "弘雅饭店（晚餐主选）", detail: "古城深度游结束后用餐，优先提前确认桌位", reviewUrl: "https://www.dianping.com/shop/2120494" },
  { id: 28, day: 3, time: "18:30备", title: "花园大饭店（晚餐备选）", detail: "鼓楼、永泰街附近收尾时顺路", reviewUrl: "https://www.dianping.com/shop/EZgfZLvc4J1aqt1K" },
  { id: 29, day: 3, time: "18:30备", title: "紫泥369·四牌楼店（晚餐备选）", detail: "位于古城中心，建议下午游览时先取号", reviewUrl: "https://www.dianping.com/shop/77277092" },
];

const ITINERARY_UPDATES = [
  { id: 2, day: 1, time: "14:30", title: "晋祠", detail: "建议游览至 17:30 左右" },
  { id: 3, day: 1, time: "19:00", title: "老太原菜馆（晚餐）", detail: "晋祠游览后返回市区，品尝经典晋菜", reviewUrl: "https://www.dianping.com/shop/l45LUzCIO2sjR4rC" },
];

const CHECKLIST = [
  "4人身份证与驾驶证",
  "山西博物院预约",
  "云冈石窟预约",
  "悬空寺入园票与登临票",
  "租车订单与取车资料",
  "雨具、防晒、防滑运动鞋",
];

function responseJson(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function validActor(value) {
  return typeof value === "string" && MEMBERS.includes(value) ? value : MEMBERS[0];
}

function uniqueId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

function normalizeParticipants(value) {
  if (!Array.isArray(value)) return MEMBERS;
  const result = MEMBERS.filter((name) => value.includes(name));
  return result.length ? result : MEMBERS;
}

function normalizeExpense(item) {
  return {
    ...item,
    amountCents: Number.isInteger(item.amountCents)
      ? item.amountCents
      : Math.round(Number(item.amount || 0) * 100),
    participants: Array.isArray(item.participants)
      ? normalizeParticipants(item.participants)
      : MEMBERS.slice(0, Math.max(1, Math.min(4, Number(item.sharedBy) || 4))),
    updatedAt: item.updatedAt || item.createdAt || new Date(0).toISOString(),
  };
}

function defaultState() {
  const initialTime = new Date(0).toISOString();
  return {
    version: 6,
    revision: 0,
    itinerary: [
      ...ITINERARY.map(([day, time, title, detail], index) => ({
        id: index + 1,
        day,
        time,
        title,
        detail,
        done: 0,
        updatedAt: initialTime,
      })),
      ...FOOD_ITEMS.map((item) => ({ ...item, done: 0, updatedAt: initialTime })),
    ],
    expenses: [],
    checklist: CHECKLIST.map((label, index) => ({
      id: index + 1,
      label,
      checked: 0,
      updatedAt: initialTime,
    })),
    audit: [],
  };
}

async function migrateLegacyState(store, stateKey) {
  const state = defaultState();
  upgradeState(state);
  await store.setJSON(stateKey, state, { onlyIfNew: true });
  return (await store.get(stateKey, { type: "json", consistency: "strong" })) || state;
}

function sortItinerary(items) {
  items.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time, "zh-CN"));
}

function upgradeState(state) {
  let changed = Number(state.version || 0) < 6;
  for (const update of ITINERARY_UPDATES) {
    const existing = state.itinerary.find((item) => item.id === update.id);
    if (!existing) continue;
    if (Object.entries(update).some(([key, value]) => existing[key] !== value)) {
      Object.assign(existing, update);
      changed = true;
    }
  }
  for (const food of FOOD_ITEMS) {
    const existing = state.itinerary.find((item) => item.id === food.id);
    if (!existing) {
      state.itinerary.push({ ...food, done: 0, updatedAt: new Date(0).toISOString() });
      changed = true;
    } else if (existing.reviewUrl !== food.reviewUrl) {
      existing.reviewUrl = food.reviewUrl;
      changed = true;
    }
  }
  if (changed) {
    state.version = 6;
    state.revision = Number(state.revision || 0) + 1;
    sortItinerary(state.itinerary);
  }
  return changed;
}

async function loadState(store, stateKey) {
  const state = await store.get(stateKey, { type: "json", consistency: "strong" });
  if (!state) return migrateLegacyState(store, stateKey);
  if (upgradeState(state)) await store.setJSON(stateKey, state);
  return state;
}

async function saveState(store, state, stateKey) {
  state.revision = Number(state.revision || 0) + 1;
  await store.setJSON(stateKey, state);
}

function publicState(state) {
  return {
    itinerary: state.itinerary,
    expenses: state.expenses,
    checklist: state.checklist,
    audit: state.audit.map(({ undo, ...entry }) => entry),
  };
}

function addAudit(state, { actor, action, summary, undo }) {
  const entry = {
    id: uniqueId(),
    actor,
    action,
    summary,
    createdAt: new Date().toISOString(),
    undoable: Boolean(undo),
    undone: false,
    undo: undo || null,
  };
  state.audit = [entry, ...state.audit].slice(0, 40);
  return entry;
}

function conflict(item, expectedUpdatedAt) {
  return expectedUpdatedAt && item.updatedAt !== expectedUpdatedAt;
}

function undoAction(state, auditId, actor) {
  const entry = state.audit.find((item) => item.id === auditId);
  if (!entry || !entry.undoable || entry.undone || !entry.undo) {
    return { error: "这条操作已经不能撤销", status: 409 };
  }

  const now = new Date().toISOString();
  const undo = entry.undo;

  if (undo.kind === "itinerary") {
    const item = state.itinerary.find((value) => value.id === undo.id);
    if (!item || item.updatedAt !== undo.afterUpdatedAt) return { error: "该行程后来又被修改，不能直接撤销", status: 409 };
    item.done = undo.beforeValue;
    item.updatedAt = now;
  } else if (undo.kind === "checklist") {
    const item = state.checklist.find((value) => value.id === undo.id);
    if (!item || item.updatedAt !== undo.afterUpdatedAt) return { error: "该清单后来又被修改，不能直接撤销", status: 409 };
    item.checked = undo.beforeValue;
    item.updatedAt = now;
  } else if (undo.kind === "expense-add") {
    const item = state.expenses.find((value) => value.id === undo.id);
    if (!item || item.updatedAt !== undo.afterUpdatedAt) return { error: "该费用后来又被修改，不能直接撤销", status: 409 };
    state.expenses = state.expenses.filter((value) => value.id !== undo.id);
  } else if (undo.kind === "expense-edit") {
    const index = state.expenses.findIndex((value) => value.id === undo.id);
    if (index < 0 || state.expenses[index].updatedAt !== undo.afterUpdatedAt) return { error: "该费用后来又被修改，不能直接撤销", status: 409 };
    state.expenses[index] = { ...undo.before, updatedAt: now };
  } else if (undo.kind === "expense-delete") {
    if (state.expenses.some((value) => value.id === undo.id)) return { error: "该费用已经恢复，不能重复撤销", status: 409 };
    state.expenses.unshift({ ...undo.before, updatedAt: now });
  } else {
    return { error: "未知的撤销操作", status: 400 };
  }

  entry.undoable = false;
  entry.undone = true;
  entry.undoneBy = actor;
  entry.undoneAt = now;
  addAudit(state, { actor, action: "undo", summary: `撤销了：${entry.summary}`, undo: null });
  return { ok: true };
}

export async function onRequest({ request, env }) {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const stateKey = env?.TRIP_STATE_KEY || DEFAULT_STATE_KEY;

    if (request.method === "GET") {
      return responseJson(publicState(await loadState(store, stateKey)));
    }

    if (request.method !== "POST") return responseJson({ error: "请求方式不支持" }, 405);

    const payload = await request.json();
    const actor = validActor(payload.actor);
    const state = await loadState(store, stateKey);
    const now = new Date().toISOString();

    if (payload.action === "toggleItinerary") {
      const item = state.itinerary.find((value) => value.id === Number(payload.id));
      if (!item) return responseJson({ error: "行程不存在" }, 404);
      if (conflict(item, payload.expectedUpdatedAt)) return responseJson({ error: "该行程刚被其他成员更新，已为你刷新" }, 409);
      const beforeValue = item.done;
      item.done = Number(payload.value) ? 1 : 0;
      item.updatedAt = now;
      addAudit(state, {
        actor,
        action: "toggleItinerary",
        summary: `${item.done ? "完成" : "恢复"}行程“${item.title}”`,
        undo: { kind: "itinerary", id: item.id, beforeValue, afterUpdatedAt: now },
      });
    } else if (payload.action === "toggleChecklist") {
      const item = state.checklist.find((value) => value.id === Number(payload.id));
      if (!item) return responseJson({ error: "清单项目不存在" }, 404);
      if (conflict(item, payload.expectedUpdatedAt)) return responseJson({ error: "该清单刚被其他成员更新，已为你刷新" }, 409);
      const beforeValue = item.checked;
      item.checked = Number(payload.value) ? 1 : 0;
      item.updatedAt = now;
      addAudit(state, {
        actor,
        action: "toggleChecklist",
        summary: `${item.checked ? "勾选" : "取消"}“${item.label}”`,
        undo: { kind: "checklist", id: item.id, beforeValue, afterUpdatedAt: now },
      });
    } else if (payload.action === "addExpense") {
      const amountCents = Math.round(Number(payload.amountCents));
      const description = String(payload.description ?? "").trim().slice(0, 80);
      if (!description || !Number.isInteger(amountCents) || amountCents <= 0) return responseJson({ error: "费用信息不完整" }, 400);
      const expense = {
        id: uniqueId(),
        description,
        amountCents,
        paidBy: validActor(payload.paidBy),
        participants: normalizeParticipants(payload.participants),
        createdAt: now,
        updatedAt: now,
      };
      state.expenses.unshift(expense);
      addAudit(state, {
        actor,
        action: "addExpense",
        summary: `新增费用“${description}” ¥${(amountCents / 100).toFixed(2)}`,
        undo: { kind: "expense-add", id: expense.id, afterUpdatedAt: now },
      });
    } else if (payload.action === "editExpense") {
      const index = state.expenses.findIndex((value) => value.id === Number(payload.id));
      if (index < 0) return responseJson({ error: "费用不存在" }, 404);
      const item = state.expenses[index];
      if (conflict(item, payload.expectedUpdatedAt)) return responseJson({ error: "该费用刚被其他成员更新，已为你刷新" }, 409);
      const amountCents = Math.round(Number(payload.amountCents));
      const description = String(payload.description ?? "").trim().slice(0, 80);
      if (!description || !Number.isInteger(amountCents) || amountCents <= 0) return responseJson({ error: "费用信息不完整" }, 400);
      const before = { ...item };
      state.expenses[index] = {
        ...item,
        description,
        amountCents,
        paidBy: validActor(payload.paidBy),
        participants: normalizeParticipants(payload.participants),
        updatedAt: now,
      };
      addAudit(state, {
        actor,
        action: "editExpense",
        summary: `修改费用“${description}”`,
        undo: { kind: "expense-edit", id: item.id, before, afterUpdatedAt: now },
      });
    } else if (payload.action === "deleteExpense") {
      const index = state.expenses.findIndex((value) => value.id === Number(payload.id));
      if (index < 0) return responseJson({ error: "费用不存在" }, 404);
      const item = state.expenses[index];
      if (conflict(item, payload.expectedUpdatedAt)) return responseJson({ error: "该费用刚被其他成员更新，已为你刷新" }, 409);
      state.expenses.splice(index, 1);
      addAudit(state, {
        actor,
        action: "deleteExpense",
        summary: `删除费用“${item.description}”`,
        undo: { kind: "expense-delete", id: item.id, before: item, afterUpdatedAt: now },
      });
    } else if (payload.action === "undo") {
      const result = undoAction(state, Number(payload.auditId), actor);
      if (!result.ok) return responseJson({ error: result.error }, result.status);
    } else {
      return responseJson({ error: "未知操作" }, 400);
    }

    await saveState(store, state, stateKey);
    return responseJson({ ok: true });
  } catch (error) {
    return responseJson({ error: error instanceof Error ? error.message : "服务暂时不可用" }, 500);
  }
}
