import { Account, JournalEntry } from "../models/account.model.js";

// ─── Default Chart of Accounts ───────────────────────────────────────────────
const DEFAULT_ACCOUNTS = [
  { code:"1000", name:"الأصول المتداولة",      type:"Asset",     branch:"main" },
  { code:"1001", name:"الصندوق (نقدي)",        type:"Asset",     branch:"main", parentCode:"1000" },
  { code:"1002", name:"البنك الأهلي",          type:"Asset",     branch:"main", parentCode:"1000" },
  { code:"1003", name:"البنك التجاري الدولي",  type:"Asset",     branch:"main", parentCode:"1000" },
  { code:"1010", name:"العملاء / المدينون",    type:"Asset",     branch:"main", parentCode:"1000" },
  { code:"1020", name:"مخزون",                 type:"Asset",     branch:"main", parentCode:"1000" },
  { code:"1100", name:"الأصول الثابتة",        type:"Asset",     branch:"main" },
  { code:"1101", name:"عقارات ومباني",         type:"Asset",     branch:"main", parentCode:"1100" },
  { code:"1102", name:"سيارات وآليات",         type:"Asset",     branch:"main", parentCode:"1100" },
  { code:"1103", name:"أجهزة ومعدات",         type:"Asset",     branch:"main", parentCode:"1100" },
  { code:"1104", name:"مجمع إهلاك الأصول",    type:"Asset",     branch:"main", parentCode:"1100" },
  { code:"2000", name:"الخصوم المتداولة",      type:"Liability", branch:"main" },
  { code:"2001", name:"الموردون / الدائنون",   type:"Liability", branch:"main", parentCode:"2000" },
  { code:"2002", name:"مصروفات مستحقة",       type:"Liability", branch:"main", parentCode:"2000" },
  { code:"2003", name:"ضرائب مستحقة",         type:"Liability", branch:"main", parentCode:"2000" },
  { code:"2004", name:"أمانات وتأمينات",      type:"Liability", branch:"main", parentCode:"2000" },
  { code:"2100", name:"الخصوم طويلة الأجل",   type:"Liability", branch:"main" },
  { code:"2101", name:"قروض بنكية",           type:"Liability", branch:"main", parentCode:"2100" },
  { code:"2102", name:"سندات قابلة للدفع",    type:"Liability", branch:"main", parentCode:"2100" },
  { code:"3000", name:"حقوق الملكية",         type:"Equity",    branch:"main" },
  { code:"3001", name:"رأس المال",            type:"Equity",    branch:"main", parentCode:"3000" },
  { code:"3002", name:"الأرباح المحتجزة",     type:"Equity",    branch:"main", parentCode:"3000" },
  { code:"3003", name:"احتياطي قانوني",       type:"Equity",    branch:"main", parentCode:"3000" },
  { code:"4000", name:"الإيرادات",            type:"Revenue",   branch:"main" },
  { code:"4001", name:"إيرادات مبيعات وحدات",type:"Revenue",   branch:"main", parentCode:"4000" },
  { code:"4002", name:"إيرادات إيجارات",      type:"Revenue",   branch:"main", parentCode:"4000" },
  { code:"4003", name:"إيرادات خدمات",        type:"Revenue",   branch:"main", parentCode:"4000" },
  { code:"4004", name:"عمولات مبيعات",        type:"Revenue",   branch:"main", parentCode:"4000" },
  { code:"4005", name:"إيرادات أخرى",         type:"Revenue",   branch:"main", parentCode:"4000" },
  { code:"5000", name:"المصروفات التشغيلية",  type:"Expense",   branch:"main" },
  { code:"5001", name:"رواتب وأجور",          type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5002", name:"إيجارات مدفوعة",       type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5003", name:"كهرباء وماء",          type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5004", name:"مواصلات ووقود",        type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5005", name:"صيانة وإصلاح",         type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5006", name:"دعاية وإعلان",         type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5007", name:"مستلزمات مكتبية",      type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5008", name:"اتصالات وإنترنت",      type:"Expense",   branch:"main", parentCode:"5000" },
  { code:"5100", name:"المصروفات الإدارية",   type:"Expense",   branch:"main" },
  { code:"5101", name:"مصاريف قانونية",       type:"Expense",   branch:"main", parentCode:"5100" },
  { code:"5102", name:"مصاريف محاسبية",       type:"Expense",   branch:"main", parentCode:"5100" },
  { code:"5103", name:"ضرائب ورسوم",          type:"Expense",   branch:"main", parentCode:"5100" },
  { code:"5104", name:"تأمينات",              type:"Expense",   branch:"main", parentCode:"5100" },
  { code:"5200", name:"تكلفة المبيعات",       type:"Expense",   branch:"main" },
  { code:"5201", name:"تكلفة وحدات مباعة",   type:"Expense",   branch:"main", parentCode:"5200" },
  { code:"5202", name:"تكلفة خدمات",          type:"Expense",   branch:"main", parentCode:"5200" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const canAccess = (user) => user?.role === "admin" || user?.department === "accounts" || user?.allowedPages?.includes("accounting");

const normalBalance = (type) => ["Asset","Expense"].includes(type) ? "debit" : "credit";

const genEntryNumber = async (branch) => {
  const year = new Date().getFullYear();
  const count = await JournalEntry.countDocuments({ branch, createdAt: { $gte: new Date(year, 0, 1) } });
  return `JE-${year}-${String(count + 1).padStart(4, "0")}`;
};

// ─── Accounts ────────────────────────────────────────────────────────────────
export const getAccounts = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main" } = req.query;
    const count = await Account.countDocuments({ branch });
    if (count === 0) {
      const toInsert = DEFAULT_ACCOUNTS.filter(a => a.branch === branch || branch === "main");
      await Account.insertMany(toInsert, { ordered: false }).catch(() => {});
    }
    const accounts = await Account.find({ branch }).sort("code").lean();
    const mapped = accounts.map(a => ({ Id: a._id, Code: a.code, Name: a.name, TypeAr: a.typeAr, type: a.type, ParentCode: a.parentCode, IsActive: a.isActive, Description: a.description }));
    res.json({ success: true, accounts: mapped });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const createAccount = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { Code, Name, Type, Branch = "main", ParentCode, Description } = req.body;
    if (!Code || !Name || !Type) return res.status(400).json({ success: false, message: "الكود والاسم والنوع مطلوبة" });
    const exists = await Account.findOne({ code: Code, branch: Branch });
    if (exists) return res.status(409).json({ success: false, message: "كود الحساب موجود مسبقاً" });
    const account = await Account.create({ code: Code, name: Name, type: Type, branch: Branch, parentCode: ParentCode || null, description: Description || "" });
    res.status(201).json({ success: true, account: { Id: account._id, Code: account.code, Name: account.name, TypeAr: account.typeAr } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateAccount = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { Name, Description, IsActive } = req.body;
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: "الحساب غير موجود" });
    if (Name !== undefined) account.name = Name;
    if (Description !== undefined) account.description = Description;
    if (IsActive !== undefined) account.isActive = IsActive;
    await account.save();
    res.json({ success: true, account: { Id: account._id, Code: account.code, Name: account.name } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteAccount = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const hasEntries = await JournalEntry.findOne({ "lines.accountId": req.params.id });
    if (hasEntries) return res.status(400).json({ success: false, message: "لا يمكن حذف حساب له قيود" });
    await Account.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Journal Entries ──────────────────────────────────────────────────────────
export const getJournalEntries = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main", page = 1, limit = 20, from, to, status } = req.query;
    const filter = { branch };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }
    if (status) filter.status = status;

    const total   = await JournalEntry.countDocuments(filter);
    const entries = await JournalEntry.find(filter)
      .sort("-date -_id")
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean({ virtuals: true });

    const mapped = entries.map(e => ({
      Id: e._id, EntryNumber: e.entryNumber, Date: e.date,
      Description: e.description, Reference: e.reference, Branch: e.branch,
      status: e.status, CreatedBy: e.createdBy, CreatedAt: e.createdAt, PostedAt: e.postedAt,
      totalDebit:  e.lines.reduce((s, l) => s + (l.debit || 0), 0),
      totalCredit: e.lines.reduce((s, l) => s + (l.credit || 0), 0),
      isBalanced:  Math.abs(e.lines.reduce((s, l) => s + (l.debit || 0), 0) - e.lines.reduce((s, l) => s + (l.credit || 0), 0)) < 0.001,
      lines: e.lines.map(l => ({ Id: l._id, accountId: l.accountId, accountCode: l.accountCode, accountName: l.accountName, Debit: l.debit, Credit: l.credit, Description: l.description })),
    }));
    res.json({ success: true, entries: mapped, total, page: +page, limit: +limit });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const createJournalEntry = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { Date: date, Description, Branch = "main", Reference, CreatedBy = "system", PostImmediately = false, Lines } = req.body;
    if (!Lines || Lines.length < 2) return res.status(400).json({ success: false, message: "القيد يحتاج سطرين على الأقل" });

    const totalDebit  = Lines.reduce((s, l) => s + (+l.Debit  || 0), 0);
    const totalCredit = Lines.reduce((s, l) => s + (+l.Credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001)
      return res.status(400).json({ success: false, message: `القيد غير متوازن: مدين ${totalDebit.toFixed(2)} ≠ دائن ${totalCredit.toFixed(2)}` });

    // Fetch account names
    const accountIds = Lines.map(l => l.AccountId).filter(Boolean);
    const accounts   = await Account.find({ _id: { $in: accountIds } }).lean();
    const accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a]));

    const lines = Lines.map((l, i) => {
      const acc = accountMap[l.AccountId];
      return { accountId: l.AccountId, accountCode: acc?.code || "", accountName: acc?.name || "", debit: +l.Debit || 0, credit: +l.Credit || 0, description: l.Description || "", order: i };
    });

    const entryNumber = await genEntryNumber(Branch);
    const entry = await JournalEntry.create({
      entryNumber, date: new Date(date), description: Description, reference: Reference || "",
      branch: Branch, status: PostImmediately ? "Posted" : "Draft",
      postedAt: PostImmediately ? new Date() : null,
      createdBy: req.user?.name || CreatedBy, lines,
    });
    res.status(201).json({ success: true, entry: { Id: entry._id, EntryNumber: entry.entryNumber, status: entry.status } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const postEntry = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "القيد غير موجود" });
    if (entry.status === "Posted") return res.status(400).json({ success: false, message: "القيد مرحّل بالفعل" });
    const td = entry.lines.reduce((s, l) => s + l.debit, 0);
    const tc = entry.lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(td - tc) > 0.001) return res.status(400).json({ success: false, message: `القيد غير متوازن: مدين ${td.toFixed(2)} ≠ دائن ${tc.toFixed(2)}` });
    entry.status   = "Posted";
    entry.postedAt = new Date();
    await entry.save();
    res.json({ success: true, message: "تم ترحيل القيد" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const reverseEntry = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const original = await JournalEntry.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: "القيد غير موجود" });
    if (original.status !== "Posted") return res.status(400).json({ success: false, message: "يمكن عكس القيود المرحّلة فقط" });

    const entryNumber = await genEntryNumber(original.branch);
    const reversed = await JournalEntry.create({
      entryNumber,
      date: new Date(),
      description: `عكس قيد: ${original.entryNumber} - ${original.description}`,
      branch: original.branch,
      status: "Posted",
      postedAt: new Date(),
      createdBy: req.user?.name || "system",
      reversedFromId: original._id,
      lines: original.lines.map((l, i) => ({ accountId: l.accountId, accountCode: l.accountCode, accountName: l.accountName, debit: l.credit, credit: l.debit, description: l.description, order: i })),
    });
    original.status = "Reversed";
    await original.save();
    res.json({ success: true, reversedEntry: { Id: reversed._id, EntryNumber: reversed.entryNumber } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteEntry = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false });
    if (entry.status !== "Draft") return res.status(400).json({ success: false, message: "يمكن حذف المسودات فقط" });
    await entry.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── Reports ──────────────────────────────────────────────────────────────────
const getPostedLines = async (branch, from, to, accountIds = null) => {
  const match = {
    branch,
    status: "Posted",
    ...(from || to ? { date: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } } : {}),
  };
  const entries = await JournalEntry.find(match).lean();
  return entries.flatMap(e => e.lines.filter(l => !accountIds || accountIds.includes(l.accountId?.toString())).map(l => ({ ...l, entryDate: e.date })));
};

export const getTrialBalance = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main", from, to } = req.query;
    const accounts = await Account.find({ branch, isActive: true }).sort("code").lean();
    const lines    = await getPostedLines(branch, from, to);

    const balMap = {};
    for (const l of lines) {
      const id = l.accountId?.toString();
      if (!balMap[id]) balMap[id] = { debit: 0, credit: 0 };
      balMap[id].debit  += l.debit  || 0;
      balMap[id].credit += l.credit || 0;
    }

    const result = accounts.map(a => {
      const b = balMap[a._id.toString()] || { debit: 0, credit: 0 };
      const balance = normalBalance(a.type) === "debit" ? b.debit - b.credit : b.credit - b.debit;
      return { Code: a.code, Name: a.name, Type: a.typeAr, Debit: b.debit, Credit: b.credit, Balance: balance };
    }).filter(r => r.Debit !== 0 || r.Credit !== 0);

    const totalDebit  = result.reduce((s, r) => s + r.Debit,  0);
    const totalCredit = result.reduce((s, r) => s + r.Credit, 0);
    res.json({ success: true, lines: result, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getIncomeStatement = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main", from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate   = to   ? new Date(to)   : new Date();

    const accounts = await Account.find({ branch, type: { $in: ["Revenue","Expense"] }, isActive: true }).lean();
    const lines    = await getPostedLines(branch, fromDate, toDate);

    const balMap = {};
    for (const l of lines) {
      const id = l.accountId?.toString();
      if (!balMap[id]) balMap[id] = { debit: 0, credit: 0 };
      balMap[id].debit  += l.debit  || 0;
      balMap[id].credit += l.credit || 0;
    }

    const revenues = accounts.filter(a => a.type === "Revenue").map(a => {
      const b = balMap[a._id.toString()] || { debit: 0, credit: 0 };
      return { Code: a.code, Name: a.name, Balance: b.credit - b.debit };
    }).filter(r => r.Balance !== 0);

    const expenses = accounts.filter(a => a.type === "Expense").map(a => {
      const b = balMap[a._id.toString()] || { debit: 0, credit: 0 };
      return { Code: a.code, Name: a.name, Balance: b.debit - b.credit };
    }).filter(r => r.Balance !== 0);

    const totalRevenue = revenues.reduce((s, r) => s + r.Balance, 0);
    const totalExpense = expenses.reduce((s, r) => s + r.Balance, 0);

    res.json({ success: true, statement: {
      Revenues: revenues, Expenses: expenses,
      NetIncome: totalRevenue - totalExpense,
      From: fromDate, To: toDate,
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getBalanceSheet = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main", asOf } = req.query;
    const toDate = asOf ? new Date(asOf) : new Date();

    const accounts = await Account.find({ branch, type: { $in: ["Asset","Liability","Equity"] }, isActive: true }).lean();
    const lines    = await getPostedLines(branch, null, toDate);

    const balMap = {};
    for (const l of lines) {
      const id = l.accountId?.toString();
      if (!balMap[id]) balMap[id] = { debit: 0, credit: 0 };
      balMap[id].debit  += l.debit  || 0;
      balMap[id].credit += l.credit || 0;
    }

    const mapType = (type) => accounts.filter(a => a.type === type).map(a => {
      const b = balMap[a._id.toString()] || { debit: 0, credit: 0 };
      const bal = normalBalance(type) === "debit" ? b.debit - b.credit : b.credit - b.debit;
      return { Code: a.code, Name: a.name, Balance: bal };
    }).filter(r => r.Balance !== 0);

    res.json({ success: true, sheet: {
      Assets: mapType("Asset"), Liabilities: mapType("Liability"), Equity: mapType("Equity"), AsOf: toDate,
    }});
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAccountLedger = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { from, to } = req.query;
    const account = await Account.findById(req.params.accountId).lean();
    if (!account) return res.status(404).json({ success: false });

    const lines = await getPostedLines(account.branch, from, to, [req.params.accountId]);
    lines.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));

    let balance = 0;
    const ledger = lines.map(l => {
      balance += normalBalance(account.type) === "debit" ? (l.debit - l.credit) : (l.credit - l.debit);
      return { date: l.entryDate, Debit: l.debit, Credit: l.credit, Description: l.description, balance };
    });

    res.json({ success: true, account: { Code: account.code, Name: account.name, TypeAr: account.typeAr }, lines: ledger,
      totalDebit: lines.reduce((s, l) => s + l.debit, 0), totalCredit: lines.reduce((s, l) => s + l.credit, 0), closingBalance: balance });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getDashboard = async (req, res) => {
  try {
    if (!canAccess(req.user)) return res.status(403).json({ success: false });
    const { branch = "main" } = req.query;
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, posted, draft] = await Promise.all([
      JournalEntry.countDocuments({ branch }),
      JournalEntry.countDocuments({ branch, status: "Posted" }),
      JournalEntry.countDocuments({ branch, status: "Draft" }),
    ]);

    const monthEntries = await JournalEntry.find({ branch, status: "Posted", date: { $gte: start } }).lean();
    const revAccounts  = await Account.find({ branch, type: "Revenue" }).lean().then(a => new Set(a.map(x => x._id.toString())));
    const expAccounts  = await Account.find({ branch, type: "Expense" }).lean().then(a => new Set(a.map(x => x._id.toString())));

    let monthlyRevenue = 0, monthlyExpense = 0;
    for (const e of monthEntries) {
      for (const l of e.lines) {
        const id = l.accountId?.toString();
        if (revAccounts.has(id)) monthlyRevenue += (l.credit - l.debit);
        if (expAccounts.has(id)) monthlyExpense += (l.debit - l.credit);
      }
    }

    res.json({ success: true, stats: { totalEntries: total, postedEntries: posted, draftEntries: draft, monthlyRevenue, monthlyExpense, monthlyNetIncome: monthlyRevenue - monthlyExpense } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
