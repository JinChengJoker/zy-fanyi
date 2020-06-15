import * as commander from "commander";
import {translate} from './index'

const program = new commander.Command();

program
  .version('0.0.1')
  .name('fanyi')
  .usage('<word>')
  .arguments('<word>');

program.action((word) => {
  translate(word)
})

program.parse(process.argv);