import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "@/components/login-form";

export default async function Home() {
  if (await getSession()) redirect("/canvas");
  return <main className="landing"><section><p className="landing-kicker">TORN CITY COMMUNITY PROJECT</p><h1>COMMUNITY<br />PIXEL ART</h1><p className="landing-copy">A permanent 10.000 × 10.000 Torn pixel art. Claim a place, choose a colour, leave your mark.</p></section><LoginForm /></main>;
}
