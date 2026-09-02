"use client";
import { LuGraduationCap } from "react-icons/lu";
import RemarksList from "../../_shared/RemarksList";

export default function CourseRemarksPage() {
    return <RemarksList service="course" title="Course Remarks" Icon={LuGraduationCap} accent="#D97706" />;
}
