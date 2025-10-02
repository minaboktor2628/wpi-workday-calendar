import Link from "next/link";
import { UploadForm } from "@/components/upload-form";
import { TutorialSection } from "@/components/tutorial";

export default function Home() {
  return (
    <div className="prose dark:prose-invert flex flex-col">
      <h1 className="mb-0">WPI Workday To Calendar Converter</h1>
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
      <p>
        <b>TIP:</b> make a new calendar just for using this app. See this{" "}
        <Link href="#protip">later section</Link> for more detail.
      </p>
      <TutorialSection />
    </div>
  );
}
