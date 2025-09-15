export interface ContactConfig {
	service: "formspree" | "netlify" | "custom" | "none";
	endpoint?: string;
}

export const contactConfig: ContactConfig = {
	service: "none",
	endpoint: "",
};
