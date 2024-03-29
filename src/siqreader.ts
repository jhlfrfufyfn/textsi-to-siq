import JSZip from "jszip";
import * as xmljs from 'xml-js';
import { Packet } from "./entities/packet.entity";
import { Question } from "./entities/question.entity";
import { Round } from "./entities/round.entity";
import { Theme } from "./entities/theme.entity";

export class SiqReader {
    static async SiqToXml(siq: Buffer) {
        const siqZip = new JSZip();
        let xml = null;
        const file = await siqZip.loadAsync(siq);
        if (file.files['content.xml']) {
            xml = await file.files['content.xml'].async('string');
        }
        return xml;
    }

    static async XmlToPacket(xml: string) {
        const packet = new Packet();
        const packetXml = JSON.parse(xmljs.xml2json(xml, { compact: true, trim: true }));
        packet.name = packetXml.package._attributes.name;
        packet.rounds = [];
        packet.author = "";
        let roundObjects = packetXml.package.rounds.round;
        if (!Array.isArray(roundObjects)) {
            roundObjects = [roundObjects];
        }
        for (const roundObject of roundObjects) {
            const round = new Round(roundObject._attributes.name);
            round.themes = [];
            const themeObjects = roundObject.themes.theme;
            for (const themeObject of themeObjects) {
                const theme = new Theme(themeObject._attributes.name);
                theme.questions = [];
                const questionObjects = themeObject.questions.question;
                for (const questionObject of questionObjects) {
                    if (!(questionObject.right.answer instanceof Array)) {
                        questionObject.right.answer = [questionObject.right.answer];
                    }
                    const answers = questionObject.right.answer.map((answer: any) => answer._text);
                    const question = new Question(
                        +questionObject._attributes.price,
                        questionObject.scenario.atom._text,
                        answers,
                        questionObject.info.comments._text,
                        questionObject.info.sources.source._text
                    );
                    theme.questions.push(question);
                }
                round.themes.push(theme);
            }
            packet.rounds.push(round);
        }
        return packet;
    }
}