import { Theme } from "./theme.entity";

export class Round {
    name: string;
    themes: Theme[];

    constructor(name: string, themes?: Theme[]) {
        this.name = name;
        this.themes = themes ?? [];
    }
}