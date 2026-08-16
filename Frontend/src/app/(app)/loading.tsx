import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function AppLoading() {
  return (
    <div className="flex-1 w-full h-full min-h-[70vh] flex items-center justify-center">
      <LoadingScreen fullScreen={false} message="Loading workspace" subtext="Fetching clinical data..." />
    </div>
  );
}
