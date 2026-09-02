// Applicant professions — keep in sync with the server's
// src/app/constants/professions.ts (the API validates against that enum).
//
// A visa's document list depends on country + visa type + profession:
// a job holder needs an NOC and salary certificate, a businessperson a
// trade licence instead. Each country document requirement carries a
// `professions` tag; an empty tag means it applies to everyone.

export const PROFESSIONS = [
    { value: "job-holder", label: "Job Holder", labelBn: "চাকরিজীবী" },
    { value: "govt-job-holder", label: "Govt. Job Holder", labelBn: "সরকারি চাকরিজীবী" },
    { value: "businessperson", label: "Businessperson", labelBn: "ব্যবসায়ী" },
    { value: "doctor", label: "Doctor", labelBn: "ডাক্তার" },
    { value: "advocate", label: "Advocate / Lawyer", labelBn: "আইনজীবী" },
    { value: "student", label: "Student", labelBn: "শিক্ষার্থী" },
    { value: "child", label: "Child / Non-Student", labelBn: "শিশু / অছাত্র" },
    { value: "housewife", label: "House Wife", labelBn: "গৃহিণী" },
    { value: "retired", label: "Retired Person", labelBn: "অবসরপ্রাপ্ত" },
    { value: "unemployed", label: "Unemployed", labelBn: "বেকার" },
    { value: "other", label: "Other", labelBn: "অন্যান্য" },
];

export const professionLabel = (value, isBn = false) => {
    const p = PROFESSIONS.find((x) => x.value === value);
    if (!p) return value || "";
    return isBn ? p.labelBn : p.label;
};

/**
 * Documents a given profession must supply.
 * An empty/absent `professions` tag means the document applies to everyone,
 * so with no profession selected the caller still gets the common list.
 */
export const documentsForProfession = (documentRequirements = [], profession) =>
    documentRequirements.filter(
        (d) => !d.professions?.length || (profession && d.professions.includes(profession))
    );
