"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  convertExcelRowsToEvents,
  downloadICalFile,
  excelCalendarSchema,
} from "@/lib/parse";
import z from "zod";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UploadForm() {
  const [files, setFiles] = useState<File[] | undefined>();
  const [loading, setLoading] = useState(false);

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const file = files?.[0];

      if (!file) {
        toast.error("No files.");
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, {
        blankrows: false,
        raw: true,
        defval: null,
      });

      const { data: excelRows, error } = z
        .array(excelCalendarSchema)
        .safeParse(json);

      if (error) throw new Error(error.message);

      const events = await convertExcelRowsToEvents(excelRows);
      downloadICalFile(events);
      console.log(events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col space-y-4" id="form">
      <Dropzone
        accept={{
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.ms-excel": [".xls"],
        }}
        maxFiles={1}
        onDrop={handleDrop}
        onError={(err) => toast.error(err.message)}
        src={files}
      >
        <DropzoneEmptyState>
          <div className={"flex flex-col items-center justify-center"}>
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <UploadIcon size={16} />
            </div>
            <p className="my-2 w-full truncate text-wrap font-medium text-sm">
              Upload a file
            </p>
            <p className="w-full truncate text-wrap text-muted-foreground text-xs">
              Drag and drop or click to upload
            </p>
            <p className="text-wrap text-muted-foreground text-xs">
              Accepts Excel files only.
            </p>
          </div>
        </DropzoneEmptyState>
        <DropzoneContent />
      </Dropzone>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              className="w-full cursor-pointer"
              onClick={handleSubmit}
              disabled={!files || !files.length || loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {!files || !files.length ? (
            <p>Must upload a file to submit.</p>
          ) : (
            <p>Get calendar file</p>
          )}
        </TooltipContent>
      </Tooltip>
    </section>
  );
}
