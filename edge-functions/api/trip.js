import { getStore } from "@edgeone/pages-blob";

const ROOM_CODE = "v我50";
const STORE_NAME = "shanxi-trip-state";

const ITINERARY = [
  [1, "12:00", "抵达太原机场", "机场取车，检查车况并拍照"],
  [1, "14:00", "晋祠", "建议游览 2.5—3 小时"],
  [1, "18:30", "钟楼街觅食", "过油肉、灌肠、莜面、羊杂割"],
  [2, "09:00", "山西博物院", "提前预约，预留 3 小时"],
  [2, "13:30", "自驾前往大同", "约 280km / 3.5—4 小时"],
  [2, "18:00", "大同古城夜游", "华严广场与城墙夜景"],
  [3, "08:00", "云冈石窟", "重点参观昙曜五窟"],
  [3, "14:00", "大同古城深度游", "华严寺、善化寺、九龙壁"],
  [4, "09:00", "悬空寺", "登临票限流，穿防滑鞋"],
  [4, "13:30", "应县木塔", "15:00 左右启程返回太原"],
  [4, "18:30", "抵达太原", "入住带停车场的酒店"],
  [5, "08:30", "双塔寺", "随后前往柳巷、钟楼街"],
  [5, "11:30", "晋菜午餐", "13:00—13:30 出发去机场"],
  [5, "14:00", "机场还车", "验车、值机，16:00 返程"],
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

function validCode(value) {
  return typeof value === "string" && value.trim().toLocaleLowerCase() === ROOM_CODE.toLocaleLowerCase();
}

function roomPrefix() {
  return `rooms/${ROOM_CODE}`;
}

function itineraryKey(id) {
  return `${roomPrefix()}/itinerary/${id}.json`;
}

function checklistKey(id) {
  return `${roomPrefix()}/checklist/${id}.json`;
}

function expenseKey(id) {
  return `${roomPrefix()}/expenses/${id}.json`;
}

async function ensureSeeded(store) {
  await Promise.all([
    ...ITINERARY.map(([day, time, title, detail], index) =>
      store.setJSON(
        itineraryKey(index + 1),
        {
          id: index + 1,
          day,
          time,
          title,
          detail,
          done: 0,
          updatedAt: new Date(0).toISOString(),
        },
        { onlyIfNew: true },
      ),
    ),
    ...CHECKLIST.map((label, index) =>
      store.setJSON(
        checklistKey(index + 1),
        {
          id: index + 1,
          label,
          checked: 0,
          updatedAt: new Date(0).toISOString(),
        },
        { onlyIfNew: true },
      ),
    ),
  ]);
}

async function readPrefix(store, prefix) {
  const { blobs } = await store.list({ prefix, consistency: "strong" });
  const values = await Promise.all(
    blobs.map(({ key }) =>
      store.get(key, { type: "json", consistency: "strong" }),
    ),
  );
  return values.filter(Boolean);
}

async function loadState(store) {
  await ensureSeeded(store);
  const [itinerary, expenses, checklist] = await Promise.all([
    readPrefix(store, `${roomPrefix()}/itinerary/`),
    readPrefix(store, `${roomPrefix()}/expenses/`),
    readPrefix(store, `${roomPrefix()}/checklist/`),
  ]);

  itinerary.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time) || a.id - b.id);
  expenses.sort((a, b) => b.id - a.id);
  checklist.sort((a, b) => a.id - b.id);

  return { itinerary, expenses, checklist };
}

export async function onRequest({ request }) {
  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  try {
    if (request.method === "GET") {
      const code = new URL(request.url).searchParams.get("code");
      if (!validCode(code)) return responseJson({ error: "旅行口令不正确" }, 403);
      return responseJson(await loadState(store));
    }

    if (request.method !== "POST") {
      return responseJson({ error: "请求方式不支持" }, 405);
    }

    const payload = await request.json();
    if (!validCode(payload.code)) {
      return responseJson({ error: "旅行口令不正确" }, 403);
    }
    await ensureSeeded(store);

    if (payload.action === "toggleItinerary") {
      const id = Number(payload.id);
      const key = itineraryKey(id);
      const item = await store.get(key, { type: "json", consistency: "strong" });
      if (!item) return responseJson({ error: "行程不存在" }, 404);
      await store.setJSON(key, {
        ...item,
        done: Number(payload.value) ? 1 : 0,
        updatedAt: new Date().toISOString(),
      });
    } else if (payload.action === "toggleChecklist") {
      const id = Number(payload.id);
      const key = checklistKey(id);
      const item = await store.get(key, { type: "json", consistency: "strong" });
      if (!item) return responseJson({ error: "清单项不存在" }, 404);
      await store.setJSON(key, {
        ...item,
        checked: Number(payload.value) ? 1 : 0,
        updatedAt: new Date().toISOString(),
      });
    } else if (payload.action === "addExpense") {
      const amount = Number(payload.amount);
      const description = String(payload.description ?? "").trim();
      const paidBy = String(payload.paidBy ?? "").trim();
      const sharedBy = Math.max(1, Math.min(4, Number(payload.sharedBy) || 4));
      if (!description || !paidBy || !Number.isFinite(amount) || amount <= 0) {
        return responseJson({ error: "费用信息不完整" }, 400);
      }
      const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
      await store.setJSON(expenseKey(id), {
        id,
        description,
        amount,
        paidBy,
        sharedBy,
        createdAt: new Date().toISOString(),
      });
    } else {
      return responseJson({ error: "未知操作" }, 400);
    }

    return responseJson({ ok: true });
  } catch (error) {
    return responseJson(
      { error: error instanceof Error ? error.message : "服务暂时不可用" },
      500,
    );
  }
}
