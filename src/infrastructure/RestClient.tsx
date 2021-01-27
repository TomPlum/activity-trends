import fetch from 'isomorphic-unfetch';

class RestClient {
    private static readonly host = process.env.REACT_APP_BACKEND_URL

    static async get<T>(endpoint: string): Promise<APIResponse<T>> {
        return await RestClient.makeRestRequest<T>("GET", undefined, endpoint);
    }

    static async post<T>(endpoint: string, body: {}):  Promise<APIResponse<T>> {
        return await RestClient.makeRestRequest<T>("POST", body, endpoint);
    }
    

    private static async makeRestRequest<T>(method: string, body: object, endpoint: string): Promise<APIResponse<T>> {
        if (!this.host) {
            throw new ReferenceError('Host URI is not defined!');
        }

        if (!endpoint) {
            throw new ReferenceError("Endpoint is not defined!");
        }

        const URI = this.host + endpoint;
        console.log("Sending " + method + " request to " + URI);

        return await fetch(URI, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(async response => {
            if (response.ok) {
                const json = await response.json() as Promise<T>
                console.log("Successfully received " + response.status + " response", json);
                return {
                    data: json,
                    errors: []
                };
            } else {
                return {
                    data: undefined,
                    errors: [new Error(response.statusText)]
                };
            }
        }).catch(e => {
            console.log("An error occurred while making a request to " + endpoint, e);
            return {
                data: undefined,
                errors: [new Error(e)]
            }
        });
    }
}

export interface APIResponse<T> {
    data: Promise<T>;
    errors: Error[];
}

export default RestClient;