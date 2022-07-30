import { Question } from "./question.entity";

export class Theme {
    name: string;
    questions: Question[];

    constructor(name: string, questions?: Question[]) {
        this.name = name;
        this.questions = questions ?? [];
    }
}