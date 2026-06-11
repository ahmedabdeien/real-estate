const cron     = require('node-cron');
const Contract = require('../models/Contract');
const Invoice  = require('../models/Invoice');
const Notification = require('../models/Notification');
const User     = require('../models/User');

async function notifyCompanyAdmins(companyId, title, body, link) {
  const admins = await User.find({ companyId, isActive: true }).select('_id').lean();
  const docs = admins.map(u => ({
    companyId, userId: u._id, type: 'warning', title, body, link, isSystem: true,
  }));
  if (docs.length) await Notification.insertMany(docs, { ordered: false }).catch(() => {});
}

async function markOverdueInstallments() {
  const now = new Date();
  const contracts = await Contract.find({
    'installments.status': { $in: ['pending', 'partial'] },
    'installments.dueDate': { $lt: now },
  }).populate('customerId', 'name').lean();

  let marked = 0;
  for (const contract of contracts) {
    let changed = false;
    for (const inst of contract.installments) {
      if (['pending', 'partial'].includes(inst.status) && new Date(inst.dueDate) < now) {
        await Contract.updateOne(
          { _id: contract._id, 'installments._id': inst._id },
          { $set: { 'installments.$.status': 'overdue' } }
        );
        changed = true;
        marked++;
      }
    }
    if (changed && contract.companyId) {
      await notifyCompanyAdmins(
        contract.companyId,
        'قسط متأخر',
        `العميل ${contract.customerId?.name || 'غير معروف'} — قسط متأخر على العقد ${contract.contractNumber}`,
        '/installments'
      );
    }
  }
  if (marked) console.log(`[OverdueJob] Marked ${marked} installments as overdue.`);
}

async function markOverdueInvoices() {
  const now = new Date();
  const result = await Invoice.updateMany(
    { status: { $in: ['sent', 'partial'] }, dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
  if (result.modifiedCount) {
    console.log(`[OverdueJob] Marked ${result.modifiedCount} invoices as overdue.`);
  }
}

function startJobs() {
  cron.schedule('0 1 * * *', async () => {
    try {
      await markOverdueInstallments();
      await markOverdueInvoices();
    } catch (err) {
      console.error('[OverdueJob] Error:', err.message);
    }
  });
  console.log('[Jobs] Overdue checker scheduled (daily 01:00)');
}

module.exports = { startJobs, markOverdueInstallments, markOverdueInvoices };
