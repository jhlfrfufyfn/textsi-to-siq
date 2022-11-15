import * as fs from 'fs';
import * as fsPromise from 'fs/promises'
import { Parser } from '../src/parser';
import { SiqReader } from '../src/siqreader';


async function test() {
    const xml = (await fsPromise.readFile(process.cwd() + '/test/generated.xml')).toString();

    const packet = await SiqReader.XmlToPacket(xml);
    (await fsPromise.writeFile(process.cwd() + '/test/packetGeneratedFromXml.txt', JSON.stringify(packet, null, 4)));
}

test();