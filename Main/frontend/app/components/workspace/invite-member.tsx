import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { Label } from "../ui/label";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/workspace-invite/${workspaceId}`
    );
    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Share this link to invite people</Label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${window.location.origin}/workspace-invite/${workspaceId}`}
              />
              <Button onClick={handleCopyInviteLink}>
                {linkCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with the link can join this workspace
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};