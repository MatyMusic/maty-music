import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth-config";

export default async function Page() {
  const session = await getServerSession(authConfig);
  if (session) redirect("/");   // מחובר → בית
  redirect("/?auth=1");         // אורח → פותח Splash
}
