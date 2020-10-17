import RestClient from "../RestClient";
import { Info } from '../../types/Info';

export class InfoRepository {
    async read() {
        return await RestClient.get<Info>('/actuator/info');
    }
}