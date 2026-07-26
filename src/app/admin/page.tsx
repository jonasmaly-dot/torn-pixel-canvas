import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function Admin() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/canvas");
  const [users, pixels, orders, transactions] = await Promise.all([db.user.count(), db.pixel.count({ where: { state: "OWNED" } }), db.order.count({ where: { status: "AWAITING_PAYMENT" } }), db.transaction.count()]);
  return <main className="app-shell"><header className="app-header"><div><p>COMMUNITY PIXEL ART</p><h1>ADMIN CONSOLE</h1></div><a href="/canvas">Back to canvas</a></header><div className="admin-grid">{[["Players", users], ["Claimed pixels", pixels], ["Open payment batches", orders], ["Incoming transactions", transactions]].map(([label, value]) => <section className="panel admin-stat" key={String(label)}><p>{label}</p><strong>{value}</strong></section>)}</div><section className="panel admin-note"><h2>Payment monitoring</h2><p>The payment worker checks valid incoming transfers every minute. Before a live launch, verify the incoming-item log adapter with a real test transfer.</p></section></main>;
}
