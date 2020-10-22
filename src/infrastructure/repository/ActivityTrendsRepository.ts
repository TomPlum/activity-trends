import RestClient from "../RestClient";
import { InitialiseResponse } from '../types/Common';

export class ActivityTrendsRepository {
    async initialise(): Promise<InitialiseResponse> {
        const response = await RestClient.get<InitialiseResponse>('/initialise')
        if (response.data) {
            return response.data;
        }

        if (response.errors) {
            throw new Error(response.errors[0].message);
        }
    }
} 