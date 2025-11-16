import type { User } from "@/types";

export const Watchers = ({ watchers }: { watchers: User[] }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
      <h3 className="text-lg font-medium mb-4">Watchers</h3>

      <div className="space-y-2">
        {watchers && watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher._id} className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-xs">
                {watcher.name.charAt(0).toUpperCase()}
              </div>

              <p className="text-sm text-muted-foreground">{watcher.name}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No watchers</p>
        )}
      </div>
    </div>
  );
};