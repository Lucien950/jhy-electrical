export interface CanadaPostError {
	code: string;
	originalMessages: OriginalMessage[];
}

interface OriginalMessage {
	code: string;
	description: string;
}