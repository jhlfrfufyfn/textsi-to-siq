export class Question {
    price: number;
    problem: string;
    answer: string[];
    comment: string;
    source: string;

    constructor(price?: number, problem?: string, answer?: string[], comment?: string, source?: string) {
        this.price = price ?? -1;
        this.problem = problem ?? "";
        this.answer = answer ?? [];
        this.comment = comment ?? "";
        this.source = source ?? "";
    }

} 