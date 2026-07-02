import { redirect } from "next/navigation"

export default function LegacySmsOutboundRedirect() {
  redirect("/dashboard/sms-outbound")
}
