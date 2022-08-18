import { Question } from "./question.entity";

export class Theme {
    name: string;
    comment: string;
    questions: Question[];

    constructor(name?: string, comment?: string, questions?: Question[]) {
        this.name = name ?? "";
        this.comment = comment ?? "";
        this.questions = questions ?? [];
    }
}