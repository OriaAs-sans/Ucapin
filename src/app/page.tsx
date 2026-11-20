import { redirect } from "next/navigation";
import {
  getDashboardData,
  getSessionCookieValue,
} from "@/server/repositories/ucapin-repository";
import { DashboardWorkspace } from "@/features/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieVal = await getSessionCookieValue();
  if (!cookieVal) {
    redirect("/masuk");
  }

  const data = await getDashboardData();
  if (!data.user.onboardingCompleted) {
    redirect("/mulai");
  }

  return (
    <DashboardWorkspace
      user={data.user}
      mistakes={data.mistakes}
      weeklyActivities={data.weeklyActivities}
      league={data.league}
      drillSentenceCount={data.drillSentenceCount}
      scenarioCount={data.scenarioCount}
      completedSessionCount={data.completedSessionCount}
      activeScenario={data.activeScenario}
    />
  );
}
