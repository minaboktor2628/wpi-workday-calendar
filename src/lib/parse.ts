import z from "zod";

export const excelCalendarSchema = z.object({
  "Academic Period": z.string(),
  "Course Section Definition": z.string(),
  "Instructional Format": z.string(),
  "Meeting Patterns": z.string(),
  Locations: z.string(),
  Instructors: z.string(),
  "Delivery Mode": z.string(),
});

export const MEETING_RE =
  /^(?<days>[MTWRF](?:-[MTWRF])*)\s*\|\s*(?<start>\d{1,2}:\d{2}\s[AP]M)\s*-\s*(?<end>\d{1,2}:\d{2}\s[AP]M)$/;
