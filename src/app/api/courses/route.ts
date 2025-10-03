import z from "zod";

export async function GET() {
  const data = await cachedCourseListingApiData();

  if (!data) {
    return new Response(JSON.stringify({ error: "Upstream failed" }), {
      status: 502,
    });
  }

  return Response.json(data);
}

async function cachedCourseListingApiData() {
  "use cache";
  const resp = await fetch(
    "https://courselistings.wpi.edu/assets/prod-data.json",
    { cache: "force-cache" },
  );

  if (!resp.ok) {
    return undefined;
  }

  const data = await resp.json();

  const slim = (data.Report_Entry as any[]).map((c) => ({
    Course_Section: c.Course_Section,
    Offering_Period: c.Offering_Period,
    Meeting_Patterns: c.Meeting_Patterns,
    Course_Section_Start_Date: c.Course_Section_Start_Date,
    Course_Section_End_Date: c.Course_Section_End_Date,
    Locations: c.Locations,
    Subject: c.Subject,
    Course_Title: c.Course_Title,
  }));

  return { courses: slim };
}

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
