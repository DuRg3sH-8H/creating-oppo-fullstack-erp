import { MessagesPage } from "@/components/messages/messages-page"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function MessagesDashboardPage() {
  return (
    <AuthGuard allowedRoles={["super-admin", "school", "eca"]}>
      <MessagesPage />
    </AuthGuard>
  )
}
