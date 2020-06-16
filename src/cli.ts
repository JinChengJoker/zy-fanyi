import * as commander from "commander";
import {translate} from './index';

const program = new commander.Command();

program
  .version('0.1.0')
  .name('fanyi')
  .usage('<text>')
  .arguments('<text>')
  .action((text) => {
    translate(text)
  });

program.parse(process.argv);