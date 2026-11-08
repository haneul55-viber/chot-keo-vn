import { Suspense } from "react";
import { TripInviteClient } from "./TripInviteClient";

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default function TripInvitePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f2] dark:bg-[#080e1a] flex flex-col items-center justify-center p-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Đang tải thông tin chuyến đi...
          </p>
        </div>
      }
    >
      <AsyncInvitePage params={params} />
    </Suspense>
  );
}

async function AsyncInvitePage({ params }: PageProps) {
  const { inviteCode } = await params;
  return <TripInviteClient inviteCode={inviteCode} />;
}
