import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function TutorialSection() {
  return (
    <article className="prose dark:prose-invert py-4 pt-8" id="tutorial">
      <h2>Tutorial</h2>
      <p>This section will go over how to use this tool.</p>
      <p>
        <i>
          <b>Disclaimer:</b> This tool does not take holidays, wellness days, or
          "Follow Monday Schedule" edge cases into consideration. You will still
          have to adjust those manually in your calendar if you wish.
        </i>
      </p>
      <section id="step:1">
        <h3>Step 1: Exporting your registered courses from Workday</h3>
        <p>
          First, log into{" "}
          <a
            href="https://wd5.myworkday.com/wday/authgwy/wpi/login-saml2.htmld"
            rel="noopener noreferrer"
            target="_blank"
          >
            Workday
          </a>{" "}
          And then go to the <b>Academics</b> app. Press on the{" "}
          <Settings className="size-4 inline" />
          <span className="sr-only">gear</span> icon and click on{" "}
          <b>Download to Excel</b> {"->"} <b>Download</b>.
          <Image
            src="/tutorial/download-excel.png"
            alt="Picture of 'Download to Excel' button in Workday"
            className="border"
            width={1080}
            height={1080}
          />
          <Image
            src="/tutorial/press-download.png"
            alt="Picture of 'Download' export button in Workday"
            className="border"
            width={1080}
            height={1080}
          />
          Your exported Excel sheet should look something like this:
          <Image
            src="/tutorial/example-sheet.png"
            alt="Example exported Excel file"
            className="border"
            width={1080}
            height={1080}
          />
        </p>
      </section>
      <section id="step:2">
        <h3>Step 2: Upload the Excel file to this tool</h3>
        <p>
          Now that you have the Excel file, you can drag and drop the file to{" "}
          <Link href="#">the form above</Link>
          <Image
            src="/tutorial/upload-excel.png"
            alt="Picure of the upload form at the top of this website"
            className="border"
            width={1080}
            height={1080}
          />
          After submitting, it should automatically download a <code>.ics</code>{" "}
          file for you.
        </p>
      </section>
      <section id="step:3">
        <h3>
          Step 3: Uploading <code>.ics</code> to Outlook
        </h3>
        <p>
          While this file format is supported by many calendar app, this
          tutorial will only cover using Outlook. First,{" "}
          <a
            href="https://outlook.office.com/calendar"
            rel="noopener noreferrer"
            target="_blank"
          >
            go to Outlook calendar
          </a>{" "}
          and press the <b>Add calendar</b> button. You can also instead{" "}
          <a
            href="https://outlook.office.com/calendar/addcalendar"
            rel="noopener noreferrer"
            target="_blank"
          >
            visit the add calendar page
          </a>
          .
          <Image
            src="/tutorial/outlook-calendar.png"
            alt="Outlook calander page with 'Add calendar' button highlighted"
            className="border"
            width={1080}
            height={1080}
          />
          Then, click on <b>Upload from file</b> and upload your{" "}
          <code>.ics</code> file. Select your calendar and press <b>Import</b>,
          and that's it!
          <Image
            src="/tutorial/upload-ics.png"
            alt="Uploading an ical file to outlook"
            className="border"
            width={1080}
            height={1080}
          />
        </p>
      </section>
      <section>
        <p>
          Now, you should get 15 minute reminder before events, have categorized
          events, and have event locations set!
        </p>
        <p id="protip">
          <b>PRO TIP: </b> create a new calendar that you use to upload your
          classes. You can do so by pressing <b>Create blank calendar</b> on the{" "}
          <b>Add calendar</b> menu. That way, if you frequently switch courses,
          or would like to just toggle off all registered courses, you can just
          delete only that calendar.
        </p>
        <p>Enjoy!</p>
      </section>
    </article>
  );
}
