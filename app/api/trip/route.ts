import { getD1 } from "../../../db";

const ROOM_CODE = "v我50";

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
] as const;

const CHECKLIST = [
  "4人身份证与驾驶证",
  "山西博物院预约",
  "云冈石窟预约",
  "悬空寺入园票与登临票",
  "租车订单与取车资料",
  "雨具、防晒、防滑运动鞋",
] as const;

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS trip_itinerary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      day INTEGER NOT NULL,
      time TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      done INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS trip_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_by TEXT NOT NULL,
      shared_by INTEGER NOT NULL DEFAULT 4,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS trip_checklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      label TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS trip_itinerary_room_idx ON trip_itinerary(room_code, day)"),
    db.prepare("CREATE INDEX IF NOT EXISTS trip_expenses_room_idx ON trip_expenses(room_code, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS trip_checklist_room_idx ON trip_checklist(room_code)"),
  ]);
}

async function seedRoom(db: D1Database) {
  const itineraryCount = await db.prepare("SELECT COUNT(*) AS count FROM trip_itinerary WHERE room_code = ?").bind(ROOM_CODE).first<{ count: number }>();
  if (!itineraryCount?.count) {
    await db.batch(
      ITINERARY.map(([day, time, title, detail]) =>
        db.prepare("INSERT INTO trip_itinerary (room_code, day, time, title, detail) VALUES (?, ?, ?, ?, ?)")
          .bind(ROOM_CODE, day, time, title, detail)
      )
    );
  }

  const checklistCount = await db.prepare("SELECT COUNT(*) AS count FROM trip_checklist WHERE room_code = ?").bind(ROOM_CODE).first<{ count: number }>();
  if (!checklistCount?.count) {
    await db.batch(
      CHECKLIST.map((label) =>
        db.prepare("INSERT INTO trip_checklist (room_code, label) VALUES (?, ?)")
          .bind(ROOM_CODE, label)
      )
    );
  }
}

function validCode(value: unknown) {
  return typeof value === "string" && value.trim().toLocaleLowerCase() === ROOM_CODE.toLocaleLowerCase();
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!validCode(code)) return Response.json({ error: "旅行口令不正确" }, { status: 403 });

  try {
    const db = getD1();
    await ensureSchema(db);
    await seedRoom(db);
    const [itinerary, expenses, checklist] = await Promise.all([
      db.prepare("SELECT id, day, time, title, detail, done FROM trip_itinerary WHERE room_code = ? ORDER BY day, time, id").bind(ROOM_CODE).all(),
      db.prepare("SELECT id, description, amount, paid_by AS paidBy, shared_by AS sharedBy, created_at AS createdAt FROM trip_expenses WHERE room_code = ? ORDER BY id DESC").bind(ROOM_CODE).all(),
      db.prepare("SELECT id, label, checked FROM trip_checklist WHERE room_code = ? ORDER BY id").bind(ROOM_CODE).all(),
    ]);
    return Response.json({
      itinerary: itinerary.results,
      expenses: expenses.results,
      checklist: checklist.results,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    if (!validCode(payload.code)) return Response.json({ error: "旅行口令不正确" }, { status: 403 });

    const db = getD1();
    await ensureSchema(db);
    await seedRoom(db);

    if (payload.action === "toggleItinerary") {
      await db.prepare("UPDATE trip_itinerary SET done = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND room_code = ?")
        .bind(Number(payload.value) ? 1 : 0, Number(payload.id), ROOM_CODE).run();
    } else if (payload.action === "toggleChecklist") {
      await db.prepare("UPDATE trip_checklist SET checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND room_code = ?")
        .bind(Number(payload.value) ? 1 : 0, Number(payload.id), ROOM_CODE).run();
    } else if (payload.action === "addExpense") {
      const amount = Number(payload.amount);
      const description = String(payload.description ?? "").trim();
      const paidBy = String(payload.paidBy ?? "").trim();
      const sharedBy = Math.max(1, Math.min(4, Number(payload.sharedBy) || 4));
      if (!description || !paidBy || !Number.isFinite(amount) || amount <= 0) {
        return Response.json({ error: "费用信息不完整" }, { status: 400 });
      }
      await db.prepare("INSERT INTO trip_expenses (room_code, description, amount, paid_by, shared_by) VALUES (?, ?, ?, ?, ?)")
        .bind(ROOM_CODE, description, amount, paidBy, sharedBy).run();
    } else {
      return Response.json({ error: "未知操作" }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}
