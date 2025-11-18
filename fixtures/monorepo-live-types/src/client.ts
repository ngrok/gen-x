export class ApiClient {
	constructor(private baseUrl: string) {}

	async fetch(path: string) {
		const response = await fetch(`${this.baseUrl}${path}`);
		return response.json();
	}
}
