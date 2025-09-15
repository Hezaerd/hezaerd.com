export interface Resume {
	fileName: string; // e.g., "resume.pdf"
	originalName: string; // Original file name from user
	size: number;
}

export const resume: Resume = {
	fileName: "",
	originalName: "",
	size: 0,
};
