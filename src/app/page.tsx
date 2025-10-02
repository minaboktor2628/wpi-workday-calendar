import Link from "next/link";
import { TutorialSection } from "@/components/tutorial";
import { UploadForm } from "@/components/upload-form";

export default function Home() {
  return (
    <div className="prose dark:prose-invert flex flex-col">
      <h1 className="mb-0">WPI Workday To Outlook Calendar Converter</h1>
      <p>
        Turn your Workday's registered courses an uploadable <code>.ics</code>{" "}
        file. This file format is compatible with <b>Outlook</b>,{" "}
        <b>Google Calendar</b> and <b>Apple Calendar</b>. Not sure how this
        works?{" "}
        <Link href="#tutorial" className=" items-center transition-all inline">
          <i>Go to the tutorial</i>
        </Link>
      </p>
      <UploadForm />
      <TutorialSection />
    </div>
  );
}
