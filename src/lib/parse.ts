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

/**
 * {
    "Report_Entry": [
      {
        "Course_Section_Start_Date": "2025-08-21",
        "CF_LRV_Cluster_Ref_ID": "",
        "Student_Course_Section_Cluster": "",
        "Meeting_Patterns": "M-T-R-F | 9:00 AM - 9:50 AM",
        "Course_Title": "AB 1531 - Elementary Arabic I",
        "Locations": "Fuller Labs 311",
        "Instructional_Format": "Lecture",
        "Waitlist_Waitlist_Capacity": "0/9",
        "Course_Description": "<p>Cat. IAn intensive course to introduce the Arabic language to students with no background in Arabic. Oral language acquisition will stress structures and vocabulary required for basic communicative tasks. Emphasis will be on grammar, vocabulary, and writing system. Cultural aspects of Arabic-speaking countries introduced through course material.This course is closed to native speakers of Arabic and heritage speakers except with written permission from the instructor.</p>",
        "Public_Notes": "",
        "Subject": "Arabic",
        "Delivery_Mode": "In-Person",
        "Academic_Level": "Undergraduate",
        "Section_Status": "Waitlist",
        "Credits": "3",
        "Section_Details": "Fuller Labs 311 | M-T-R-F | 9:00 AM - 9:50 AM",
        "Instructors": "Mohammed El Hamzaoui",
        "Offering_Period": "2025 Fall A Term",
        "Starting_Academic_Period_Type": "A Term",
        "Course_Tags": "Degree Attribute :: Humanities and Arts; Offering Pattern :: Category I",
        "Academic_Units": "Humanities and Arts Department",
        "Course_Section": "AB 1531-A01 - Elementary Arabic I",
        "Enrolled_Capacity": "26/25",
        "Course_Section_End_Date": "2025-10-10",
        "Meeting_Day_Patterns": "M-T-R-F",
        "Course_Section_Owner": "Humanities and Arts Department"
      }
    ]
  }
 */
export const ReportEntrySchema = z.object({
  Course_Section_Start_Date: z.string(),
  CF_LRV_Cluster_Ref_ID: z.string(),
  Student_Course_Section_Cluster: z.string(),
  Meeting_Patterns: z.string(),
  Course_Title: z.string(),
  Locations: z.string(),
  Instructional_Format: z.string(),
  Waitlist_Waitlist_Capacity: z.string(),
  Course_Description: z.string(),
  Public_Notes: z.string(),
  Subject: z.string(),
  Delivery_Mode: z.string(),
  Academic_Level: z.string(),
  Section_Status: z.string(),
  Credits: z.string(),
  Section_Details: z.string(),
  Instructors: z.string(),
  Offering_Period: z.string(),
  Starting_Academic_Period_Type: z.string(),
  Course_Tags: z.string(),
  Academic_Units: z.string(),
  Course_Section: z.string(),
  Enrolled_Capacity: z.string(),
  Course_Section_End_Date: z.string(),
  Meeting_Day_Patterns: z.string(),
  Course_Section_Owner: z.string(),
});
export type ReportEntry = z.infer<typeof ReportEntrySchema>;

export const CourseListingApiSchema = z.object({
  Report_Entry: z.array(ReportEntrySchema),
});
export type CourseListingApi = z.infer<typeof CourseListingApiSchema>;

export async function getCourseListingData() {
  try {
    const res = await fetch("/api/courses");
    return CourseListingApiSchema.safeParse(await res.json());
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
  const { data, error } = await getCourseListingData();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Api route gone wrong.");

  const events: EventAttributes[] = [];

  for (const registedCourses of calRows) {
    for (const course of data.Report_Entry) {
      if (
        course.Course_Section ===
          registedCourses["Course Section Definition"] &&
        course.Offering_Period === registedCourses["Academic Period"]
      ) {
        const { days, start, end } = parseMeetingPattern(
          course.Meeting_Patterns,
        );

        const recurrenceRule = makeRRULEString(
          days,
          course.Course_Section_End_Date,
        );

        events.push({
          start: new Date(
            `${course.Course_Section_Start_Date} ${start}`,
          ).getTime(),
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
    }
  }

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
