import { Round } from "./round.entity";
import { v4 as uuidv4 } from "uuid";
export class Packet {
    name: string;
    author: string;
    date: Date;
    id: string;
    rounds: Round[];

    constructor(name: string, author: string, rounds?: Round[]) {
        this.name = name;
        this.author = author;
        this.date = new Date();
        this.id = uuidv4();
        this.rounds = rounds ?? [];
    }

}