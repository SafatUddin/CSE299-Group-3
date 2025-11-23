import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateTaskDueDateMutation } from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TaskDueDateSelectorProps {
  dueDate: Date | string | null | undefined;
  taskId: string;
}

export const TaskDueDateSelector = ({
  dueDate,
  taskId,
}: TaskDueDateSelectorProps) => {
  const [date, setDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );
  const [open, setOpen] = useState(false);

  const { mutate: updateDueDate, isPending } = useUpdateTaskDueDateMutation();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    updateDueDate(
      {
        taskId,
        dueDate: selectedDate ? selectedDate.toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success(
            selectedDate ? "Due date updated" : "Due date removed"
          );
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to update due date");
          // Revert on error
          setDate(dueDate ? new Date(dueDate) : undefined);
        },
      }
    );
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDateSelect(undefined);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium text-muted-foreground min-w-20">
        Due Date:
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={isPending}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
            {date && (
              <X
                className="ml-auto h-4 w-4 hover:bg-destructive/10 rounded-sm"
                onClick={handleClearDate}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
