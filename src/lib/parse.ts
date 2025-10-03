import z from "zod";
import ics, { EventAttributes } from "ics";

/**
 * @example
 * Academic Period	Course Section Definition	Instructional Format	Meeting Patterns	Locations	Instructors	Delivery Mode
 * 2025 Fall A Term	EN 2219-A01 - Creative Writing: Poetry	Lecture	M-R | 1:00 PM - 2:50 PM	Stratton Hall 205	Joseph Aguilar	In-Person
 * 2025 Fall A Term	CS 4516-A01 - Advanced Computer Networks	Lecture	M-R | 3:00 PM - 4:50 PM	Salisbury Labs 305	Jun Dai	In-Person
 */
export const excelCalendarSchema = z.object({
  "Academic Period": z.string(),
  "Course Section Definition": z.string(),
  "Instructional Format": z.string(),
  "Meeting Patterns": z.string(),
  Locations: z.string(),
  Instructors: z.string(),
  "Delivery Mode": z.string(),
});

type Course = {
  Course_Section: string;
  Offering_Period: string;
  Meeting_Patterns: string;
  Course_Section_End_Date: string;
  Course_Section_Start_Date: string;
  Locations: string;
  Subject: string;
  Course_Title: string;
};
export async function getCourseListingData(): Promise<{ courses: Course[] }> {
  try {
    const res = await fetch("/api/courses");
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/** @example M-R | 3:00 PM - 4:50 PM */
export const MEETING_RE =
  /^(?<days>[MTWRF](?:-[MTWRF])*)\s*\|\s*(?<start>\d{1,2}:\d{2}\s[AP]M)\s*-\s*(?<end>\d{1,2}:\d{2}\s[AP]M)$/;

export type RRuleDays = "MO" | "TU" | "WE" | "TH" | "FR";
export type MeetingPatternDays = "M" | "T" | "W" | "R" | "F";
export const MeetingPatternDaysToRRuleDays: Record<
  MeetingPatternDays,
  RRuleDays
> = {
  M: "MO",
  T: "TU",
  W: "WE",
  R: "TH",
  F: "FR",
};

export function parseMeetingPattern(meetingPattern: string) {
  const m = MEETING_RE.exec(meetingPattern);
  if (!m?.groups) throw new Error("Invalid meeting pattern.");

  const { days, start, end } = m.groups;
  return {
    days: days
      .split("-")
      .map((day) => MeetingPatternDaysToRRuleDays[day as MeetingPatternDays]),
    start,
    end,
  };
}

export function makeRRULEString(
  days: RRuleDays[],
  endDate: string, // "2025-10-10"
) {
  return `FREQ=WEEKLY;BYDAY=${days.join(",")};INTERVAL=1;UNTIL=${endDate.replace(/-/g, "")}T040000Z`;
}

export async function convertExcelRowsToEvents(
  calRows: z.infer<typeof excelCalendarSchema>[],
) {
  console.time("parsing");
  const data = await getCourseListingData();
  if (!data || !data.courses) throw new Error("Api route gone wrong.");

  const index = new Map<string, Course>();
  for (const c of data.courses)
    index.set(`${c.Course_Section}|${c.Offering_Period}`, c);

  const events: EventAttributes[] = [];

  for (const r of calRows) {
    const key = `${r["Course Section Definition"]}|${r["Academic Period"]}`;
    const course = index.get(key);
    if (!course) continue;

    const { days, start, end } = parseMeetingPattern(course.Meeting_Patterns);
    const recurrenceRule = makeRRULEString(
      days,
      course.Course_Section_End_Date,
    );

    events.push({
      start: new Date(`${course.Course_Section_Start_Date} ${start}`).getTime(),
      end: new Date(`${course.Course_Section_Start_Date} ${end}`).getTime(),
      recurrenceRule,
      location: course.Locations,
      categories: course.Subject.split("; "),
      title: course.Course_Title,
      busyStatus: "BUSY",
      status: "CONFIRMED",
      alarms: [
        {
          action: "display",
          description: "Reminder",
          trigger: { minutes: 15, before: true },
        },
      ],
    });
  }

  console.timeEnd("parsing");
  return events;
}

export function downloadICalFile(data: EventAttributes[]) {
  const filename = "classes.ics";
  const { error, value } = ics.createEvents(data);

  if (error) throw error;
  if (!value) throw new Error("Something went wrong");

  const blob = new File([value], filename, { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
