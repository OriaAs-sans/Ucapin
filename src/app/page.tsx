import { getDashboardData } from "@/server/repositories/ucapin-repository";
import { DashboardWorkspace } from "@/features/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  return (
    <DashboardWorkspace
      user={data.user}
      mistakes={data.mistakes}
      weeklyActivities={data.weeklyActivities}
      league={data.league}
      activeScenario={data.activeScenario}
    />
  );
}
