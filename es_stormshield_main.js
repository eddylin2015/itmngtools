let utils=require('./es_stormshield_log')
const { exec, spawn, fork } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'eschool> '
});

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'pull log':
      console.log('pull log!');
      utils.StormShieldCall();
      break;

    case 'put log':
      console.log('put log!');
      utils.PutLog2DBCall();
     break;

    case 'runapp':
      console.log('run app!');
      const n = fork(`${__dirname}/app.js`);
      n.on('message', (m) => {
        console.log('PARENT got message:', m);
      });
      // Causes the child to print: CHILD got message: { hello: 'world' }
      //n.send({ hello: 'world' });
      
    break;

  
    case 'help':
      console.log('pull log; put log');
      break;
    default:
      console.log(`Say what? I might have heard '${line.trim()}'`);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});