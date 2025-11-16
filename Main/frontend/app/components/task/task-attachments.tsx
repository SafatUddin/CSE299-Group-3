import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { Attachment } from "@/types";
import { 
  File, 
  Link as LinkIcon, 
  Paperclip, 
  Upload, 
  X, 
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Download,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { 
  useUploadAttachmentMutation, 
  useAddLinkAttachmentMutation, 
  useDeleteAttachmentMutation 
} from "@/hooks/use-task";

interface TaskAttachmentsProps {
  attachments: Attachment[];
  taskId: string;
}

export const TaskAttachments = ({ attachments, taskId }: TaskAttachmentsProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);

  const uploadAttachment = useUploadAttachmentMutation();
  const addLinkAttachment = useAddLinkAttachmentMutation();
  const deleteAttachment = useDeleteAttachmentMutation();

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="size-8 text-gray-500" />;
    
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="size-8 text-blue-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="size-8 text-purple-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="size-8 text-pink-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="size-8 text-red-500" />;
    } else if (fileType.includes("zip") || fileType.includes("rar")) {
      return <Archive className="size-8 text-orange-500" />;
    } else {
      return <File className="size-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      await uploadAttachment.mutateAsync({ taskId, file });
      toast.success("File uploaded successfully");
      // Reset the input
      event.target.value = "";
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(linkUrl.trim());
    } catch {
      toast.error("Please enter a valid URL (include http:// or https://)");
      return;
    }

    try {
      const linkData = {
        taskId,
        name: linkName.trim() || linkUrl.trim(),
        url: linkUrl.trim(),
      };
      console.log("Adding link:", linkData);
      
      await addLinkAttachment.mutateAsync(linkData);
      toast.success("Link added successfully");
      setLinkUrl("");
      setLinkName("");
      setIsAddingLink(false);
    } catch (error: any) {
      console.error("Add link error:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to add link";
      toast.error(errorMessage);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync({ taskId, attachmentId });
      toast.success("Attachment deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete attachment");
    }
  };

  const isLink = (attachment: Attachment) => {
    return attachment.fileType === "link" || attachment.fileUrl.startsWith("http://") || attachment.fileUrl.startsWith("https://");
  };

  const getAttachmentUrl = (attachment: Attachment) => {
    if (isLink(attachment)) {
      return attachment.fileUrl;
    }
    // For uploaded files, prepend the API URL
    const API_URL = import.meta.env.VITE_API_URL;
    return `${API_URL}${attachment.fileUrl}`;
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Paperclip className="size-4" />
            Attachments
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {attachments.length} {attachments.length === 1 ? "file" : "files"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="group flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-all"
                  >
                    <div className="flex-shrink-0">
                      {isLink(attachment) ? (
                        <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <LinkIcon className="size-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      ) : (
                        <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getFileIcon(attachment.fileType)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {attachment.fileSize && (
                          <span>{formatFileSize(attachment.fileSize)}</span>
                        )}
                        {attachment.uploadedAt && (
                          <>
                            {attachment.fileSize && <span>•</span>}
                            <span>
                              {formatDistanceToNow(new Date(attachment.uploadedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(getAttachmentUrl(attachment), "_blank")}
                      >
                        {isLink(attachment) ? (
                          <ExternalLink className="size-4" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveAttachment(attachment._id)}
                        disabled={deleteAttachment.isPending}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Paperclip className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No attachments yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload files or add links to get started
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4 mt-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File</label>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="size-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Any file type (Max 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadAttachment.isPending}
                  />
                </label>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Add Link */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Add Link</label>
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={addLinkAttachment.isPending}
                />
                <Input
                  placeholder="Enter link name (optional)"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  disabled={addLinkAttachment.isPending}
                />
                <Button 
                  onClick={handleAddLink} 
                  className="w-full"
                  disabled={!linkUrl.trim() || addLinkAttachment.isPending}
                >
                  <LinkIcon className="size-4 mr-2" />
                  {addLinkAttachment.isPending ? "Adding..." : "Add Link"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
