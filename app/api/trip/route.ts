import { getD1 } from "../../../db";

const ROOM_CODE = "public-shanxi-2026";
const MEMBERS = ["大王", "小曾", "大曾", "小陈"];

const ITINERARY = [
  [1, "11:15", "抵达太原武宿机场 T2", "09:30 成都天府机场 T2 起飞；抵达后机场取车，检查车况并拍照"],
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
  [5, "11:30", "太原市内游＋午餐", "午餐后返回酒店取行李，预留充足时间前往机场"],
  [5, "16:30", "机场还车与值机", "19:35 太原武宿机场 T2 起飞；21:55 抵达成都天府机场 T2"],
] as const;

const CHECKLIST = [
  "4人身份证与驾驶证",
  "山西博物院预约",
  "云冈石窟预约",
  "悬空寺入园票与登临票",
  "租车订单与取车资料",
  "雨具、防晒、防滑运动鞋",
] as const;

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
  { id: 34, day: 2, time: "17:30备", title: "枫林逸景紫御府烧烤摊（晚餐备选）", detail: "地址：枫林逸景紫御府小区右边摆摊；仅有地址信息，出发前确认摊位是否营业", reviewUrl: "https://www.amap.com/search?query=%E6%9E%AB%E6%9E%97%E9%80%B8%E6%99%AF%E7%B4%AB%E5%BE%A1%E5%BA%9C&city=%E5%A4%A7%E5%90%8C" },
  { id: 24, day: 3, time: "12:30", title: "红旗瑞丰楼·北魏家宴（午餐主选）", detail: "返城后在清远街用餐；饭后从附近华严寺开始古城游", reviewUrl: "https://www.dianping.com/shop/jR1yAJB7FNYJ95pE" },
  { id: 25, day: 3, time: "12:30备", title: "凯鸽·云冈石窟店（午餐备选）", detail: "云冈游览结束就近用餐，时间紧时最省路", reviewUrl: "https://www.dianping.com/shop/l20iC9dhpy1Kkn9C" },
  { id: 26, day: 3, time: "12:30备", title: "紫泥369·四牌楼店（午餐备选）", detail: "回到古城后用餐；热门时段建议先取号", reviewUrl: "https://www.dianping.com/shop/77277092" },
  { id: 27, day: 3, time: "18:30", title: "弘雅饭店（晚餐主选）", detail: "古城深度游结束后用餐，优先提前确认桌位", reviewUrl: "https://www.dianping.com/shop/2120494" },
  { id: 28, day: 3, time: "18:30备", title: "花园大饭店（晚餐备选）", detail: "鼓楼、永泰街附近收尾时顺路", reviewUrl: "https://www.dianping.com/shop/EZgfZLvc4J1aqt1K" },
  { id: 29, day: 3, time: "18:30备", title: "紫泥369·四牌楼店（晚餐备选）", detail: "位于古城中心，建议下午游览时先取号", reviewUrl: "https://www.dianping.com/shop/77277092" },
  { id: 33, day: 3, time: "18:30备", title: "鼓楼东街老火锅（晚餐备选）", detail: "位于大同古城鼓楼东街；D3古城深度游结束后可选，建议提前确认排队与营业状态", reviewUrl: "https://www.dianping.com/shop/G4nreJkjBkvZ7fPq" },
  { id: 30, day: 4, time: "11:30", title: "张三凉粉（浑源加餐）", detail: "悬空寺后进浑源县城，少量尝鲜；出发前确认门店位置与营业状态", reviewUrl: "https://www.amap.com/search?query=%E5%BC%A0%E4%B8%89%E5%87%89%E7%B2%89&city=%E6%B5%91%E6%BA%90%E5%8E%BF" },
  { id: 31, day: 4, time: "12:00", title: "鸿福酒楼·恒山南路山门店（午餐主选）", detail: "恒山南路56号（岳麓家园对面）；适合4人正式午餐，饭后前往应县木塔", reviewUrl: "https://gs.ctrip.com/html5/you/foods/fooddetail/3026/8321177.html" },
  { id: 32, day: 4, time: "12:00备", title: "大霞凉粉（午餐备选）", detail: "浑源本地老字号；最新门店信息不完整，出发前在地图确认营业状态", reviewUrl: "https://www.amap.com/search?query=%E5%A4%A7%E9%9C%9E%E5%87%89%E7%B2%89&city=%E6%B5%91%E6%BA%90%E5%8E%BF" },
  { id: 35, day: 4, time: "19:00", title: "老院子·钟楼街店（晚餐主选）", detail: "回到太原入住后，适合4人吃晋菜正餐；建议提前确认停车与排队", reviewUrl: "https://www.amap.com/search?query=%E8%80%81%E9%99%A2%E5%AD%90%E9%92%9F%E6%A5%BC%E8%A1%97%E5%BA%97&city=%E5%A4%AA%E5%8E%9F" },
  { id: 36, day: 4, time: "19:00备", title: "老太原菜馆·钟楼街店（晚餐备选）", detail: "钟楼街步行街1号；若主选排队较久，可改吃经典晋菜", reviewUrl: "https://www.dianping.com/shop/l45LUzCIO2sjR4rC" },
  { id: 37, day: 4, time: "19:00备", title: "清和元·铜锣湾店（晚餐备选）", detail: "可点羊肉烧卖、醋椒羊肉、丸子汤；出发前确认当日营业状态", reviewUrl: "https://www.dianping.com/shop/FGx9u6Js6mUgnn1x/photos?pg=40" },
  { id: 38, day: 5, time: "08:00", title: "清和元（头脑早餐主选）", detail: "头脑＋羊肉烧卖；早餐档更合适，建议提前确认门店与供应时间", reviewUrl: "https://www.dianping.com/shop/FGx9u6Js6mUgnn1x/photos?pg=40" },
  { id: 39, day: 5, time: "08:00备", title: "郝刚刚羊杂割·柳巷店（早餐备选）", detail: "柳巷83号；羊杂汤、羊肉汤、油酥饼，公开信息早餐约6:00开始", reviewUrl: "https://www.amap.com/place/B015F037D5" },
  { id: 40, day: 5, time: "08:00备", title: "六味斋·柳巷店（早餐备选）", detail: "柳巷南路134号；丸子汤、老豆腐、油条、酱肉饼，适合快速解决早餐", reviewUrl: "https://www.dianping.com/shop/17787900/photos/album" },
  { id: 41, day: 5, time: "11:30", title: "认一力·桥头街店（午餐主选）", detail: "羊肉蒸饺、牛肉蒸饺；点餐相对快捷，午餐后返回酒店取行李", reviewUrl: "https://jp.trip.com/restaurant/china/taiyuan/detail/ren-yili-fanzhuang-30937773/" },
  { id: 42, day: 5, time: "11:30备", title: "老太原菜馆·钟楼街店（午餐备选）", detail: "若前一晚未选择，可安排晋菜正餐；午餐后尽快前往酒店与机场", reviewUrl: "https://www.dianping.com/shop/l45LUzCIO2sjR4rC" },
  { id: 43, day: 5, time: "11:30备", title: "老院子·钟楼街店（午餐备选）", detail: "适合4人点菜；如早餐吃得较晚，可在午餐时段改选", reviewUrl: "https://www.amap.com/search?query=%E8%80%81%E9%99%A2%E5%AD%90%E9%92%9F%E6%A5%BC%E8%A1%97%E5%BA%97&city=%E5%A4%AA%E5%8E%9F" },
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
      review_url TEXT,
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
  try {
    await db.prepare("ALTER TABLE trip_itinerary ADD COLUMN review_url TEXT").run();
  } catch {
    // Existing databases already have the column after the first upgrade.
  }
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

  await db.batch(
    FOOD_ITEMS.map((item) =>
      db.prepare(`INSERT INTO trip_itinerary (id, room_code, day, time, title, detail, review_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET day = excluded.day, time = excluded.time, title = excluded.title,
          detail = excluded.detail, review_url = excluded.review_url
        WHERE trip_itinerary.room_code = excluded.room_code`)
        .bind(item.id, ROOM_CODE, item.day, item.time, item.title, item.detail, item.reviewUrl)
    )
  );

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

export async function GET(request: Request) {
  void request;

  try {
    const db = getD1();
    await ensureSchema(db);
    await seedRoom(db);
    const [itinerary, expenses, checklist] = await Promise.all([
      db.prepare("SELECT id, day, time, title, detail, review_url AS reviewUrl, done, updated_at AS updatedAt FROM trip_itinerary WHERE room_code = ? ORDER BY day, time, id").bind(ROOM_CODE).all(),
      db.prepare("SELECT id, description, amount, paid_by AS paidBy, shared_by AS sharedBy, created_at AS createdAt FROM trip_expenses WHERE room_code = ? ORDER BY id DESC").bind(ROOM_CODE).all(),
      db.prepare("SELECT id, label, checked, updated_at AS updatedAt FROM trip_checklist WHERE room_code = ? ORDER BY id").bind(ROOM_CODE).all(),
    ]);
    return Response.json({
      itinerary: itinerary.results,
      expenses: expenses.results.map((item: Record<string, unknown>) => ({
        id: item.id,
        description: item.description,
        amountCents: Math.round(Number(item.amount) * 100),
        paidBy: item.paidBy,
        participants: MEMBERS.slice(0, Number(item.sharedBy) || 4),
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      })),
      checklist: checklist.results,
      audit: [],
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
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
      const amount = Number(payload.amountCents) / 100;
      const description = String(payload.description ?? "").trim();
      const paidBy = String(payload.paidBy ?? "").trim();
      const sharedBy = Math.max(1, Math.min(4, Number(payload.sharedBy) || 4));
      if (!description || !paidBy || !Number.isFinite(amount) || amount <= 0) {
        return Response.json({ error: "费用信息不完整" }, { status: 400 });
      }
      await db.prepare("INSERT INTO trip_expenses (room_code, description, amount, paid_by, shared_by) VALUES (?, ?, ?, ?, ?)")
        .bind(ROOM_CODE, description, amount, paidBy, sharedBy).run();
    } else if (payload.action === "editExpense") {
      const amount = Number(payload.amountCents) / 100;
      const description = String(payload.description ?? "").trim();
      const paidBy = String(payload.paidBy ?? "").trim();
      const sharedBy = Array.isArray(payload.participants) ? payload.participants.length : 4;
      if (!description || !paidBy || !Number.isFinite(amount) || amount <= 0) {
        return Response.json({ error: "费用信息不完整" }, { status: 400 });
      }
      await db.prepare("UPDATE trip_expenses SET description = ?, amount = ?, paid_by = ?, shared_by = ? WHERE id = ? AND room_code = ?")
        .bind(description, amount, paidBy, sharedBy, Number(payload.id), ROOM_CODE).run();
    } else if (payload.action === "deleteExpense") {
      await db.prepare("DELETE FROM trip_expenses WHERE id = ? AND room_code = ?")
        .bind(Number(payload.id), ROOM_CODE).run();
    } else {
      return Response.json({ error: "未知操作" }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}
