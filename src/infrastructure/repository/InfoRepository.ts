import RestClient from "../RestClient";
import { Info } from '../types/Info';

export class InfoRepository {
    async read(): Promise<Info> {
        const response = await RestClient.get<Info>('/actuator/info');

        if (response.data) {
            return response.data;
        }

        if (response.errors) {
            throw new Error(response.errors[0].message);
        }
    }
}