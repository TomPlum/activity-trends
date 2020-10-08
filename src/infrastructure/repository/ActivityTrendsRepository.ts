import RestClient from "../RestClient";
import { InitialiseResponse } from '../../types/Common';

export class ActivityTrendsRepository {
    async initialise(): Promise<InitialiseResponse> {
        return await RestClient.get('/initialise')
    }
}