import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth-config";

export default async function Page() {
  const session = await getServerSession(authConfig);
  if (session) redirect("/");
  redirect("/?auth=1");
}
