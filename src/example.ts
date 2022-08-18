import { textToObject } from './index';
import * as fs from 'fs/promises';
import { Parser } from './parser';
import { Packet } from './packet.entity';
import { SiqWriter } from './siqwriter';

async function test() {
    const text = (await fs.readFile(process.cwd() + '/data/packet.txt')).toString();

    const regexStr = "(?<price>\\d+)\\.(?<problem>.*?)\\nОтвет: (?<answer>.*?)\\n";
    const acceptableRegexStr = "(?:Зач.т: (?<accept>.*?)\\n)?";
    const commentRegexStr = "(?:Комментарий: (?<comment>.*?)\\n)?";
    const sourceRegexStr = "(?:Источник: (?<source>.*?)\\n)?";
    const questionRegexStr = regexStr + acceptableRegexStr + commentRegexStr + sourceRegexStr;
    
    const themeRegexStr = "Тема\\s\\d+[^а-яА-Яa-zA-Z\\d]*(?<name>.*?)\\n"
    const re = new RegExp(themeRegexStr, 'sig');

    const packet = Parser.textToPacket(text, questionRegexStr, themeRegexStr);
    // console.log(JSON.stringify(packet.rounds[0].themes, null, 2));
    await SiqWriter.packetToXml(packet);
    return ;

    // while (true) {  
    //     const regexArray = re.exec(text);
    //     if (regexArray === null) {
    //         break;
    //     }
    //     console.log("Найдено: " + regexArray[0]);
    //     console.log(regexArray.slice(1));
    //     console.log(regexArray.groups);
    //     console.log('\n');
    // }
}

test();