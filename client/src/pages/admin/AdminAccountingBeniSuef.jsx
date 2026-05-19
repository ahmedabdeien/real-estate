/**
 * صفحة حسابات فرع بني سويف
 * نفس صفحة الحسابات الرئيسية لكن مخصصة لفرع بني سويف
 */
import AdminAccounting from "./AdminAccounting";

export default function AdminAccountingBeniSuef() {
  return <AdminAccounting branch="بني سويف" branchLabel="فرع بني سويف" />;
}
